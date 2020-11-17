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

type App struct {
	sourceDB *sql.DB
	dbName   string
	driver   string
	conv     *internal.Conv
}

var app App

func WebApp() {

	fmt.Println("-------------------")
	router := mux.NewRouter().StrictSlash(true)
	staticFileDirectory := http.Dir("./frontend/")
	staticFileHandler := http.StripPrefix("/frontend/", http.FileServer(staticFileDirectory))
	router.PathPrefix("/frontend/").Handler(staticFileHandler).Methods("GET")
	router.HandleFunc("/", homeLink)
	router.HandleFunc("/databaseConnection", databaseConnection).Methods("POST")
	router.HandleFunc("/convertSchema", convertSchemaSQL).Methods("GET")
	router.HandleFunc("/convertSchemaDump", convertSchemaDump).Methods("POST")
	router.HandleFunc("/getDDL", getDDL).Methods("GET")
	router.HandleFunc("/getSession", getSession).Methods("GET")
	router.HandleFunc("/resumeSession", resumeSession).Methods("POST")
	router.HandleFunc("/getSummary", getSummary).Methods("GET")
	router.HandleFunc("/getTypeMap", getTypeMap).Methods("GET")
	router.HandleFunc("/setTypeMap", setTypeMap).Methods("POST")

	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))(router)))
}
