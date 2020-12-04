package web

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"time"

	//"harbourbridge-web/models"
	"github.com/cloudspannerecosystem/harbourbridge/conversion"
	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/mysql"
	"github.com/cloudspannerecosystem/harbourbridge/postgres"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// TODO(searce):
// 1) Test cases for APIs
// 2) API for saving/updating table-level changes.
// 3) API for showing logs
// 4) Split all routing to an route.go file
// 5) API for downloading the schema file, ddl file and summary report file.
// 6) Update schema conv after setting global datatypes and return conv. (setTypeMap)
// 7) Add rateConversion() in schema conversion, ddl and report APIs.
// 8) Add an overview in summary report API

func homeLink(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to Harbourbridge!")
}

func databaseConnection(w http.ResponseWriter, r *http.Request) {
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var config DriverConfig
	err = json.Unmarshal(reqBody, &config)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}

	var dataSourceName string
	switch config.Driver {
	case "postgres":
		dataSourceName = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", config.Host, config.Port, config.User, config.Password, config.Database)
	case "mysql":
		dataSourceName = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", config.User, config.Password, config.Host, config.Port, config.Database)
	default:
		http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", config.Driver), 400)
		return
	}

	sourceDB, err := sql.Open(config.Driver, dataSourceName)
	if err != nil {
		http.Error(w, fmt.Sprintf("SQL connection error : %v", err), 500)
		return
	}
	// Open doesn't open a connection. Validate DSN data:
	err = sourceDB.Ping()
	if err != nil {
		http.Error(w, fmt.Sprintf("Connection Error: %v. Check Configuration again.", err), 500)
		return
	}
	app.sourceDB = sourceDB
	app.dbName = config.Database
	app.driver = config.Driver
	w.WriteHeader(http.StatusOK)
}

func convertSchemaSQL(w http.ResponseWriter, r *http.Request) {
	if app.sourceDB == nil || app.dbName == "" || app.driver == "" {
		http.Error(w, fmt.Sprintf("Database is not configured or Database connection is lost. Please set configuration and connect to database."), 404)
		return
	}
	conv := internal.MakeConv()
	var err error
	switch app.driver {
	case "mysql":
		err = mysql.ProcessInfoSchema(conv, app.sourceDB, app.dbName)
	case "postgres":
		err = postgres.ProcessInfoSchema(conv, app.sourceDB)
	default:
		http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", app.driver), 400)
		return
	}
	if err != nil {
		http.Error(w, fmt.Sprintf("Schema Conversion Error : %v", err), 404)
		return
	}
	app.conv = conv
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(conv)
}

func convertSchemaDump(w http.ResponseWriter, r *http.Request) {
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var dc DumpConfig
	err = json.Unmarshal(reqBody, &dc)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}
	f, err := os.Open(dc.FilePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to open the test data file: %v", err), 404)
		return
	}
	conv, err := conversion.SchemaConv(dc.Driver, &conversion.IOStreams{In: f, Out: os.Stdout})
	if err != nil {
		http.Error(w, fmt.Sprintf("Schema Conversion Error : %v", err), 404)
		return
	}
	app.conv = conv
	app.driver = dc.Driver
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(conv)
}

func getDDL(w http.ResponseWriter, r *http.Request) {
	c := ddl.Config{Comments: true, ProtectIds: false}
	var tables []string
	for t := range app.conv.SpSchema {
		tables = append(tables, t)
	}
	sort.Strings(tables)
	ddl := make(map[string]string)
	for _, t := range tables {
		ddl[t] = app.conv.SpSchema[t].PrintCreateTable(c)
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ddl)
}

func getSession(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	dbName, err := conversion.GetDatabaseName(app.driver, now)
	if err != nil {
		fmt.Printf("\nCan't get database name: %v\n", err)
		panic(fmt.Errorf("can't get database name"))
	}
	sessionFile := ".session.json"
	filePath := "frontend/"
	out := os.Stdout
	f, err := os.Create(filePath + dbName + sessionFile)
	if err != nil {
		fmt.Fprintf(out, "Can't create session file %s: %v\n", dbName+sessionFile, err)
		return
	}
	// Session file will basically contain 'conv' struct in JSON format.
	// It contains all the information for schema and data conversion state.
	convJSON, err := json.MarshalIndent(app.conv, "", " ")
	if err != nil {
		fmt.Fprintf(out, "Can't encode session state to JSON: %v\n", err)
		return
	}
	if _, err := f.Write(convJSON); err != nil {
		fmt.Fprintf(out, "Can't write out session file: %v\n", err)
		return
	}
	session := Session{Driver: app.driver, FilePath: filePath, FileName: dbName + sessionFile, CreatedAt: now}
	//fmt.Fprintf(out, "Wrote session to file '%s'.\n", dbName+sessionFile)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(session)
}

func resumeSession(w http.ResponseWriter, r *http.Request) {
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var s Session
	err = json.Unmarshal(reqBody, &s)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}
	f, err := os.Open(s.FilePath + s.FileName)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to open the session file: %v", err), 404)
		return
	}
	defer f.Close()

	sessionJSON, _ := ioutil.ReadAll(f)
	json.Unmarshal(sessionJSON, &app.conv)
	app.driver = s.Driver
	w.WriteHeader(http.StatusOK)
}

func getSummary(w http.ResponseWriter, r *http.Request) {
	reports := internal.AnalyzeTables(app.conv, nil)
	summary := make(map[string]string)
	for _, t := range reports {

		// h := fmt.Sprintf("Table %s", t.SrcTable)
		// if t.SrcTable != t.SpTable {
		// 	h = h + fmt.Sprintf(" (mapped to Spanner table %s)", t.SpTable)
		// }
		//w.WriteString(rateConversion(t.rows, t.badRows, t.cols, t.warnings, t.syntheticPKey != "", false))
		//w.WriteString("\n")
		var body string
		for _, x := range t.Body {
			body = body + x.Heading + "\n"
			for i, l := range x.Lines {
				body = body + fmt.Sprintf("%d) %s.\n", i+1, l) + "\n"
			}
		}
		summary[t.SrcTable] = body
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(summary)
}

type severity int

const (
	warning severity = iota
	note
)

func getTypeMap(w http.ResponseWriter, r *http.Request) {

	if app.conv == nil || app.driver == "" {
		http.Error(w, fmt.Sprintf("Schema is not converted or Driver is not configured properly. Please retry converting the database to spanner."), 404)
		return
	}

	var editTypeMap map[string][]typeIssue
	switch app.driver {
	case "mysql", "mysqldump":
		editTypeMap = mysqlTypeMap
	case "postgres", "pg_dump":
		editTypeMap = postgresTypeMap
	default:
		http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", app.driver), 400)
		return
	}

	// return a list of type-mapping for only the data-types
	// that are used in source schema.
	typeMap := make(map[string][]typeIssue)
	for _, srcTable := range app.conv.SrcSchema {
		for _, colDef := range srcTable.ColDefs {
			if _, ok := typeMap[colDef.Type.Name]; ok {
				continue
			}
			typeMap[colDef.Type.Name] = editTypeMap[colDef.Type.Name]
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(typeMap)
}

type setT map[string]string

func setTypeMap(w http.ResponseWriter, r *http.Request) {
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var t setT
	err = json.Unmarshal(reqBody, &t)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}
	i := 1
	for k, v := range t {
		//fmt.Printf("%d: key (`%T`)`%v`, value (`%T`)`%#v`\n", i, k, k, v, v)
		//fmt.Println(mysql.ToSpannerType[k].T.Name)
		mysql.ToSpannerType[k].T.Name = v
		i++
	}
	// for _, spTable := range conv.SpSchema {
	// 	for _, colDef := range spTable.ColDefs {
	// 		colDef.T.Name = mysql.ToSpannerType[k].T.Name
	// 	}
	// }
	w.WriteHeader(http.StatusOK)
	//json.NewEncoder(w).Encode(editTypeMap)
}

func setTypeMapGlobal(w http.ResponseWriter, r *http.Request) {
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var t setT
	err = json.Unmarshal(reqBody, &t)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}

	for k, v := range app.conv.SpSchema {
		for kk, _ := range v.ColDefs {
			for tk, tv := range t {
				sourceTable := app.conv.ToSource[k].Name
				sourceCol := app.conv.ToSource[k].Cols[kk]
				srcCol := app.conv.SrcSchema[sourceTable].ColDefs[sourceCol]
				if srcCol.Type.Name == tk {
					var ty ddl.Type
					var issues []internal.SchemaIssue
					switch app.driver {
					case "mysql", "mysqldump":
						ty, issues = toSpannerTypeMySQL(app.conv, srcCol.Type.Name, tv, srcCol.Type.Mods)
					case "pg_dump", "postgres":
						ty, issues = toSpannerTypePostgres(app.conv, srcCol.Type.Name, tv, srcCol.Type.Mods)
					default:
						http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", app.driver), 400)
						return
					}

					if len(srcCol.Type.ArrayBounds) > 1 {
						ty = ddl.Type{Name: ddl.String, Len: ddl.MaxLength}
						issues = append(issues, internal.MultiDimensionalArray)
					}
					if srcCol.Ignored.Default {
						issues = append(issues, internal.DefaultValue)
					}
					if srcCol.Ignored.AutoIncrement {
						issues = append(issues, internal.AutoIncrement)
					}
					if len(issues) > 0 {
						app.conv.Issues[sourceTable][srcCol.Name] = issues
					}
					ty.IsArray = len(srcCol.Type.ArrayBounds) == 1
					tempSpSchema := app.conv.SpSchema[k]
					tempColDef := tempSpSchema.ColDefs[kk]
					tempColDef.T = ty
					tempSpSchema.ColDefs[kk] = tempColDef
					app.conv.SpSchema[k] = tempSpSchema
				}
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(app.conv)
}
func remove(slice []string, s int) []string {
	return append(slice[:s], slice[s+1:]...)
}
func removePk(slice []ddl.IndexKey, s int) []ddl.IndexKey {
	return append(slice[:s], slice[s+1:]...)
}
func setTypeMapTableLevel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
		return
	}
	var t updateTable
	table := vars["table"]
	err = json.Unmarshal(reqBody, &t)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
		return
	}

	srcTableName := app.conv.ToSource[table].Name

	for colName, v := range t.UpdateCols {
		sp := app.conv.SpSchema[table]
		if v.Removed {
			for i, col := range sp.ColNames {
				if col == colName {
					sp.ColNames = remove(sp.ColNames, i)
					break
				}
			}
			if _, found := sp.ColDefs[colName]; found {
				delete(sp.ColDefs, colName)
			}
			for i, pk := range sp.Pks {
				if pk.Col == colName {
					sp.Pks = removePk(sp.Pks, i)
					break
				}
			}
			srcName := app.conv.ToSource[table].Cols[colName]
			delete(app.conv.ToSource[table].Cols, colName)
			delete(app.conv.ToSpanner[srcTableName].Cols, srcName)
			delete(app.conv.Issues[srcTableName], srcName)
			app.conv.SpSchema[table] = sp
			continue
		}
		newColName := colName
		if v.Rename != "" {
			for i, col := range sp.ColNames {
				if col == colName {
					sp.ColNames[i] = v.Rename
					break
				}
			}
			if _, found := sp.ColDefs[colName]; found {
				sp.ColDefs[v.Rename] = ddl.ColumnDef{
					Name:    v.Rename,
					T:       sp.ColDefs[colName].T,
					NotNull: sp.ColDefs[colName].NotNull,
					Comment: sp.ColDefs[colName].Comment,
					Disable: sp.ColDefs[colName].Disable,
				}
				delete(sp.ColDefs, colName)
			}
			for i, pk := range sp.Pks {
				if pk.Col == colName {
					sp.Pks[i].Col = v.Rename
					break
				}
			}
			srcName := app.conv.ToSource[table].Cols[colName]
			app.conv.ToSpanner[srcTableName].Cols[srcName] = v.Rename
			app.conv.ToSource[table].Cols[v.Rename] = srcName
			delete(app.conv.ToSource[table].Cols, colName)
			app.conv.SpSchema[table] = sp
			newColName = v.Rename
		}
		if v.PK != "" {
			if v.PK == "REMOVED" {
				for i, pk := range sp.Pks {
					if pk.Col == newColName {
						sp.Pks = removePk(sp.Pks, i)
						break
					}
				}
			}
			if v.PK == "ADDED" {
				sp.Pks = append(sp.Pks, ddl.IndexKey{Col: newColName, Desc: false})
			}
		}

		if v.ToType != "" {
			srcColName := app.conv.ToSource[table].Cols[newColName]
			srcCol := app.conv.SrcSchema[srcTableName].ColDefs[srcColName]
			var ty ddl.Type
			var issues []internal.SchemaIssue
			switch app.driver {
			case "mysql", "mysqldump":
				ty, issues = toSpannerTypeMySQL(app.conv, srcCol.Type.Name, v.ToType, srcCol.Type.Mods)
			case "pg_dump", "postgres":
				ty, issues = toSpannerTypePostgres(app.conv, srcCol.Type.Name, v.ToType, srcCol.Type.Mods)
			default:
				http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", app.driver), 400)
				return
			}
			if len(srcCol.Type.ArrayBounds) > 1 {
				ty = ddl.Type{Name: ddl.String, Len: ddl.MaxLength}
				issues = append(issues, internal.MultiDimensionalArray)
			}
			if srcCol.Ignored.Default {
				issues = append(issues, internal.DefaultValue)
			}
			if srcCol.Ignored.AutoIncrement {
				issues = append(issues, internal.AutoIncrement)
			}
			if len(issues) > 0 {
				app.conv.Issues[srcTableName][srcCol.Name] = issues
			}
			ty.IsArray = len(srcCol.Type.ArrayBounds) == 1
			tempColDef := sp.ColDefs[newColName]
			tempColDef.T = ty
			sp.ColDefs[newColName] = tempColDef
		}

		if len(v.Constraint) > 0 {
			for _, constraint := range v.Constraint {
				switch constraint {
				case "NOT NULL":
					spColDef := sp.ColDefs[newColName]
					spColDef.NotNull = true
					sp.ColDefs[newColName] = spColDef
				default:
					fmt.Println("skip")
				}
			}
		}

		app.conv.SpSchema[table] = sp

	}
	//	Removed columns
	// for _, v := range t.Removed {
	// 	sp := app.conv.SpSchema[table]
	// 	for i, col := range sp.ColNames {
	// 		if col == v {
	// 			sp.ColNames = remove(sp.ColNames, i)
	// 			break
	// 		}
	// 	}
	// 	if _, found := sp.ColDefs[v]; found {
	// 		delete(sp.ColDefs, v)
	// 	}
	// 	for i, pk := range sp.Pks {
	// 		if pk.Col == v {
	// 			sp.Pks = removePk(sp.Pks, i)
	// 			break
	// 		}
	// 	}
	// 	srcName := app.conv.ToSource[table].Cols[v]
	// 	delete(app.conv.ToSource[srcTableName].Cols, srcName)
	// 	delete(app.conv.ToSpanner[table].Cols, v)
	// 	delete(app.conv.Issues[srcTableName], srcName)
	// 	app.conv.SpSchema[table] = sp
	// }

	//	PK change
	// for col, v := range t.PKs {
	// 	sp := app.conv.SpSchema[table]
	// 	if !v {
	// 		for i, pk := range sp.Pks {
	// 			if pk.Col == col {
	// 				sp.Pks = removePk(sp.Pks, i)
	// 				break
	// 			}
	// 		}
	// 	}
	// 	if v {
	// 		sp.Pks = append(sp.Pks, ddl.IndexKey{Col: col, Desc: false})
	// 	}
	// 	app.conv.SpSchema[table] = sp
	// }

	// Change types
	// for k, v := range t.ColToType {
	// 	srcColName := app.conv.ToSource[table].Cols[k]
	// 	srcCol := app.conv.SrcSchema[srcTableName].ColDefs[srcColName]
	// 	var ty ddl.Type
	// 	var issues []internal.SchemaIssue
	// 	switch app.driver {
	// 	case "mysql", "mysqldump":
	// 		ty, issues = toSpannerTypeMySQL(app.conv, srcCol.Type.Name, v, srcCol.Type.Mods)
	// 	case "pg_dump", "postgres":
	// 		ty, issues = toSpannerTypePostgres(app.conv, srcCol.Type.Name, v, srcCol.Type.Mods)
	// 	default:
	// 		http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", app.driver), 400)
	// 		return
	// 	}
	// 	if len(srcCol.Type.ArrayBounds) > 1 {
	// 		ty = ddl.Type{Name: ddl.String, Len: ddl.MaxLength}
	// 		issues = append(issues, internal.MultiDimensionalArray)
	// 	}
	// 	if srcCol.Ignored.Default {
	// 		issues = append(issues, internal.DefaultValue)
	// 	}
	// 	if srcCol.Ignored.AutoIncrement {
	// 		issues = append(issues, internal.AutoIncrement)
	// 	}
	// 	if len(issues) > 0 {
	// 		app.conv.Issues[srcTableName][srcCol.Name] = issues
	// 	}
	// 	ty.IsArray = len(srcCol.Type.ArrayBounds) == 1
	// 	tempSpSchema := app.conv.SpSchema[table]
	// 	tempColDef := tempSpSchema.ColDefs[k]
	// 	tempColDef.T = ty
	// 	tempSpSchema.ColDefs[k] = tempColDef
	// 	app.conv.SpSchema[table] = tempSpSchema

	// }
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(app.conv)
}

func rateSchema(cols, warnings int64, missingPKey bool) string {
	switch {
	case cols == 0:
		return "GRAY"
	case warnings == 0 && !missingPKey:
		return "GREEN"
	case warnings == 0 && missingPKey:
		return "BLUE"
	case good(cols, warnings) && !missingPKey:
		return "BLUE"
	case good(cols, warnings) && missingPKey:
		return "BLUE"
	case ok(cols, warnings) && !missingPKey:
		return "YELLOW"
	case ok(cols, warnings) && missingPKey:
		return "YELLOW"
	case !missingPKey:
		return "RED"
	default:
		return "RED"
	}
}
func good(total, badCount int64) bool {
	return badCount < total/20
}

func ok(total, badCount int64) bool {
	return badCount < total/3
}
func getConversionRate(w http.ResponseWriter, r *http.Request) {
	reports := internal.AnalyzeTables(app.conv, nil)
	rate := make(map[string]string)
	for _, t := range reports {
		rate[t.SpTable] = rateSchema(t.Cols, t.Warnings, t.SyntheticPKey != "")
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(rate)
}

type App struct {
	sourceDB *sql.DB
	dbName   string
	driver   string
	conv     *internal.Conv
}

var app App

func WebApp() {

	fmt.Println("-------------------")
	router := getRoutes()
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))(router)))
}
