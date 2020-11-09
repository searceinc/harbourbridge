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

var editTypeMap = map[string][]typeIssue{
	// "bool":    []{T: ddl.Bool, Issue: internal.SchemaIssue{-1}},
	"varchar": []typeIssue{
		typeIssue{T: ddl.String, Issue: internal.Widened, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Bytes, Issue: internal.Widened},
		typeIssue{T: ddl.Float64, Issue: internal.Widened}},
	"bool": []typeIssue{
		typeIssue{T: ddl.Bool},
		typeIssue{T: ddl.String, Issue: internal.Widened},
		typeIssue{T: ddl.Int64, Issue: internal.Widened}},
}
