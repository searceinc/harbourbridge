package web

import (
	"time"

	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
)

type DriverConfig struct {
	Driver   string `json:"Driver"`
	Host     string `json:"Host"`
	Port     string `json:"Port"`
	Database string `json:"Database"`
	User     string `json:"User"`
	Password string `json:"Password"`
}

type DumpConfig struct {
	Driver   string `json:"Driver"`
	FilePath string `json:"Path"`
}

type Session struct {
	Driver    string    `json:"driver"`
	FilePath  string    `json:"path"`
	FileName  string    `json:"fileName"`
	CreatedAt time.Time `json:"createdAt"`
}

type Summary struct {
	Heading string
	Lines   []string
	Rate    string
}
type typeIssue struct {
	T     string
	Issue internal.SchemaIssue
	Brief string
}

var mysqlTypeMap = map[string][]typeIssue{
	"bool": []typeIssue{
		typeIssue{T: ddl.Bool},
		typeIssue{T: ddl.String, Issue: internal.Widened},
		typeIssue{T: ddl.Int64, Issue: internal.Widened}},
	"varchar": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened, Brief: internal.IssueDB[internal.Widened].Brief}},
	"char": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"text": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"tinytext": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"mediumtext": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"longtext": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"set": []typeIssue{
		typeIssue{T: ddl.String, Brief: "SET datatype only supports STRING values"}},
	"enum": []typeIssue{
		typeIssue{T: ddl.String, Brief: "ENUM datatype only supports STRING values"}},
	"json": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened}},
	"bit": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"binary": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"varbinary": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"blob": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"tinyblob": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"mediumblob": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"longblob": []typeIssue{
		typeIssue{T: ddl.Bytes},
		typeIssue{T: ddl.String}},
	"tinyint": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened, Brief: internal.IssueDB[internal.Widened].Brief}},
	"smallint": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"mediumint": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"int": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"integer": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"bigint": []typeIssue{
		typeIssue{T: ddl.Int64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"double": []typeIssue{
		typeIssue{T: ddl.Float64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"float": []typeIssue{
		typeIssue{T: ddl.Float64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"numeric": []typeIssue{
		typeIssue{T: ddl.Float64},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"date": []typeIssue{
		typeIssue{T: ddl.Date},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"datetime": []typeIssue{
		typeIssue{T: ddl.Timestamp},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"timestamp": []typeIssue{
		typeIssue{T: ddl.Timestamp},
		typeIssue{T: ddl.String, Issue: internal.Widened}},
	"time": []typeIssue{
		typeIssue{T: ddl.String}},
	"year": []typeIssue{
		typeIssue{T: ddl.String}},
}

var postgresTypeMap = map[string][]typeIssue{}
