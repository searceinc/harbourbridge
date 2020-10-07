package mysql

import (
	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
)

var toSpanner = map[string]struct {
	MaxMods int
	T       ddl.Type
	Issue   []internal.SchemaIssue
}{
	"bool":    {MaxMods: 0, T: ddl.Type{Name: ddl.Bool, Len: ddl.MaxLength}, Issue: nil},
	"varchar": {MaxMods: 0, T: ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, Issue: nil},
}
