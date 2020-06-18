// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package mysql

import (
	"database/sql"
	"database/sql/driver"
	"testing"

	"cloud.google.com/go/spanner"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/schema"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
	"github.com/stretchr/testify/assert"
)

type mockSpec struct {
	query string
	args  []driver.Value   // Query args.
	cols  []string         // Columns names for returned rows.
	rows  [][]driver.Value // Set of rows returned.
}

func TestProcessInfoSchemaMYSQL(t *testing.T) {
	ms := []mockSpec{
		{
			query: "SELECT table_schema, table_name FROM information_schema.tables where table_type = 'BASE TABLE'",
			cols:  []string{"table_schema", "table_name"},
			rows: [][]driver.Value{
				{"public", "cart"},
				{"public", "test"}},
		}, {
			query: "SELECT (.+) FROM information_schema.COLUMNS (.+)",
			args:  []driver.Value{"public", "cart"},
			cols:  []string{"column_name", "data_type", "column_type", "is_nullable", "column_default", "character_maximum_length", "numeric_precision", "numeric_scale"},
			rows: [][]driver.Value{
				{"productid", "text", "text", "NO", nil, nil, nil, nil},
				{"userid", "text", "text", "NO", nil, nil, nil, nil},
				{"quantity", "bigint", "bigint", "YES", nil, nil, 64, 0}},
		}, {
			query: "SELECT (.+) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS (.+)",
			args:  []driver.Value{"public", "cart"},
			cols:  []string{"column_name", "constraint_type"},
			rows: [][]driver.Value{
				{"productid", "PRIMARY KEY"},
				{"userid", "PRIMARY KEY"}},
		}, {
			query: "SELECT (.+) FROM information_schema.COLUMNS (.+)",
			args:  []driver.Value{"public", "test"},
			cols:  []string{"column_name", "data_type", "column_type", "is_nullable", "column_default", "character_maximum_length", "numeric_precision", "numeric_scale"},
			rows: [][]driver.Value{
				{"id", "bigint", "bigint", "NO", nil, nil, 64, 0},
				{"s", "set", "set", "YES", nil, nil, nil, nil},
				{"txt", "text", "text", "NO", nil, nil, nil, nil},
				{"b", "boolean", "boolean", "YES", nil, nil, nil, nil},
				{"bs", "bigint", "bigint", "NO", "nextval('test11_bs_seq'::regclass)", nil, 64, 0},
				{"bl", "blob", "blob", "YES", nil, nil, nil, nil},
				{"c", "char", "char(1)", "YES", nil, 1, nil, nil},
				{"c8", "char", "char(8)", "YES", nil, 8, nil, nil},
				{"d", "date", "date", "YES", nil, nil, nil, nil},
				{"f8", "double", "double", "YES", nil, nil, 53, nil},
				{"f4", "float", "float", "YES", nil, nil, 24, nil},
				{"i8", "bigint", "bigint", "YES", nil, nil, 64, 0},
				{"i4", "integer", "integer", "YES", nil, nil, 32, 0},
				{"i2", "smallint", "smallint", "YES", nil, nil, 16, 0},
				{"si", "integer", "integer", "NO", "nextval('test11_s_seq'::regclass)", nil, 32, 0},
				{"ts", "datetime", "datetime", "YES", nil, nil, nil, nil},
				{"tz", "timestamp", "timestamp", "YES", nil, nil, nil, nil},
				{"vc", "varchar", "varchar", "YES", nil, nil, nil, nil},
				{"vc6", "varchar", "varchar(6)", "YES", nil, 6, nil, nil}},
		},
		{
			query: "SELECT (.+) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS (.+)",
			args:  []driver.Value{"public", "test"},
			cols:  []string{"column_name", "constraint_type"},
			rows:  [][]driver.Value{{"id", "PRIMARY KEY"}},
		},
	}
	db := mkMockDb(t, ms)
	conv := internal.MakeConv()
	err := ProcessInfoSchema(conv, db)
	assert.Nil(t, err)
	expectedSchema := map[string]ddl.CreateTable{
		"cart": ddl.CreateTable{
			Name:     "cart",
			ColNames: []string{"productid", "userid", "quantity"},
			ColDefs: map[string]ddl.ColumnDef{
				"productid": ddl.ColumnDef{Name: "productid", T: ddl.String{Len: ddl.MaxLength{}}, NotNull: true},
				"userid":    ddl.ColumnDef{Name: "userid", T: ddl.String{Len: ddl.MaxLength{}}, NotNull: true},
				"quantity":  ddl.ColumnDef{Name: "quantity", T: ddl.Int64{}},
			},
			Pks: []ddl.IndexKey{ddl.IndexKey{Col: "productid"}, ddl.IndexKey{Col: "userid"}}},
		"test": ddl.CreateTable{
			Name:     "test",
			ColNames: []string{"id", "s", "txt", "b", "bs", "bl", "c", "c8", "d", "f8", "f4", "i8", "i4", "i2", "si", "ts", "tz", "vc", "vc6"},
			ColDefs: map[string]ddl.ColumnDef{
				"id":  ddl.ColumnDef{Name: "id", T: ddl.Int64{}, NotNull: true},
				"s":   ddl.ColumnDef{Name: "s", T: ddl.String{Len: ddl.MaxLength{}}, IsArray: true},
				"txt": ddl.ColumnDef{Name: "txt", T: ddl.String{Len: ddl.MaxLength{}}, NotNull: true},
				"b":   ddl.ColumnDef{Name: "b", T: ddl.Bool{}},
				"bs":  ddl.ColumnDef{Name: "bs", T: ddl.Int64{}, NotNull: true},
				"bl":  ddl.ColumnDef{Name: "bl", T: ddl.Bytes{Len: ddl.MaxLength{}}},
				"c":   ddl.ColumnDef{Name: "c", T: ddl.String{Len: ddl.Int64Length{Value: 1}}},
				"c8":  ddl.ColumnDef{Name: "c8", T: ddl.String{Len: ddl.Int64Length{Value: 8}}},
				"d":   ddl.ColumnDef{Name: "d", T: ddl.Date{}},
				"f8":  ddl.ColumnDef{Name: "f8", T: ddl.Float64{}},
				"f4":  ddl.ColumnDef{Name: "f4", T: ddl.Float64{}},
				"i8":  ddl.ColumnDef{Name: "i8", T: ddl.Int64{}},
				"i4":  ddl.ColumnDef{Name: "i4", T: ddl.Int64{}},
				"i2":  ddl.ColumnDef{Name: "i2", T: ddl.Int64{}},
				"si":  ddl.ColumnDef{Name: "si", T: ddl.Int64{}, NotNull: true},
				"ts":  ddl.ColumnDef{Name: "ts", T: ddl.Timestamp{}},
				"tz":  ddl.ColumnDef{Name: "tz", T: ddl.Timestamp{}},
				"vc":  ddl.ColumnDef{Name: "vc", T: ddl.String{Len: ddl.MaxLength{}}},
				"vc6": ddl.ColumnDef{Name: "vc6", T: ddl.String{Len: ddl.Int64Length{Value: 6}}},
			},
			Pks: []ddl.IndexKey{ddl.IndexKey{Col: "id"}}},
	}
	assert.Equal(t, expectedSchema, stripSchemaComments(conv.SpSchema))
	assert.Equal(t, len(conv.Issues["cart"]), 0)
	expectedIssues := map[string][]internal.SchemaIssue{
		"bs": []internal.SchemaIssue{internal.DefaultValue},
		"f4": []internal.SchemaIssue{internal.Widened},
		"i4": []internal.SchemaIssue{internal.Widened},
		"i2": []internal.SchemaIssue{internal.Widened},
		"si": []internal.SchemaIssue{internal.Widened, internal.DefaultValue},
		"ts": []internal.SchemaIssue{internal.Datetime},
	}
	assert.Equal(t, expectedIssues, conv.Issues["test"])
	assert.Equal(t, int64(0), conv.Unexpecteds())
}

// TODO : Remove this test
// This test is not required as this case is covered in data_test
// Because we have merged data_conversion functionality for Info_schema
// and dump in mysql. Thus,we are calling ProcessDataRow() directly from Infoschema
// which calls ConvertData() for data conversion.
func TestConvertSqlRow_SingleCol(t *testing.T) {
	//tDate, _ := time.Parse("2006-01-02", "2019-10-29")
	tc := []struct {
		name    string
		ty      ddl.ScalarType
		isArray bool
		srcTy   string      // Source DB type (Used by e.g. timestamp conversions).
		in      string      // Input value for conversion.
		e       interface{} // Expected result.
	}{
		{"bool", ddl.Bool{}, false, "", "1", true},
		{"bytes", ddl.Bytes{Len: ddl.MaxLength{}}, false, "", string([]byte{137, 80}), []byte{0x89, 0x50}}, // need some other approach to testblob type
		{"date", ddl.Date{}, false, "", "2019-10-29", getDate("2019-10-29")},
		{"float64", ddl.Float64{}, false, "", "42.6", float64(42.6)},
		{"int64", ddl.Int64{}, false, "", "42", int64(42)},
		{"string", ddl.String{Len: ddl.MaxLength{}}, false, "", "eh", "eh"},
		{"datetime", ddl.Timestamp{}, false, "datetime", "2019-10-29 05:30:00", getTimeWithoutTimezone(t, "2019-10-29 05:30:00")},
		{"timestamp", ddl.Timestamp{}, false, "timestamp", "2019-10-29 05:30:00", getTime(t, "2019-10-29T05:30:00+05:30")},
		{"string array(set)", ddl.String{Len: ddl.MaxLength{}}, true, "", "1,Travel,3,Dance", []spanner.NullString{
			spanner.NullString{StringVal: "1", Valid: true},
			spanner.NullString{StringVal: "Travel", Valid: true},
			spanner.NullString{StringVal: "3", Valid: true},
			spanner.NullString{StringVal: "Dance", Valid: true}}},
	}
	tableName := "testtable"
	for _, tc := range tc {
		col := "a"
		conv := internal.MakeConv()
		cols := []string{col}
		srcSchema := schema.Table{Name: tableName, ColNames: []string{col}, ColDefs: map[string]schema.Column{col: schema.Column{Type: schema.Type{Name: tc.srcTy}}}}
		spSchema := ddl.CreateTable{
			Name:     tableName,
			ColNames: []string{col},
			ColDefs:  map[string]ddl.ColumnDef{col: ddl.ColumnDef{Name: col, T: tc.ty, IsArray: tc.isArray}}}
		conv.TimezoneOffset = "+05:30"
		_, ac, av, err := ConvertData(conv, tableName, cols, srcSchema, tableName, cols, spSchema, []string{tc.in})
		assert.Equal(t, cols, ac)
		assert.Equal(t, []interface{}{tc.e}, av)
		assert.Nil(t, err)
	}
}

func TestConvertSqlRow_MultiCol(t *testing.T) {
	// Tests multi-column behavior of ProcessSqlData (including
	// handling of null columns and synthetic keys). Also tests
	// the combination of ProcessInfoSchema and ProcessSqlData
	// i.e. ProcessSqlData uses the schemas built by
	// ProcessInfoSchema.
	ms := []mockSpec{
		{
			query: "SELECT table_schema, table_name FROM information_schema.tables where table_type = 'BASE TABLE'",
			cols:  []string{"table_schema", "table_name"},
			rows:  [][]driver.Value{{"public", "test"}},
		}, {
			query: "SELECT (.+) FROM information_schema.COLUMNS (.+)",
			args:  []driver.Value{"public", "test"},
			cols:  []string{"column_name", "data_type", "column_type", "is_nullable", "column_default", "character_maximum_length", "numeric_precision", "numeric_scale"},
			rows: [][]driver.Value{
				{"a", "text", "text", "NO", nil, nil, nil, nil},
				{"b", "double", "double", "YES", nil, nil, 53, nil},
				{"c", "bigint", "bigint", "YES", nil, nil, 64, 0}},
		},
		{
			query: "SELECT (.+) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS (.+)",
			args:  []driver.Value{"public", "test"},
			cols:  []string{"column_name", "constraint_type"},
			rows:  [][]driver.Value{},
		},
		{
			query: "SELECT table_schema, table_name FROM information_schema.tables where table_type = 'BASE TABLE'",
			cols:  []string{"table_schema", "table_name"},
			rows:  [][]driver.Value{{"public", "test"}},
		}, {
			query: `SELECT a,b,c FROM public.test`, // query is a regexp!
			cols:  []string{"a", "b", "c"},
			rows: [][]driver.Value{
				{"cat", 42.3, nil},
				{"dog", nil, 22}},
		},
	}
	db := mkMockDb(t, ms)
	conv := internal.MakeConv()
	err := ProcessInfoSchema(conv, db)
	assert.Nil(t, err)
	expectedSchema := map[string]ddl.CreateTable{
		"test": ddl.CreateTable{
			Name:     "test",
			ColNames: []string{"a", "b", "c", "synth_id"},
			ColDefs: map[string]ddl.ColumnDef{
				"a":        ddl.ColumnDef{Name: "a", T: ddl.String{Len: ddl.MaxLength{}}, NotNull: true},
				"b":        ddl.ColumnDef{Name: "b", T: ddl.Float64{}},
				"c":        ddl.ColumnDef{Name: "c", T: ddl.Int64{}},
				"synth_id": ddl.ColumnDef{Name: "synth_id", T: ddl.Int64{}},
			},
			Pks: []ddl.IndexKey{ddl.IndexKey{Col: "synth_id"}}},
	}
	assert.Equal(t, expectedSchema, stripSchemaComments(conv.SpSchema))
	expectedIssues := map[string][]internal.SchemaIssue{}
	assert.Equal(t, expectedIssues, conv.Issues["test"])
	assert.Equal(t, int64(0), conv.Unexpecteds())
	conv.SetDataMode()
	var rows []spannerData
	conv.SetDataSink(
		func(table string, cols []string, vals []interface{}) {
			rows = append(rows, spannerData{table: table, cols: cols, vals: vals})
		})
	ProcessSqlData(conv, db)
	assert.Equal(t, []spannerData{
		{table: "test", cols: []string{"a", "b", "synth_id"}, vals: []interface{}{"cat", float64(42.3), int64(0)}},
		{table: "test", cols: []string{"a", "c", "synth_id"}, vals: []interface{}{"dog", int64(22), int64(-9223372036854775808)}}},
		rows)
	assert.Equal(t, int64(0), conv.Unexpecteds())
}

func TestSetRowStats(t *testing.T) {
	ms := []mockSpec{
		{
			query: "SELECT table_schema, table_name FROM information_schema.tables where table_type = 'BASE TABLE'",
			cols:  []string{"table_schema", "table_name"},
			rows:  [][]driver.Value{{"public", "test1"}, {"public", "test2"}},
		}, {
			query: `SELECT COUNT[(][*][)] FROM public.test1`,
			cols:  []string{"count"},
			rows:  [][]driver.Value{{5}},
		}, {
			query: `SELECT COUNT[(][*][)] FROM public.test2`,
			cols:  []string{"count"},
			rows:  [][]driver.Value{{142}},
		},
	}
	db := mkMockDb(t, ms)
	conv := internal.MakeConv()
	conv.SetDataMode()
	SetRowStats(conv, db)
	assert.Equal(t, int64(5), conv.Stats.Rows["test1"])
	assert.Equal(t, int64(142), conv.Stats.Rows["test2"])
	assert.Equal(t, int64(0), conv.Unexpecteds())
}

func mkMockDb(t *testing.T, ms []mockSpec) *sql.DB {
	db, mock, err := sqlmock.New()
	assert.Nil(t, err)
	for _, m := range ms {
		rows := sqlmock.NewRows(m.cols)
		for _, r := range m.rows {
			rows.AddRow(r...)
		}
		if len(m.args) > 0 {
			mock.ExpectQuery(m.query).WithArgs(m.args...).WillReturnRows(rows)
		} else {
			mock.ExpectQuery(m.query).WillReturnRows(rows)
		}

	}
	return db
}
