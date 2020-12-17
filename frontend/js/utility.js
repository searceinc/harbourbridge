// variables initialisation
const RED = '#F44336';
const apiUrl = '';
let uncheckCount = [];
var updatedColsData = [];
var interleaveApiCallResp = [];
var importSchemaObj = {};
var sourceTableFlag = 'Source';
var reportAccCount = 0;
var summaryAccCount = 0;
var ddlAccCount = 0;
var tableListArea = 'accordion';
var tabSearchInput = 'reportSearchInput';
var isLive = true;
var expanded = false;
var srcPlaceholder = [];
var spPlaceholder = [];
var selectedConstraints = [];
var pkArray = [];
var sessionStorageArr = [];
var initialPkSeqId = [];
var keyColumnMap = [];
var pkSeqId = [];
var src_table_name = [];
var maxSeqId;
var count_src = [];
var count_sp = [];
var notPkArray = [];
var initialColNameArray = [];
var notNullFoundFlag = [];
var notPrimary = [];
var pksSp = [];
var primaryTabCell = [];
var constraintTabCell = [];
var notFoundTxt;
notFoundTxt = document.createElement('h5');
notFoundTxt.innerHTML = `No Match Found`;
notFoundTxt.className = 'noText';

/**
 * Function to fetch panel border color based on conversion status
 *
 * @param {string} color
 * @return {string}
 */
const panelBorderClass = (color) => {
  var borderClass = '';
  switch (color) {
    case 'RED':
      borderClass = ' redBorderBottom';
      break;
    case 'GREEN':
      borderClass = ' greenBorderBottom';
      break;
    case 'BLUE':
      borderClass = ' blueBorderBottom';
      break;
    case 'YELLOW':
      borderClass = ' yellowBorderBottom';
      break;
  }
  return borderClass;
}

/**
 * Function to card border color based on conversion status
 *
 * @param {string} color
 * @return {string}
 */
const mdcCardBorder = (color) => {
  var cardBorderClass = '';
  switch (color) {
    case 'RED':
      cardBorderClass = ' cardRedBorder';
      break;
    case 'GREEN':
      cardBorderClass = ' cardGreenBorder';
      break;
    case 'BLUE':
      cardBorderClass = ' cardBlueBorder';
      break;
    case 'YELLOW':
      cardBorderClass = ' cardYellowBorder';
  }
  return cardBorderClass;
}

/**
 * Function to snackbar on some important actions from UI
 *
 * @param {string} message message to display in snackbar
 * @param {string} bgClass background color class for snackbar
 * @return {null}
 */
const showSnackbar = (message, bgClass) => {
  var snackbar = document.getElementById("snackbar");
  snackbar.className = "show" + bgClass;
  snackbar.innerHTML = message;
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}

/**
 * Function to show tooltips
 *
 * @return {null}
 */
const tooltipHandler = () => {
  $('[data-toggle="tooltip"]').tooltip();
}

/**
 * Function to validate if input fields ae empty.
 *
 * @param {Element} inputField Input html element like <input>..
 * @return {null}
 */
const validateInput = (inputField) => {
  field = inputField;
  if (field.value.trim() == '') {
    field.nextElementSibling.innerHTML = `Required`;
    field.nextElementSibling.style.color = RED;
  }
  else {
    field.nextElementSibling.innerHTML = '';
  }
}


/**
 * Function to hide all modals when user clicks on cancel button.
 *
 * @return {null}
 */
const clickCancelModal = () => {
  clearModal();
  $('#connectToDbModal').modal('hide');
  $('#connectModalSuccess').modal('hide');
  $('#connectModalFailure').modal('hide');
}

/**
 * Function to toggle input fields based on db type.
 *
 * @return {null}
 */
const toggle = () => {
  var val = document.getElementById("dbType")
  if (val.value == "") {
    document.getElementById("sqlFields").style.display = "none"
    document.getElementById("sqlFieldsButtons").style.display = "none"
  }
  else if (val.value == "mysql") {
    $('.formError').html('');
    $('.db-input').val('');
    document.getElementById("sqlFields").style.display = "block"
    document.getElementById("sqlFieldsButtons").style.display = "block"
    sourceTableFlag = 'MySQL'
  }
  else if (val.value == "postgres") {
    $('.formError').html('');
    $('.db-input').val('');
    document.getElementById("sqlFields").style.display = "block"
    document.getElementById("sqlFieldsButtons").style.display = "block"
    sourceTableFlag = 'Postgres'
  }
  else if (val.value == 'dynamodb') {
    document.getElementById("sqlFields").style.display = "none";
    document.getElementById("sqlFieldsButtons").style.display = "none";
    sourceTableFlag = 'dynamoDB';
  }
}

/**
 * Function to change download button and search text box based on the tab selected in edit schema screen
 *
 * @param {number} id html element id for report, ddl or summary tab
 * @return {null}
 */
const findTab = (id) => {
  switch (id) {
    case 'reportTab':
      // setting download button
      document.getElementById('download-schema').style.display = 'block';
      document.getElementById('download-ddl').style.display = 'none';
      document.getElementById('download-report').style.display = 'none';

      // setting search box
      document.getElementById('reportSearchForm').style.display = 'block';
      document.getElementById('ddlSearchForm').style.setProperty('display', 'none', 'important')
      document.getElementById('summarySearchForm').style.setProperty('display', 'none', 'important')

      tableListArea = 'accordion';
      tabSearchInput = 'reportSearchInput';
      break;
    case 'ddlTab':
      document.getElementById('download-schema').style.display = 'none';
      document.getElementById('download-ddl').style.display = 'block';
      document.getElementById('download-report').style.display = 'none';

      // setting search box
      document.getElementById('reportSearchForm').style.setProperty('display', 'none', 'important')
      document.getElementById('ddlSearchForm').style.display = 'block';
      document.getElementById('summarySearchForm').style.setProperty('display', 'none', 'important')

      tableListArea = 'ddl-accordion';
      tabSearchInput = 'ddlSearchInput';
      break;
    case 'summaryTab':
      document.getElementById('download-schema').style.display = 'none';
      document.getElementById('download-ddl').style.display = 'none';
      document.getElementById('download-report').style.display = 'block';

      // setting search box
      document.getElementById('reportSearchForm').style.setProperty('display', 'none', 'important')
      document.getElementById('ddlSearchForm').style.setProperty('display', 'none', 'important')
      document.getElementById('summarySearchForm').style.display = 'block';

      tableListArea = 'summary-accordion';
      tabSearchInput = 'summarySearchInput';
      break;
  }
}

/**
 * Function to clear modal input fields.
 *
 * @return {null}
 */
const clearModal = () => {
  $('.formError').html('');
  $('.db-input').val('');
  $('.db-select-input').val('');
  $('.load-db-input').val('');
  $('.import-db-input').val('');
  $("#upload_link").html('Upload File');
  $('#loadConnectButton').attr('disabled', 'disabled');
  $('#connectButton').attr('disabled', 'disabled');
  document.getElementById("sqlFields").style.display = "none"
  document.getElementById("sqlFieldsButtons").style.display = "none"
}


/**
 * Function to show spinner during api calls
 *
 * @return {null}
 */
const showSpinner = () => {
  toggle_spinner = document.getElementById("toggle-spinner");
  toggle_spinner.style.display = "block";
}

/**
 * Function to hide spinner after api calls
 *
 * @return {null}
 */
const hideSpinner = () => {
  toggle_spinner = document.getElementById("toggle-spinner");
  toggle_spinner.style.display = "none";
  toggle_spinner.className = toggle_spinner.className.replace("show", "");
}