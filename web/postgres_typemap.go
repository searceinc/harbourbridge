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

package web

import (
	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
)

var postgresTypeMap = map[string][]typeIssue{
	"bool": []typeIssue{
		typeIssue{T: ddl.Bool},
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"boolean": []typeIssue{
		typeIssue{T: ddl.Bool},
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"bigserial": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Serial].Brief}},
	"bpchar": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes}},
	"character": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes}},
	"bytea": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Bytes}},
	"date": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Date}},
	"float8": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Float64}},
	"double precision": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Float64}},
	"float4": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Float64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"real": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Float64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"int8": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64}},
	"bigint": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64}},
	"int4": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"integer": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"int2": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"smallint": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Widened].Brief}},
	"numeric": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Float64, Brief: internal.IssueDB[internal.Numeric].Brief}},
	"serial": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Int64, Brief: internal.IssueDB[internal.Serial].Brief}},
	"text": []typeIssue{
		typeIssue{T: ddl.Bytes, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.String}},
	"timestamptz": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Timestamp}},
	"timestamp with time zone": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Timestamp}},
	"timestamp": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Timestamp, Brief: internal.IssueDB[internal.Timestamp].Brief}},
	"timestamp without time zone": []typeIssue{
		typeIssue{T: ddl.String, Brief: internal.IssueDB[internal.Widened].Brief},
		typeIssue{T: ddl.Timestamp, Brief: internal.IssueDB[internal.Timestamp].Brief}},
	"varchar": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Brief: internal.IssueDB[internal.Widened].Brief}},
	"character varying": []typeIssue{
		typeIssue{T: ddl.String},
		typeIssue{T: ddl.Bytes, Brief: internal.IssueDB[internal.Widened].Brief}},
}

func toSpannerTypePostgres(srcType string, spType string, mods []int64) (ddl.Type, []internal.SchemaIssue) {

	switch srcType {
	case "bool", "boolean":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		case ddl.Int64:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Bool}, nil
		}

	case "bigserial":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Serial}
		}
	case "bpchar", "character": // Note: Postgres internal name for char is bpchar (aka blank padded char).
		switch spType {
		case ddl.Bytes:
			if len(mods) > 0 {
				return ddl.Type{Name: ddl.Bytes, Len: mods[0]}, nil
			}
			return ddl.Type{Name: ddl.Bytes, Len: 1}, nil
		default:
			if len(mods) > 0 {
				return ddl.Type{Name: ddl.String, Len: mods[0]}, nil
			}
			// Note: bpchar without length specifier is equivalent to bpchar(1)
			return ddl.Type{Name: ddl.String, Len: 1}, nil
		}
	case "bytea":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, nil
		}
	case "date":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Date}, nil
		}
	case "float8", "double precision":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Float64}, nil
		}
	case "float4", "real":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Float64}, []internal.SchemaIssue{internal.Widened}
		}
	case "int8", "bigint":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, nil
		}
	case "int4", "integer":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		}
	case "int2", "smallint":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Widened}
		}
	case "numeric": // Map all numeric types to float64.
		switch spType {
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
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Int64}, []internal.SchemaIssue{internal.Serial}
		}
	case "text":
		switch spType {
		case ddl.Bytes:
			return ddl.Type{Name: ddl.Bytes, Len: ddl.MaxLength}, nil
		default:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, nil
		}
	case "timestamptz", "timestamp with time zone":
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Timestamp}, nil
		}
	case "timestamp", "timestamp without time zone":
		// Map timestamp without timezone to Spanner timestamp.
		switch spType {
		case ddl.String:
			return ddl.Type{Name: ddl.String, Len: ddl.MaxLength}, []internal.SchemaIssue{internal.Widened}
		default:
			return ddl.Type{Name: ddl.Timestamp}, []internal.SchemaIssue{internal.Timestamp}
		}
	case "varchar", "character varying":
		switch spType {
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
