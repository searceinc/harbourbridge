package main

// import (
// 	"database/sql"
// 	"encoding/json"
// 	"fmt"
// 	"io/ioutil"
// 	"log"
// 	"net/http"
// 	"os"
// 	"sort"
// 	"time"

// 	//"harbourbridge-web/models"
// 	"github.com/cloudspannerecosystem/harbourbridge/conversion"
// 	"github.com/cloudspannerecosystem/harbourbridge/internal"
// 	"github.com/cloudspannerecosystem/harbourbridge/mysql"
// 	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
// 	_ "github.com/go-sql-driver/mysql"
// 	"github.com/gorilla/handlers"
// 	"github.com/gorilla/mux"
// 	_ "github.com/lib/pq"
// )

// var Version = "yess it works!!!!!!"

// type DriverConfig struct {
// 	Driver   string `json:"Driver"`
// 	Host     string `json:"Host"`
// 	Port     string `json:"Port"`
// 	Database string `json:"Database"`
// 	User     string `json:"User"`
// 	Password string `json:"Password"`
// }

// type DumpConfig struct {
// 	Driver   string `json:"Driver"`
// 	FilePath string `json:"Path"`
// }

// type typeIssue struct {
// 	T     string
// 	Issue internal.SchemaIssue
// }

// var editTypeMap = map[string][]typeIssue{
// 	// "bool":    []{T: ddl.Bool, Issue: internal.SchemaIssue{-1}},
// 	"varchar": []typeIssue{
// 		typeIssue{T: ddl.String, Issue: internal.Widened},
// 		typeIssue{T: ddl.Bytes, Issue: internal.Widened},
// 		typeIssue{T: ddl.Float64, Issue: internal.Widened}},
// 	"bool": []typeIssue{
// 		typeIssue{T: ddl.Bool},
// 		typeIssue{T: ddl.String, Issue: internal.Widened},
// 		typeIssue{T: ddl.Int64, Issue: internal.Widened}},
// }

// // var editTypeMap = map[string]struct {
// // 	T []string
// // 	Issue    []internal.SchemaIssue
// // }{
// // 	"bool":    {T: []string{ddl.Bool}, Issue: []internal.SchemaIssue{-1}},
// // 	"varchar": {T: []string{ddl.String, ddl.Bytes}, Issue: []internal.SchemaIssue{1}},
// // }

// func homeLink(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "Welcome to Harbourbridge!")
// }

// func databaseConnection(w http.ResponseWriter, r *http.Request) {
// 	reqBody, err := ioutil.ReadAll(r.Body)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
// 		return
// 	}
// 	var config DriverConfig
// 	err = json.Unmarshal(reqBody, &config)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
// 		return
// 	}

// 	var dataSourceName string
// 	switch config.Driver {
// 	case "postgres":
// 		dataSourceName = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", config.Host, config.Port, config.User, config.Password, config.Database)
// 	case "mysql":
// 		dataSourceName = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", config.User, config.Password, config.Host, config.Port, config.Database)
// 	default:
// 		http.Error(w, fmt.Sprintf("Driver : '%s' is not supported", config.Driver), 400)
// 		return
// 	}

// 	sourceDB, err := sql.Open(config.Driver, dataSourceName)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("SQL connection error : %v", err), 500)
// 		return
// 	}
// 	// Open doesn't open a connection. Validate DSN data:
// 	err = sourceDB.Ping()
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Connection Error: %v. Check Configuration again.", err), 500)
// 		return
// 	}
// 	app.sourceDB = sourceDB
// 	app.dbName = config.Database
// 	w.WriteHeader(http.StatusOK)
// }

// func convertSchemaSQL(w http.ResponseWriter, r *http.Request) {
// 	if app.sourceDB == nil || app.dbName == "" {
// 		http.Error(w, fmt.Sprintf("Database is not configured or Database connection is lost. Please set configuration and connect to database."), 404)
// 		return
// 	}
// 	conv := internal.MakeConv()
// 	err := mysql.ProcessInfoSchema(conv, app.sourceDB, app.dbName)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Schema Conversion Error : %v", err), 404)
// 		return
// 	}
// 	app.conv = conv
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(conv)
// }

// func convertSchemaDump(w http.ResponseWriter, r *http.Request) {
// 	reqBody, err := ioutil.ReadAll(r.Body)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
// 		return
// 	}
// 	var dc DumpConfig
// 	err = json.Unmarshal(reqBody, &dc)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
// 		return
// 	}
// 	f, err := os.Open(dc.FilePath)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("failed to open the test data file: %v", err), 404)
// 		return
// 	}
// 	conv, err := conversion.SchemaConv(dc.Driver, &conversion.IOStreams{In: f, Out: os.Stdout})
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Schema Conversion Error : %v", err), 404)
// 		return
// 	}
// 	app.conv = conv
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(conv)
// }

// func getDDL(w http.ResponseWriter, r *http.Request) {
// 	c := ddl.Config{Comments: true, ProtectIds: false}
// 	var tables []string
// 	for t := range app.conv.SpSchema {
// 		tables = append(tables, t)
// 	}
// 	sort.Strings(tables)
// 	ddl := make(map[string]string)
// 	for _, t := range tables {
// 		ddl[t] = app.conv.SpSchema[t].PrintCreateTable(c)
// 	}
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(ddl)
// }

// func getSession(w http.ResponseWriter, r *http.Request) {
// 	now := time.Now()
// 	dbName, err := conversion.GetDatabaseName("mysql", now)
// 	if err != nil {
// 		fmt.Printf("\nCan't get database name: %v\n", err)
// 		panic(fmt.Errorf("can't get database name"))
// 	}
// 	sessionFile := ".session.json"
// 	out := os.Stdout
// 	f, err := os.Create(dbName + sessionFile)
// 	if err != nil {
// 		fmt.Fprintf(out, "Can't create session file %s: %v\n", dbName+sessionFile, err)
// 		return
// 	}
// 	// Session file will basically contain 'conv' struct in JSON format.
// 	// It contains all the information for schema and data conversion state.
// 	convJSON, err := json.MarshalIndent(app.conv, "", " ")
// 	if err != nil {
// 		fmt.Fprintf(out, "Can't encode session state to JSON: %v\n", err)
// 		return
// 	}
// 	if _, err := f.Write(convJSON); err != nil {
// 		fmt.Fprintf(out, "Can't write out session file: %v\n", err)
// 		return
// 	}
// 	fmt.Fprintf(out, "Wrote session to file '%s'.\n", dbName+sessionFile)
// 	//json.NewEncoder(w).Encode()
// }

// func getSummary(w http.ResponseWriter, r *http.Request) {
// 	reports := internal.AnalyzeTables(app.conv, nil)
// 	summary := make(map[string]string)
// 	for _, t := range reports {

// 		// h := fmt.Sprintf("Table %s", t.SrcTable)
// 		// if t.SrcTable != t.SpTable {
// 		// 	h = h + fmt.Sprintf(" (mapped to Spanner table %s)", t.SpTable)
// 		// }
// 		//w.WriteString(rateConversion(t.rows, t.badRows, t.cols, t.warnings, t.syntheticPKey != "", false))
// 		//w.WriteString("\n")
// 		var body string
// 		for _, x := range t.Body {
// 			body = body + x.Heading + "\n"
// 			for i, l := range x.Lines {
// 				body = body + fmt.Sprintf("%d) %s.\n", i+1, l) + "\n"
// 			}
// 		}
// 		summary[t.SrcTable] = body
// 	}
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(summary)
// }

// var issueDB = map[internal.SchemaIssue]struct {
// 	brief    string // Short description of issue.
// 	severity severity
// }{
// 	internal.DefaultValue: {brief: "Some columns have default values which Spanner does not support", severity: warning},
// 	// ForeignKey:            {brief: "Spanner does not support foreign keys", severity: warning},
// 	// MultiDimensionalArray: {brief: "Spanner doesn't support multi-dimensional arrays", severity: warning},
// 	// NoGoodType:            {brief: "No appropriate Spanner type", severity: warning},
// 	// Numeric:               {brief: "Spanner does not support numeric. This type mapping could lose precision and is not recommended for production use", severity: warning},
// 	// NumericThatFits:       {brief: "Spanner does not support numeric, but this type mapping preserves the numeric's specified precision", severity: note},
// 	// Decimal:               {brief: "Spanner does not support decimal. This type mapping could lose precision and is not recommended for production use", severity: warning},
// 	// DecimalThatFits:       {brief: "Spanner does not support decimal, but this type mapping preserves the decimal's specified precision", severity: note},
// 	// Serial:                {brief: "Spanner does not support autoincrementing types", severity: warning},
// 	// AutoIncrement:         {brief: "Spanner does not support auto_increment attribute", severity: warning},
// 	// Timestamp:             {brief: "Spanner timestamp is closer to PostgreSQL timestamptz", severity: note, batch: true},
// 	// Datetime:              {brief: "Spanner timestamp is closer to MySQL timestamp", severity: note, batch: true},
// 	// Time:                  {brief: "Spanner does not support time/year types", severity: note, batch: true},
// 	internal.Widened: {brief: "Some columns will consume more storage in Spanner", severity: note},
// }

// type severity int

// const (
// 	warning severity = iota
// 	note
// )

// func getTypeMap(w http.ResponseWriter, r *http.Request) {
// 	//fmt.Println(IssueDB[1].brief)
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(editTypeMap)
// }

// type setT map[string]string

// func setTypeMap(w http.ResponseWriter, r *http.Request) {
// 	reqBody, err := ioutil.ReadAll(r.Body)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), 500)
// 		return
// 	}
// 	var t setT
// 	err = json.Unmarshal(reqBody, &t)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), 400)
// 		return
// 	}
// 	i := 1
// 	for k, v := range t {
// 		//fmt.Printf("%d: key (`%T`)`%v`, value (`%T`)`%#v`\n", i, k, k, v, v)
// 		//fmt.Println(mysql.ToSpannerType[k].T.Name)
// 		mysql.ToSpannerType[k].T.Name = v
// 		i++
// 	}
// 	w.WriteHeader(http.StatusOK)
// 	//json.NewEncoder(w).Encode(editTypeMap)
// }

// // func writeSchemaFile(conv *internal.Conv, now time.Time, name string, out *os.File) {
// // 	f, err := os.Create(name)
// // 	if err != nil {
// // 		fmt.Fprintf(out, "Can't create schema file %s: %v\n", name, err)
// // 		return
// // 	}
// // 	// The schema file we write out includes comments, and doesn't add backticks
// // 	// around table and column names. This file is intended for explanatory
// // 	// and documentation purposes, and is not strictly legal Cloud Spanner DDL
// // 	// (Cloud Spanner doesn't currently support comments). Change 'Comments'
// // 	// to false and 'ProtectIds' to true to write out a schema file that is
// // 	// legal Cloud Spanner DDL.
// // 	ddl := conv.GetDDL(ddl.Config{Comments: true, ProtectIds: false})
// // 	if len(ddl) == 0 {
// // 		ddl = []string{"\n-- Schema is empty -- no tables found\n"}
// // 	}
// // 	l := []string{
// // 		fmt.Sprintf("-- Schema generated %s\n", now.Format("2006-01-02 15:04:05")),
// // 		strings.Join(ddl, ";\n\n"),
// // 		"\n",
// // 	}
// // 	if _, err := f.WriteString(strings.Join(l, "")); err != nil {
// // 		fmt.Fprintf(out, "Can't write out schema file: %v\n", err)
// // 		return
// // 	}
// // 	fmt.Fprintf(out, "Wrote schema to file '%s'.\n", name)
// // }

// type App struct {
// 	sourceDB *sql.DB
// 	dbName   string
// 	conv     *internal.Conv
// }

// var app App

// func WebApp() {

// 	router := mux.NewRouter().StrictSlash(true)
// 	router.HandleFunc("/", homeLink)
// 	router.HandleFunc("/databaseConnection", databaseConnection).Methods("POST")
// 	router.HandleFunc("/convertSchema", convertSchemaSQL).Methods("GET")
// 	router.HandleFunc("/convertSchemaDump", convertSchemaDump).Methods("POST")
// 	router.HandleFunc("/getDDL", getDDL).Methods("GET")
// 	router.HandleFunc("/getSession", getSession).Methods("GET")
// 	router.HandleFunc("/getSummary", getSummary).Methods("GET")
// 	router.HandleFunc("/getTypeMap", getTypeMap).Methods("GET")
// 	router.HandleFunc("/setTypeMap", setTypeMap).Methods("POST")

// 	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))(router)))
// }
