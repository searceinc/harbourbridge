package web

import (
	"time"

	"github.com/cloudspannerecosystem/harbourbridge/internal"
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

type updateCol struct {
	Removed    bool     `json:"Removed"`
	Rename     string   `json:"Rename"`
	PK         string   `json:"PK"`
	Constraint []string `json:"Constraint"`
	ToType     string   `json:"ToType"`
}
type updateTable struct {
	UpdateCols map[string]updateCol `json:"UpdateCols"`
}
