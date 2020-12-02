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

type updateTable struct {
	TableName string            `json:"TableName"`
	ColToType map[string]string `json:"ColToType"`
}

// TODO(searce): Decide on the issue message that needs to be shown
// in frontend.
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

// TODO(searce): Fill up this datatype mapping
var postgresTypeMap = map[string][]typeIssue{}

func toSpannerType(conv *internal.Conv, id string, toType string, mods []int64) (ddl.Type, []internal.SchemaIssue) {

	switch id {
	case "bool", "boolean":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		case ddl.Int64:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Bool}, nil
		}

	case "bigserial":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Serial}
		}
	case "bpchar", "character": // Note: Postgres internal name for char is bpchar (aka blank padded char).
		switch toType {
		case ddl.Bytes:
			if len(mods) > 0 {
				return ddl.Type{Name: ddl.Bytes, Len: mods[0]}, nil
			}
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, nil
		default:
			if len(mods) > 0 {
				return ddl.Type{Name: ddl.String, Len: mods[0]}, nil
			}
			// Note: bpchar without length specifier is equivalent to bpchar(1)
			return ddl.Type{Name: ddl.String, Len: 1}, nil
		}
	case "bytea":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, nil
		}
	case "date":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Date}, nil
		}
	case "float8", "double precision":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Float64}, nil
		}
	case "float4", "real":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Float64}, []internal.SchemaIssue{internal.Widened}
		}
	case "int8", "bigint":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, nil
		}
	case "int4", "integer":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		}
	case "int2", "smallint":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		}
	case "numeric": // Map all numeric types to float64.
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			if len(mods) > 0 && mods[0] <= 15 {
				// float64 can represent this numeric type faithfully.
				// Note: int64 has 53 bits for mantissa, which is ~15.96
				// decimal digits.
				return ddl.Type{Name: ddl.Float64}, []internal.SchemaIssue{internal.NumericThatFits}
			}
			return ddl.Type{Name: ddl.Float64}, []internal.SchemaIssue{internal.Numeric}
		}
	case "serial":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Serial}
		}
	case "text":
		switch toType {
		case ddl.Bytes:
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, nil
		}
	case "timestamptz", "timestamp with time zone":
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Timestamp}, nil
		}
	case "timestamp", "timestamp without time zone":
		// Map timestamp without timezone to Spanner timestamp.
		switch toType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Timestamp}, []internal.SchemaIssue{internal.Timestamp}
		}
	case "varchar", "character varying":
		switch toType {
		case ddl.Bytes:
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			if len(mods) > 0 {
				return ddl.Type{Name: ddl.String, Len: mods[0]}, nil
			}
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, nil
		}
	}
	return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.NoGoodType}
}
