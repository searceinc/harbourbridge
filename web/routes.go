package web

import (
	"net/http"

	"github.com/gorilla/mux"
)

func getRoutes() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	staticFileDirectory := http.Dir("./frontend/")
	staticFileHandler := http.StripPrefix("/frontend/", http.FileServer(staticFileDirectory))
	router.PathPrefix("/frontend/").Handler(staticFileHandler).Methods("GET")
	router.HandleFunc("/", homeLink)
	router.HandleFunc("/connect", databaseConnection).Methods("POST")
	router.HandleFunc("/convert/infoschema", convertSchemaSQL).Methods("GET")
	router.HandleFunc("/convert/dump", convertSchemaDump).Methods("POST")
	router.HandleFunc("/ddl", getDDL).Methods("GET")
	router.HandleFunc("/session", getSession).Methods("GET")
	router.HandleFunc("/session/resume", resumeSession).Methods("POST")
	router.HandleFunc("/summary", getSummary).Methods("GET")
	router.HandleFunc("/conversion", getConversionRate).Methods("GET")
	router.HandleFunc("/typemap", getTypeMap).Methods("GET")
	router.HandleFunc("/filepaths", getSchemaAndReportFile).Methods("GET")
	router.HandleFunc("/typemap/global", setTypeMapGlobal).Methods("POST")
	router.HandleFunc("/typemap/table/{table}", setTypeMapTableLevel).Methods("POST")
	return router
}
