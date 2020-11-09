// variables initialisation
const RED = '#F44336'
var importSchemaObj = {};
var schemaConversionObj_original = {};
var sourceTableFlag = '';
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