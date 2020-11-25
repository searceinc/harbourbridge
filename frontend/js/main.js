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
    "category": {
      "Name": "category",
      "ColNames": [
        "category_id",
        "name",
        "last_update"
      ],
      "ColDefs": {
        "category_id": {
          "Name": "category_id",
          "T": {
            "Name": "INT64",
            "Len": null,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: category_id tinyint"
        },
        "last_update": {
          "Name": "last_update",
          "T": {
            "Name": "TIMESTAMP",
            "Len": null,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: last_update timestamp"
        },
        "name": {
          "Name": "name",
          "T": {
            "Name": "STRING",
            "Len": 25,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: name varchar(25)"
        }
      },
      "Pks": [
        {
          "Col": "category_id",
          "Desc": false
        }
      ],
      "Comment": "Spanner schema for source table category"
    },
    "country": {
      "Name": "country",
      "ColNames": [
        "country_id",
        "country",
        "last_update"
      ],
      "ColDefs": {
        "country": {
          "Name": "country",
          "T": {
            "Name": "STRING",
            "Len": 50,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: country varchar(50)"
        },
        "country_id": {
          "Name": "country_id",
          "T": {
            "Name": "INT64",
            "Len": null,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: country_id smallint"
        },
        "last_update": {
          "Name": "last_update",
          "T": {
            "Name": "TIMESTAMP",
            "Len": null,
            "IsArray": false
          },
          "NotNull": true,
          "Comment": "From: last_update timestamp"
        }
      },
      "Pks": [
        {
          "Col": "country_id",
          "Desc": false
        }
      ],
      "Comment": "Spanner schema for source table country"
    }
  },
  "SyntheticPKeys": {},
  "SrcSchema": {
    "category": {
      "Name": "category",
      "ColNames": [
        "category_id",
        "name",
        "last_update"
      ],
      "ColDefs": {
        "category_id": {
          "Name": "category_id",
          "Type": {
            "Name": "tinyint",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": true
          }
        },
        "last_update": {
          "Name": "last_update",
          "Type": {
            "Name": "timestamp",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": true,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        },
        "name": {
          "Name": "name",
          "Type": {
            "Name": "varchar",
            "Mods": [
              25
            ],
            "ArrayBounds": null
          },
          "NotNull": true,
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
          "Column": "category_id",
          "Desc": false
        }
      ],
      "Indexes": null
    },
    "country": {
      "Name": "country",
      "ColNames": [
        "country_id",
        "country",
        "last_update"
      ],
      "ColDefs": {
        "country": {
          "Name": "country",
          "Type": {
            "Name": "varchar",
            "Mods": [
              50
            ],
            "ArrayBounds": null
          },
          "NotNull": true,
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
        "country_id": {
          "Name": "country_id",
          "Type": {
            "Name": "smallint",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": false,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": true
          }
        },
        "last_update": {
          "Name": "last_update",
          "Type": {
            "Name": "timestamp",
            "Mods": null,
            "ArrayBounds": null
          },
          "NotNull": true,
          "Unique": false,
          "Ignored": {
            "Check": false,
            "Identity": false,
            "Default": true,
            "Exclusion": false,
            "ForeignKey": false,
            "AutoIncrement": false
          }
        }
      },
      "PrimaryKeys": [
        {
          "Column": "country_id",
          "Desc": false
        }
      ],
      "Indexes": null
    }
  },
  "Issues": {
    "category": {
      "category_id": [
        13,
        10
      ],
      "last_update": [
        0
      ]
    },
    "country": {
      "country_id": [
        13,
        10
      ],
      "last_update": [
        0
      ]
    }
  },
  "ToSpanner": {
    "category": {
      "Name": "category",
      "Cols": {
        "category_id": "category_id",
        "last_update": "last_update",
        "name": "name"
      }
    },
    "country": {
      "Name": "country",
      "Cols": {
        "country": "country",
        "country_id": "country_id",
        "last_update": "last_update"
      }
    }
  },
  "ToSource": {
    "category": {
      "Name": "category",
      "Cols": {
        "category_id": "category_id",
        "last_update": "last_update",
        "name": "name"
      }
    },
    "country": {
      "Name": "country",
      "Cols": {
        "country": "country",
        "country_id": "country_id",
        "last_update": "last_update"
      }
    }
  },
  "Location": {},
  "Stats": {
    "Rows": {},
    "GoodRows": {},
    "BadRows": {},
    "Statement": {},
    "Unexpected": {},
    "Reparsed": 0
  },
  "TimezoneOffset": "+00:00"
}