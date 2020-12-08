package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/schema"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
	"github.com/stretchr/testify/assert"
)

func TestHomeLink(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(homeLink)

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body is what we expect.
	expected := `Welcome to Harbourbridge!`
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestGetTypeMap(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	req, err := http.NewRequest("GET", "/typemap", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getTypeMap)

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusNotFound {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusNotFound)
	}

}

func TestGetTypeMapSuccess(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	app.driver = "postgres"
	app.conv = internal.MakeConv()
	req, err := http.NewRequest("GET", "/typemap", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getTypeMap)

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

}

func TestSetTypeMapTableLevelSuccess(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	app.driver = "postgres"
	app.conv = internal.MakeConv()
	fillConv(app.conv)

	payload := fmt.Sprintf(`
    {
      "UpdateCols":{
		"c2": {
        	"Removed": false,
			"Rename":"",
			"PK":"",
			"Constraint":[],
			"ToType":"STRING"
      	}
	}
    }`)
	req, err := http.NewRequest("POST", "/typemap/table?table=t1", strings.NewReader(payload))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(setTypeMapTableLevel)

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)
	var res *internal.Conv
	json.Unmarshal(rr.Body.Bytes(), &res)
	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	expectedSchema := map[string]ddl.CreateTable{
		"t1": ddl.CreateTable{
			Name:     "t1",
			ColNames: []string{"c1", "c2"},
			ColDefs: map[string]ddl.ColumnDef{
				"c1": ddl.ColumnDef{Name: "c1", T: ddl.Type{Name: ddl.String, Len: 50}, NotNull: false},
				"c2": ddl.ColumnDef{Name: "c2", T: ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, NotNull: false},
			},
			Pks: []ddl.IndexKey{
				ddl.IndexKey{Col: "c1", Desc: false},
			},
		}}

	// if res.SpSchema["t1"].ColDefs["c2"].T.Name != "STRING" {
	// 	t.Errorf("handler returned wrong type: got %v want %v",
	// 		res.SpSchema["t1"].ColDefs["c2"].T.Name, "STRING")
	// }
	assert.Equal(t, expectedSchema["t1"], res.SpSchema["t1"])
	assert.Equal(t, 1, len(res.Issues["t1"]["c2"]))

}

func fillConv(conv *internal.Conv) {
	conv.SrcSchema = map[string]schema.Table{
		"t1": schema.Table{
			Name:     "t1",
			ColNames: []string{"c_", "c2"},
			ColDefs: map[string]schema.Column{
				"c_": schema.Column{Name: "c_", Type: schema.Type{Name: "varchar", Mods: []int64{50}}},
				"c2": schema.Column{Name: "c2", Type: schema.Type{Name: "smallint"}},
			},
			PrimaryKeys: []schema.Key{
				schema.Key{Column: "c_", Desc: false},
			},
		},
		"_t2": schema.Table{
			Name:     "_t2",
			ColNames: []string{"c3", "c4"},
			ColDefs: map[string]schema.Column{
				"c3": schema.Column{Name: "c3", Type: schema.Type{Name: "varchar", Mods: []int64{50}}},
				"c4": schema.Column{Name: "c4", Type: schema.Type{Name: "smallint"}},
			},
			PrimaryKeys: []schema.Key{
				schema.Key{Column: "c3", Desc: false},
			},
		},
	}
	conv.SpSchema = map[string]ddl.CreateTable{
		"t1": ddl.CreateTable{
			Name:     "t1",
			ColNames: []string{"c1", "c2"},
			ColDefs: map[string]ddl.ColumnDef{
				"c1": ddl.ColumnDef{Name: "c1", T: ddl.Type{Name: ddl.String, Len: 50}, NotNull: false},
				"c2": ddl.ColumnDef{Name: "c2", T: ddl.Type{Name: ddl.Int64}, NotNull: false},
			},
			Pks: []ddl.IndexKey{
				ddl.IndexKey{Col: "c1", Desc: false},
			},
		},
		"At2": ddl.CreateTable{
			Name:     "At2",
			ColNames: []string{"c3", "c4"},
			ColDefs: map[string]ddl.ColumnDef{
				"c3": ddl.ColumnDef{Name: "c3", T: ddl.Type{Name: ddl.String, Len: 50}, NotNull: false},
				"c4": ddl.ColumnDef{Name: "c4", T: ddl.Type{Name: ddl.Int64}, NotNull: false},
			},
			Pks: []ddl.IndexKey{
				ddl.IndexKey{Col: "c3", Desc: false},
			},
		},
	}
	conv.ToSource = map[string]internal.NameAndCols{
		"t1": internal.NameAndCols{
			Name: "t1",
			Cols: map[string]string{"c1": "c_", "c2": "c2"}},
		"At2": internal.NameAndCols{
			Name: "_t2",
			Cols: map[string]string{"c3": "c3", "c4": "c4"}},
	}
	conv.ToSpanner = map[string]internal.NameAndCols{
		"t1": internal.NameAndCols{
			Name: "t1",
			Cols: map[string]string{"c_": "c1", "c2": "c2"}},
		"_t2": internal.NameAndCols{
			Name: "At2",
			Cols: map[string]string{"c3": "c3", "c4": "c4"}},
	}
	conv.Issues = map[string]map[string][]internal.SchemaIssue{
		"t1":  make(map[string][]internal.SchemaIssue),
		"_t2": make(map[string][]internal.SchemaIssue),
	}
}
