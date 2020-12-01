// variables initialisation
const RED = '#F44336'
let globalDataTypes = null;
let dataTypeArray = null;
let uncheckCount = [];
var importSchemaObj = {};
var schemaConversionObj_original = {};
var sourceTableFlag = 'Source';
var reportAccCount = 0;
var summaryAccCount = 0;
var ddlAccCount = 0;
var tableListArea = 'accordion';
var tabSearchInput = 'reportSearchInput';
var isLive = true;
var expanded = false;
var mySelect;
var y, z, i, div1, div5, summaryDataResp, span2;
var srcPlaceholder = [];
var spPlaceholder = [];
var selectedConstraints = [];
var pkArray = [];
var sessionStorageArr = [];
var initialPkSeqId = [];
var keyColumnMap = [];
var currSeqId;
var keyColumnObj, keyIconValue;
var pkSeqId = [];
var src_table_name = [];
var maxSeqId;
var count_src = [];
var count_sp = [];
var notPkArray = [];
var initialColNameArray = [];
var pkFoundFlag;
var spConstraintHtml;
var notNullFound;
var notNullFoundFlag = [];
var uniqueFoundFlag = [];
var uniqueFound;
var autoIncrementFound;
var notPrimary = [];
var pksSp = [];
var pkFlag;
var primaryTabCell = [];
var constraintTabCell = [];
// var apiUrl = 'https://7b53da843ddc.ngrok.io';
var apiUrl = '';
var notFoundTxt;
notFoundTxt = document.createElement('h5');
notFoundTxt.innerHTML = `No Match Found`;
notFoundTxt.className = 'noText';

/**
 * Function to fetch panel border color based on conversion status
 *
 * @param {number} index Table index
 * @return {string}
 */
function panelBorderClass(index) {
  var borderClass = '';
  switch (index) {
    case 0:
      borderClass = 'panel-heading table-panel custom-border-green';
      break;
    case 1:
      borderClass = 'panel-heading table-panel custom-border-green';
      break;
    case 2:
      borderClass = 'panel-heading table-panel custom-border-blue';
      break;
    case 3:
      borderClass = 'panel-heading table-panel custom-border-red';
      break;
    default:
      borderClass = 'panel-heading table-panel';
  }
  return borderClass;
}

var foreignKeys = [
  {
    "Name": "fk_test",
    "Columns": ["d"],
    "ReferTable": "test",
    "ReferColumns": ["a"]
  },
  {
    "Name": "fk_test2",
    "Columns": ["c"],
    "ReferTable": "test3",
    "ReferColumns": ["f"]
  }
]


var summary = {
  "category": "Schema Conversion: OK (some columns did not map cleanly). \n\n Warning \n1) Some columns have defaultvalues which Spanner does not support e.g. column \n 'Address Line 2'\
    \n\n Note \n 1) Some columns will consume more storagein Spanner e.g. for column 'Address Id', \n source DB type int(11) is mapped to Spanner type int64.",

    "country": "Schema Conversion: OK (some columns did not map cleanly). \n\n Warning \n1) Some columns have defaultvalues which Spanner does not support e.g. column \n 'Address Line 2'\
    \n\n Note \n 1) Some columns will consume more storagein Spanner e.g. for column 'Address Id', \n source DB type int(11) is mapped to Spanner type int64."
};  

var ddl = {
    "category": "--\n-- Spanner schema for source table category\n--\nCREATE TABLE category (\n    category_id INT64 NOT NULL,     -- From: category_id tinyint(4)\n    name STRING(25) NOT NULL,       -- From: name varchar(25)\n    last_update TIMESTAMP NOT NULL  -- From: last_update timestamp\n) PRIMARY KEY (category_id)",
    "country": "--\n-- Spanner schema for source table country\n--\nCREATE TABLE country (\n    country_id INT64 NOT NULL,      -- From: country_id smallint(6)\n    country STRING(50) NOT NULL,    -- From: country varchar(50)\n    last_update TIMESTAMP NOT NULL  -- From: last_update timestamp\n) PRIMARY KEY (country_id)"
}

var dataType = {
  "bool": [
    {
      "T": "BOOL",
      "Issue": 0
    },
    {
      "T": "STRING",
      "Issue": 13
    },
    {
      "T": "INT64",
      "Issue": 13
    }
  ],
  "varchar": [
    {
      "T": "STRING",
      "Issue": 13
    },
    {
      "T": "BYTES",
      "Issue": 13
    },
    {
      "T": "FLOAT64",
      "Issue": 13
    }
  ]
}

var schemaConversionObj_original = {
  "SpSchema": {
    "test": {
      "Name": "test",
      "ColNames": ["a", "b"],
      "ColDefs": {
        "a": {
          "Name": "a",
          "T": {
            "Name": "INT64",
            "Len": 0,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: a smallint(6)"
        },
        "b": {
          "Name": "b",
          "T": {
            "Name": "STRING",
            "Len": 9223372036854775807,
            "IsArray": false
          },
          "NotNull": false,
          "Comment": "From: b text"
        }
      },
      "Pks": [
        {
          "Col": "a",
          "Desc": false
        }
      ],
      "Fks": null,
      "Comment": "Spanner schema for source table test"
    },
    "test2": {
      "Name": "test2",
      "ColNames": ["c", "d", "synth_id"],
      "ColDefs": {
        "c": {
          "Name": "c",
          "T": {
            "Name": "INT64",
            "Len": 0,
            "IsArray": false
          },
          "NotNull": false,
          "Comment": "From: c smallint(6)"
        },
        "d": {
          "Name": "d",
          "T": {
            "Name": "INT64",
            "Len": 0,
            "IsArray": false
          },
          "NotNull": false,
          "Comment": "From: d smallint(6)"
        },
        "synth_id": {
          "Name": "synth_id",
          "T": {
            "Name": "INT64",
            "Len": 0,
            "IsArray": false
          },
          "NotNull": false,
          "Comment": ""
        }
      },
      "Pks": [
        {
          "Col": "synth_id",
          "Desc": false
        }
      ],
      "Fks": [
        {
          "Name": "fk_test",
          "Columns": ["d"],
          "ReferTable": "test",
          "ReferColumns": ["a"]
        },
        {
          "Name": "fk_test2",
          "Columns": ["c"],
          "ReferTable": "test3",
          "ReferColumns": ["f"]
        }
      ],
      "Comment": "Spanner schema for source table test2"
    },
    "test3": {
      "Name": "test3",
      "ColNames": ["f", "e"],
      "ColDefs": {
        "e": {
          "Name": "e",
          "T": {
            "Name": "STRING",
            "Len": 9223372036854775807,
            "IsArray": false
          },
          "NotNull": false,
          "Comment": "From: e text"
        },
        "f": {
          "Name": "f",
          "T": {
            "Name": "INT64",
            "Len": 0,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: f smallint(6)"
        }
      },
      "Pks": [
        {
          "Col": "f",
          "Desc": false
        }
      ],
      "Fks": null,
      "Comment": "Spanner schema for source table test3"
    }
  },
  "SyntheticPKeys": {
    "test2": {
      "Col": "synth_id",
      "Sequence": 0
    }
  },
  "SrcSchema": {
    "test": {
      "Name": "test",
      "ColNames": ["a", "b"],
      "ColDefs": {
        "a": {
          "Name": "a",
          "Type": {
            "Name": "smallint",
            "Mods": [6],
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": true,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        },
        "b": {
          "Name": "b",
          "Type": {
            "Name": "text",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": false,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        }
      },
      "PrimaryKeys": [
        {
          "Column": "a",
          "Desc": false
        }
      ],
      "ForeignKeys": null,
      "Indexes": null
    },
    "test2": {
      "Name": "test2",
      "ColNames": ["c", "d"],
      "ColDefs": {
        "c": {
          "Name": "c",
          "Type": {
            "Name": "smallint",
            "Mods": [6],
            "ArrayBounds": null
          },
          "NotNull": false,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": true,
            "AutoIncrement": false
          }
        },
        "d": {
          "Name": "d",
          "Type": {
            "Name": "smallint",
            "Mods": [6],
            "ArrayBounds": null
          },
          "NotNull": false,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": true,
            "AutoIncrement": false
          }
        }
      },
      "PrimaryKeys": null,
      "ForeignKeys": [
        {
          "Name": "fk_test",
          "Columns": ["d"],
          "ReferTable": "test",
          "ReferColumns": ["a"],
          "OnDelete": "RESTRICT",
          "OnUpdate": "CASCADE"
        },
        {
          "Name": "fk_test2",
          "Columns": ["c"],
          "ReferTable": "test3",
          "ReferColumns": ["f"],
          "OnDelete": "RESTRICT",
          "OnUpdate": "CASCADE"
        }
      ],
      "Indexes": null
    },
    "test3": {
      "Name": "test3",
      "ColNames": ["f", "e"],
      "ColDefs": {
        "e": {
          "Name": "e",
          "Type": {
            "Name": "text",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": false,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        },
        "f": {
          "Name": "f",
          "Type": {
            "Name": "smallint",
            "Mods": [6],
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": true,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        }
      },
      "PrimaryKeys": [
        {
          "Column": "f",
          "Desc": false
        }
      ],
      "ForeignKeys": null,
      "Indexes": null
    }
  },
  "Issues": {
    "test": {
      "a": [13]
    },
    "test2": {
      "c": [13, 1],
      "d": [13, 1]
    },
    "test3": {
      "f": [13]
    }
  },
  "ToSpanner": {
    "test": {
      "Name": "test",
      "Cols": {
        "a": "a",
        "b": "b"
      }
    },
    "test2": {
      "Name": "test2",
      "Cols": {
        "c": "c",
        "d": "d"
      }
    },
    "test3": {
      "Name": "test3",
      "Cols": {
        "e": "e",
        "f": "f"
      }
    }
  },
  "ToSource": {
    "test": {
      "Name": "test",
      "Cols": {
        "a": "a",
        "b": "b"
      }
    },
    "test2": {
      "Name": "test2",
      "Cols": {
        "c": "c",
        "d": "d"
      }
    },
    "test3": {
      "Name": "test3",
      "Cols": {
        "e": "e",
        "f": "f"
      }
    }
  },
  "Location": {},
  "Stats": {
    "Rows": {},
    "GoodRows": {},
    "BadRows": {},
    "Statement": {
      "AlterTableStmt": {
        "Schema": 2,
        "Data": 0,
        "Skip": 0,
        "Error": 0
      },
      "CreateTableStmt": {
        "Schema": 3,
        "Data": 0,
        "Skip": 0,
        "Error": 0
      }
    },
    "Unexpected": {
      "Multiple primary keys found. `CREATE TABLE` statement is overwriting primary key": 2
    },
    "Reparsed": 0
  },
  "TimezoneOffset": "+00:00"
}