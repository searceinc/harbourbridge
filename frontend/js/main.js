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
var notNullConstraint = [];
var primaryTabCell = [];
var constraintTabCell = [];
var z;
let uncheckCount = [];
var updatedColsData = [];
var interleaveApiCallResp = [];
var importSchemaObj = {};
var sourceTableFlag = 'Source';

/**
 * Function to initiate home screen tasks like validating form input fields
 *
 * @return {null}
 */
const initHomeScreenTasks = () => {
  jQuery(document).ready(function () {
    setSessionTableContent();
    jQuery('#loadDbForm > div > input').keyup(function () {
      var empty = false;
      jQuery('#loadDbForm > div > input').each(function () {
        if (jQuery(this).val() === '') {
          empty = true;
        }
      });
      if (empty) {
        jQuery('#loadConnectButton').attr('disabled', 'disabled');
      } else {
        jQuery('#loadConnectButton').removeAttr('disabled');
      }
    });
    jQuery('#connectForm > div > input').keyup(function () {
      var empty = false;
      jQuery('#connectForm > div > input').each(function () {
        if (jQuery(this).val() === '') {
          empty = true;
        }
      });
      if (empty) {
        jQuery('#connectButton').attr('disabled', 'disabled');
      }
      else {
        jQuery('#connectButton').removeAttr('disabled');
      }
    });
  })
}

/**
 * Function to trigger click event while file uploading
 *
 * @return {null}
 */
jQuery(function () {
  jQuery("#upload_link").on('click', function (e) {
    e.preventDefault();
    jQuery("#upload:hidden").trigger('click');
  });
});

/**
 * Function to update selected file name while file uploading
 *
 * @return {null}
 */
jQuery(document).ready(function () {
  jQuery('#upload').change(function () {
    fileName = jQuery('#upload')[0].files[0].name;
    if (fileName != '') {
      jQuery('#importButton').removeAttr('disabled');
    }
    jQuery("#upload_link").text(fileName);
  });
});

/**
 * Function to read the json content of selected file while file uploading
 *
 * @return {null}
 */
jQuery(document).on('change', '#upload', function (event) {
  var reader = new FileReader();
  reader.onload = function (event) {
    importSchemaObj = JSON.parse(event.target.result);
    localStorage.setItem('conversionReportContent', JSON.stringify(importSchemaObj));
  }
  reader.readAsText(event.target.files[0]);
});

/**
 * Function to create global edit data type table
 *
 * @return {null}
 */
const createEditDataTypeTable = () => {
  globalDataTypeList = JSON.parse(localStorage.getItem('globalDataTypeList'));
  dataTypeListLength = Object.keys(globalDataTypeList).length;
  globalDataTypeTable = document.createElement('table');
  globalDataTypeTable.className = 'data-type-table';
  globalDataTypeTable.setAttribute('id', 'globalDataType');
  tableBody = document.createElement('tbody');

  tableRow = document.createElement('tr');
  tableHeader1 = document.createElement('th');
  tableHeader1.innerHTML = 'Source';
  tableHeader2 = document.createElement('th');
  tableHeader2.innerHTML = 'Spanner';
  tableRow.appendChild(tableHeader1);
  tableRow.appendChild(tableHeader2);
  tableBody.appendChild(tableRow);

  for (var i = 0; i < dataTypeListLength; i++) {
    tableRow = document.createElement('tr');
    tableRow.setAttribute('id', 'dataTypeRow' + (i + 1));
    for (var j = 0; j < 2; j++) {
      tableCell = document.createElement('td');
      if (j === 0 && globalDataTypeList[Object.keys(globalDataTypeList)[i]] !== null) {
        tableCell.className = 'src-td';
        tableCell.innerHTML = Object.keys(globalDataTypeList)[i];
        tableCell.setAttribute('id', 'dataTypeKey' + (i + 1));
      }
      else if (j === 1) {
        tableCell.setAttribute('id', 'dataTypeVal' + (i + 1));
        optionsLength = globalDataTypeList[Object.keys(globalDataTypeList)[i]].length;
        dataTypeArr = [];
        for (var k = 0; k < optionsLength; k++) {
          dataTypeArr.push(globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].T);
        }

        selectHTML = '';
        selectId = 'dataTypeOption' + (i + 1);
        selectHTML = `<div style='display: flex;'>
                        <i class="large material-icons warning" style='cursor: pointer; visibility: hidden;'>warning</i>
                        <select onchange='dataTypeUpdate(id)' class='form-control tableSelect' id=${selectId} style='border: 0px !important;'>
                      </div>`;
        for (var k = 0; k < optionsLength; k++) {
          if (k === 0 && globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].Brief !== "") {
            selectHTML = `<div style='display: flex;'>
                            <i class="large material-icons warning" style='cursor: pointer;' data-toggle='tooltip' data-placement='bottom' title='${globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].Brief}'>warning</i>
                            <select onchange='dataTypeUpdate(id)' class='form-control tableSelect' id=${selectId} style='border: 0px !important; font-family: FontAwesome;'>
                          </div>`;
          }
          selectHTML += `<option value='${globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].T}'>${globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].T} </option>`;
        }
        selectHTML += `</select>`;
        tableCell.innerHTML = selectHTML;
      }
      tableRow.appendChild(tableCell);
    }
    tableBody.appendChild(tableRow);
  }
  globalDataTypeTable.appendChild(tableBody);
  globalDataTypeDiv = document.getElementById('globalDataType');
  globalDataTypeDiv.innerHTML = '';
  globalDataTypeDiv.appendChild(globalDataTypeTable);
  tooltipHandler();
}

/**
 * Function to update data types with warnings(if any) in global data type table
 *
 * @param {string} id id of select box in global data type table
 * @return {null}
 */
const dataTypeUpdate = (id) => {
  idNum = parseInt(id.match(/\d+/), 10);
  dataTypeOptionArray = globalDataTypeList[document.getElementById('dataTypeKey' + idNum).innerHTML];

  optionHTML = '';
  selectHTML = `<div style='display: flex;'>
                  <i class="large material-icons warning" style='cursor: pointer; visibility: hidden;'>warning</i>
                  <select onchange='dataTypeUpdate(id)' class='form-control tableSelect' id=${id} style='border: 0px !important;'>
                </div>`;
  for (var x = 0; x < dataTypeOptionArray.length; x++) {
    optionFound = dataTypeOptionArray[x].T === document.getElementById(id).value;
    if (dataTypeOptionArray[x].T === document.getElementById(id).value && dataTypeOptionArray[x].Brief !== "") {

      selectHTML = `<div style='display: flex;'>
                      <i class="large material-icons warning" style='cursor: pointer;' data-toggle='tooltip' data-placement='bottom' title='${dataTypeOptionArray[x].Brief}'>warning</i>
                      <select onchange='dataTypeUpdate(id)' class='form-control tableSelect' id=${id} style='border: 0px !important;'>
                    </div>`;
    }
    if (optionFound === true) {
      optionHTML += `<option selected='selected' value='${dataTypeOptionArray[x].T}'>${dataTypeOptionArray[x].T} </option>`;
    }
    else {
      optionHTML += `<option value='${dataTypeOptionArray[x].T}'>${dataTypeOptionArray[x].T} </option>`;
    }
  }
  selectHTML += optionHTML + `</select>`;
  document.getElementById('dataTypeVal' + idNum).innerHTML = selectHTML;
  tooltipHandler();
}

/**
 * Function to create table from con json structure
 *
 * @param {json} obj Json object contaning source and spanner table information
 * @return {null}
 */
const createSourceAndSpannerTables = async(obj) => {
  let mySelect;
  getFilePaths();
  schemaConversionObj = obj;

  // fetch global data type list
  fetch(apiUrl + '/typemap', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(function (res) {
    if (res.ok) {
      res.json().then(function (result) {
        globalDataTypes = result;
        localStorage.setItem('globalDataTypeList', JSON.stringify(globalDataTypes));
      });
    }
    else {
      return Promise.reject(res);
    }
  }).catch(function (err) {
    showSnackbar(err, ' redBg');
  });

  jQuery("#download-schema").click(function () {
    downloadFilePaths = JSON.parse(localStorage.getItem('downloadFilePaths'));
    schemaFilePath = downloadFilePaths.Schema;
    schemaFileName = schemaFilePath.split('/')[schemaFilePath.split('/').length - 1];
    filePath = './' + schemaFileName;
    readTextFile(filePath, function (text) {
      jQuery("<a />", {
        "download": schemaFileName + ".txt",
        "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
      }).appendTo("body")
      .click(function () {
        jQuery(this).remove()
      })[0].click()
    })
  });

  accordion = document.getElementById("accordion");

  // fetching number of tables in source and spanner schema
  src_table_num = Object.keys(schemaConversionObj.SrcSchema).length;
  sp_table_num = Object.keys(schemaConversionObj.SpSchema).length;

  expand_button = document.createElement("button")
  expand_button.setAttribute('id', 'reportExpandButton');
  expand_button.innerHTML = "Expand All"
  expand_button.className = "expand"
  expand_button.addEventListener('click', function () {
    if (jQuery(this).html() === 'Expand All') {
      jQuery(this).html('Collapse All');
      jQuery('.reportCollapse').collapse('show');
    }
    else {
      jQuery(this).html('Expand All');
      jQuery('.reportCollapse').collapse('hide');
    }
  })
  accordion.appendChild(expand_button);

  // global edit data type button
  editButton = document.createElement('button');
  editButton.setAttribute('id', 'editButton');
  editButton.className = 'expand right-align';
  editButton.innerHTML = 'Edit Global Data Type';
  editButton.addEventListener('click', function () {
    createEditDataTypeTable();
    jQuery('#globalDataTypeModal').modal();
  });
  accordion.appendChild(editButton);

  var reportUl = document.createElement('ul');
  reportUl.setAttribute('id', 'reportUl');
  var srcPlaceholder = [];
  var spPlaceholder = [];
  z = 0;

  for (var x = 0; x < src_table_num; x++) {
    initialPkSeqId[x] = [];
    initialColNameArray[x] = [];
    constraintTabCell[x] = [];
    primaryTabCell[x] = [];
    notPrimary[x] = [];
    notNullFoundFlag[x] = [];
    keyColumnMap[x] = [];
    pkArray[x] = [];
    spPlaceholder[x] = [];
    count_sp[x] = [];
    count_src[x] = [];
    pksSp[x] = [];
  }

  interleaveApiCallResp = JSON.parse(localStorage.getItem('interleaveInfo'));

  // creating table accordion one by one for each table
  for (var i = 0; i < src_table_num; i++) {
    src_table = schemaConversionObj.SrcSchema[Object.keys(schemaConversionObj.ToSpanner)[i]];
    src_table_name[i] = Object.keys(schemaConversionObj.ToSpanner)[i];
    src_table_cols = src_table.ColNames;
    sp_table = schemaConversionObj.SpSchema[src_table_name[i]];
    sp_table_cols = sp_table.ColNames;
    pkArray[i] = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[i]].Pks;
    pkSeqId[i] = 1;
    for (var x = 0; x < pkArray[i].length; x++) {
      pkArray[i][x].seqId = pkSeqId[i];
      pkSeqId[i]++;
    }
    schemaConversionObj.SpSchema[src_table_name[i]].Pks = pkArray[i];

    li = document.createElement('area');
    reportUl.appendChild(li);

    tableCard = document.createElement("div");
    tableCard.className = "card";
    tableCard.setAttribute('id', i);

    tableCardHeader = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    tableCardHeader.className = 'card-header report-card-header borderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    tableCardHeader.role = 'tab';

    tableCardHeading = document.createElement("h5");
    tableCardHeading.className = 'mb-0';

    tableCardHeaderLink = document.createElement("a");
    tableCardHeaderLink.innerHTML = `Table: ${Object.keys(schemaConversionObj.SrcSchema)[i]} <i class="fas fa-angle-down rotate-icon" />`
    tableCardHeaderLink.setAttribute("data-toggle", "collapse");
    tableCardHeaderLink.setAttribute("href", "#" + Object.keys(schemaConversionObj.SrcSchema)[i]);

    tableCardHeading.appendChild(tableCardHeaderLink);
    tableCardHeader.appendChild(tableCardHeading);
    tableCard.appendChild(tableCardHeader);

    spannerTextSpan = document.createElement("span");
    spannerTextSpan.className = "spanner-text right-align hide-content";
    spannerTextSpan.innerHTML = "Spanner";
    spannerTextSpan.removeAttribute('data-toggle');
    tableCardHeading.appendChild(spannerTextSpan);

    spannerIconSpan = document.createElement("span");
    spannerIconSpan.className = "spanner-icon right-align hide-content";
    spannerIconSpan.innerHTML = `<i class="large material-icons" style="font-size: 18px;">circle</i>`;
    tableCardHeading.appendChild(spannerIconSpan);

    sourceTextSpan = document.createElement("span");
    sourceTextSpan.className = "source-text right-align hide-content";
    sourceTextSpan.innerHTML = "Source";
    tableCardHeading.appendChild(sourceTextSpan);

    sourceIconSpan = document.createElement("span");
    sourceIconSpan.className = "source-icon right-align hide-content";
    sourceIconSpan.innerHTML = `<i class="large material-icons" style="font-size: 18px;">circle</i>`;
    tableCardHeading.appendChild(sourceIconSpan);

    editSpannerSpan = document.createElement("button");
    editSpannerSpan.className = "right-align hide-content edit-button";
    editSpannerSpan.innerHTML = "Edit Spanner Schema";
    editSpannerSpan.setAttribute('id', 'editSpanner' + i);
    editSpannerSpan.addEventListener('click', function () {
      if (jQuery(this).html() === "Edit Spanner Schema") {
        editSpannerHandler(jQuery(this));
      }
      else if (jQuery(this).html() === "Save Changes") {
        saveSpannerChanges(jQuery(this), spPlaceholder);
      }
    })
    tableCardHeading.appendChild(editSpannerSpan);

    tableCardCollapse = document.createElement("div");
    tableCardCollapse.setAttribute("id", Object.keys(schemaConversionObj.SrcSchema)[i]);
    tableCardCollapse.className = "collapse reportCollapse";

    tableCardContent = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    tableCardContent.className = 'mdc-card mdc-card-content table-card-border' + mdcCardBorder(conversionRateResp[src_table_name[i]]);

    tableAccContent = document.createElement("div");
    tableAccContent.className = "acc-card-content";

    // creating column headers for each table
    tableColHeaders = [];
    for (var m = 0; m < 6; m++) {
      if (m % 2 === 0) {
        tableColHeaders.push(sourceTableFlag);
      }
      else
        tableColHeaders.push('Spanner');
    }

    // appending column headers to the table
    table = document.createElement("table");
    table_header2 = document.createElement('thead');
    table.appendChild(table_header2);
    table.setAttribute('id', 'src-sp-table' + i);
    table.className = 'acc-table';

    tr = table_header2.insertRow(-1);
    th1 = document.createElement('th');
    th1.innerHTML = 'Column Name';
    th1.className = 'acc-column';
    th1.setAttribute('colspan', 2);
    tr.appendChild(th1);

    th2 = document.createElement('th');
    th2.innerHTML = 'Data Type';
    th2.className = 'acc-column';
    th2.setAttribute('colspan', 2);
    tr.appendChild(th2);

    th3 = document.createElement('th');
    th3.innerHTML = 'Constraints';
    th3.className = 'acc-column';
    th3.setAttribute('colspan', 2);
    tr.appendChild(th3);

    tr = table_header2.insertRow(-1);
    for (var j = 0; j < tableColHeaders.length; j++) {
      th = document.createElement("th");
      if (j % 2 === 0) {
        if (j === 0) {
          th.className = "acc-table-th-src src-tab-cell";
        }
        else {
          th.className = "acc-table-th-src";
        }
      }
      else {
        th.className = "acc-table-th-spn";
      }
      th.innerHTML = tableColHeaders[j];
      tr.appendChild(th);
    }

    table_body = document.createElement('tbody');
    table.appendChild(table_body);
    columnsLength = Object.keys(schemaConversionObj.ToSpanner[sp_table.Name].Cols).length;
    spannerColumnsIterator(i, srcPlaceholder, spPlaceholder);
    tableAccContent.appendChild(table)
    tableCardContent.appendChild(tableAccContent)
    tableCardCollapse.appendChild(tableCardContent)
    tableCard.appendChild(tableCardCollapse)
    li.appendChild(tableCard);

    if (sp_table.Fks != null) {
      foreignKeyHandler(i, sp_table.Fks);
    }
    if (JSON.parse(localStorage.getItem('summaryReportContent')) != undefined) {
      createSummaryForEachTable(i, JSON.parse(localStorage.getItem('summaryReportContent')));
    }
  }
  accordion.appendChild(reportUl);
  z--;
  while (z >= 0) {
    mySelect = new vanillaSelectBox('#srcConstraint' + z, {
      placeHolder: srcPlaceholder[z] + " constraints selected",
      maxWidth: 500,
      maxHeight: 300
    });
    z--;
  }

  for (var i = 0; i < src_table_num; i++) {
    table_id = '#src-sp-table' + i;
    jQuery(table_id).DataTable();
  }

  for (var i = 0; i < sp_table_num; i++) {
    sp_table = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[i]]
    sp_table_cols = sp_table.ColNames;
    for (var j = 0; j < sp_table_cols.length; j++) {
      if (document.getElementById('spConstraint' + i + j) != null) {
        mySelect = new vanillaSelectBox('#spConstraint' + i + j, {
          placeHolder: spPlaceholder[i][j] + " constraints selected",
          maxWidth: 500,
          maxHeight: 300
        });
      }
    }
  }
  tooltipHandler();
}

/**
 * Function to create spanner columns
 *
 * @param {number} i table index
 * @return {null}
 */
const spannerColumnsIterator = (i, srcPlaceholder, spPlaceholder) => {
  for (var k = 0; k < columnsLength; k++) {
    tr = table_body.insertRow(-1);
    currentColumnSrc = Object.keys(schemaConversionObj.ToSpanner[sp_table.Name].Cols)[k];
    currentColumnSp = schemaConversionObj.ToSpanner[sp_table.Name].Cols[currentColumnSrc];

    columnNameIterator(i, k);
    dataTypeIterator(i, k);
    constraintIterator(i, k, srcPlaceholder, spPlaceholder);
  }
}

/**
 * Function to create name column for spanner table
 *
 * @param {number} i table index
 * @param {number} k column index in table
 * @return {null}
 */
const columnNameIterator = (i, k) => {
  for (var l = 0; l < 2; l++) {
    tabCell = tr.insertCell(-1);
    if (l % 2 === 0) {
      if (src_table.PrimaryKeys !== null && src_table.PrimaryKeys[0].Column === currentColumnSrc) {
        tabCell.innerHTML = `<span class="column left">
                              <img src='./Icons/Icons/ic_vpn_key_24px.svg' style='margin-left: 3px;'>
                            </span>
                            <span class="column right srcColumn" id='srcColumn${k}'>
                              ${currentColumnSrc}
                            </span>`;
      }
      else {
        tabCell.innerHTML = `<span class="column left">
                              <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg' style='visibility: hidden; margin-left: 3px;'>
                            </span>
                            <span class="column right srcColumn" id='srcColumn${k}'>
                              ${currentColumnSrc}
                            </span>`
      }
      tabCell.className = 'acc-table-td src-tab-cell';
    }
    else {
      // currentColumnSp = sp_table_cols[k];
      pksSp[i] = [...sp_table.Pks];
      pkFlag = false
      for (var x = 0; x < pksSp[i].length; x++) {
        if (pksSp[i][x].Col === currentColumnSp) {
          pkFlag = true;
          tabCell.innerHTML = `<span class="column left" data-toggle="tooltip" data-placement="bottom" title="primary key : ${sp_table_cols[k]}" id='keyIcon${i}${k}${k}' style="cursor:pointer">
                                <sub>${pksSp[i][x].seqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg' class='primaryKey'>
                              </span>
                              <span class="column right" data-toggle="tooltip" data-placement="bottom" title="primary key : ${sp_table_cols[k]}" id='columnNameText${i}${k}${k}' style="cursor:pointer">
                                ${currentColumnSp}
                              </span>`;
          notPrimary[i][k] = false;
          initialPkSeqId[i][k] = pksSp[i][x].seqId;
          break
        }
      }
      if (pkFlag === false) {
        notPrimary[i][k] = true;
        tabCell.innerHTML = `<span class="column left" id='keyIcon${i}${k}${k}'>
                              <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg' style='visibility: hidden;'>
                            </span>
                            <span class="column right" id='columnNameText${i}${k}${k}'>
                              ${currentColumnSp}
                            </span>`;
      }
      tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k);
      primaryTabCell[i][k] = tabCell.innerHTML;
      keyIconValue = 'keyIcon' + i + k + k;
      keyColumnObj = { 'keyIconId': keyIconValue, 'columnName': currentColumnSp };
      keyColumnMap[i].push(keyColumnObj);
    }
  }
}

/**
 * Function to create data type column for spanner table
 *
 * @param {number} i table index
 * @param {number} k column index in table
 * @return {null}
 */
const dataTypeIterator = (i, k) => {
  for (var l = 0; l < 2; l++) {
   
    tabCell = tr.insertCell(-1);
    if (l % 2 === 0) {
      tabCell.className = "acc-table-td pl-data-type";
      tabCell.setAttribute('id', 'srcDataType' + i + k);
      tabCell.innerHTML = src_table.ColDefs[currentColumnSrc].Type.Name;
    }
    else {
      tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k);
      tabCell.setAttribute('id', 'dataType' + i + k);
      tabCell.innerHTML = sp_table.ColDefs[currentColumnSp].T.Name;
    }
  }
}

/**
 * Function to create constraint column for spanner table
 *
 * @param {number} i table index
 * @param {number} k column index in table
 * @return {null}
 */
const constraintIterator = (i, k, srcPlaceholder, spPlaceholder) => {
  for (var l = 0; l < 2; l++) {
    tabCell = tr.insertCell(-1);
    tabCell.className = "acc-table-td";
    if (l % 2 === 0) {
      count_src[i][k] = 0;
      srcPlaceholder[z] = count_src[i][k];
      if (src_table.ColDefs[currentColumnSrc].NotNull !== undefined) {
        if (src_table.ColDefs[currentColumnSrc].NotNull === true) {
          count_src[i][k] = count_src[i][k] + 1;
          srcPlaceholder[z] = count_src[i][k];
          notNullFound = "<option disabled class='active'>Not Null</option>";
        }
        else {
          notNullFound = "<option disabled>Not Null</option>";
        }
      }
      else {
        notNullFound = '';
      }

      constraintId = 'srcConstraint' + z;
      srcConstraintHtml = "<select id=" + constraintId + " multiple size='1' class='form-control spanner-input tableSelect'>"
        + notNullFound
        + "</select>";
      tabCell.innerHTML = srcConstraintHtml;
      z++;
    }
    else {
      count_sp[i][k] = 0;
      spPlaceholder[i][k] = count_sp[i][k];
      // checking not null consraint
      if (sp_table.ColDefs[currentColumnSp].NotNull !== undefined) {
        if (sp_table.ColDefs[currentColumnSp].NotNull === true) {
          count_sp[i][k] = count_sp[i][k] + 1
          spPlaceholder[i][k] = count_sp[i][k];
          notNullFound = "<option disabled class='active'>Not Null</option>";
          notNullFoundFlag[i][k] = true;
          notNullConstraint[parseInt(String(i) + String(k))] = 'Not Null';
        }
        else {
          notNullFound = "<option disabled>Not Null</option>";
          notNullFoundFlag[i][k] = false;
          notNullConstraint[parseInt(String(i) + String(k))] = '';
        }
      }
      else {
        notNullFound = "<option disabled>Not Null</option>";
        notNullFoundFlag[i][k] = false;
      }
      constraintId = 'spConstraint' + i + k;
      spConstraintHtml = "<select id=" + constraintId + " multiple size='1' class='form-control spanner-input tableSelect'>"
        + notNullFound
        + "</select>";
      tabCell.innerHTML = spConstraintHtml;
      tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k);
      constraintTabCell[i][k] = tabCell.innerHTML;
    }
  }
}

/**
 * Function to create foreign key tab for each table
 *
 * @param {number} index table index
 * @param {Array} foreignKeys foreign keys array for each table
 * @return {null}
 */
const foreignKeyHandler = (index, foreignKeys) => {
  foreignKeyDiv = document.createElement('div');
  foreignKeyDiv.className = 'summaryCard';

  foreignKeyHeader = document.createElement("div")
  foreignKeyHeader.className = 'foreignKeyHeader';
  foreignKeyHeader.role = 'tab';

  foreignKeyHeading = document.createElement("h5")
  foreignKeyHeading.className = 'mb-0';

  foreignKeyLink = document.createElement("a")
  foreignKeyLink.innerHTML = `Foreign Keys`;
  foreignKeyLink.className = 'summaryFont';
  foreignKeyLink.setAttribute("data-toggle", "collapse");
  foreignKeyLink.setAttribute("href", "#foreignKey" + index);
  
  foreignKeyHeading.appendChild(foreignKeyLink);
  foreignKeyHeader.appendChild(foreignKeyHeading);
  foreignKeyDiv.appendChild(foreignKeyHeader);

  foreignKeyCollapse = document.createElement("div")
  foreignKeyCollapse.setAttribute("id", 'foreignKey' + index);
  foreignKeyCollapse.className = "collapse summaryCollapse";

  foreignKeyCard = document.createElement("div");
  foreignKeyCard.className = "mdc-card mdc-card-content summaryBorder";
  foreignKeyCard.setAttribute('border', '0px');

  fkTable = document.createElement('table');
  fkTable.className = 'acc-table fkTable';
  fkHeader = document.createElement('thead');
  fkTbody = document.createElement('tbody');
  fkTable.appendChild(fkHeader);
  fkTable.appendChild(fkTbody);
  tr = fkHeader.insertRow(-1);
  
  th1 = document.createElement('th');
  th1.innerHTML = 'Name';
  tr.appendChild(th1);

  th2 = document.createElement('th');
  th2.innerHTML = 'Columns';
  tr.appendChild(th2);

  th3 = document.createElement('th');
  th3.innerHTML = 'Refer Table';
  tr.appendChild(th3);

  th4 = document.createElement('th');
  th4.innerHTML = 'Refer Columns';
  tr.appendChild(th4);

  radioOptions = '';
  radioOptions += `<fieldset style='overflow: hidden;'>
            <div class="radio-class">
              <input type="radio" class="radio" name="fks" value="add" id="add${index}" checked='checked' />
              <label style='margin-right: 15px;' for="add">Use as Foreign Key</label>
              <input type="radio" class="radio" name="fks" value="interleave" id="interleave${index}" />
              <label style='margin-right: 15px;' for="interleave">Convert to Interleave</label>
            </div>
            <button style='float: right; padding: 0px 20px;' class='edit-button' id='saveInterleave${index}' onclick='saveInterleaveHandler(${index})'>save</button>
            </fieldset><br>`;
  jQuery('#add'+index).attr('checked', 'checked');

  for (var p in foreignKeys) {
    tr = fkTbody.insertRow(-1);
    for (var k in foreignKeys[p]) {
      tabCell = tr.insertCell(-1);
      tabCell.innerHTML = foreignKeys[p][k];
      tabCell.className = 'acc-table-td';
    }
  }

  foreignKeyContent = document.createElement('div');
  foreignKeyContent.className = 'mdc-card summary-content';
  foreignKeyContent.innerHTML = radioOptions;

  foreignKeyContent.appendChild(fkTable);
  foreignKeyCard.appendChild(foreignKeyContent);
  foreignKeyCollapse.appendChild(foreignKeyCard);
  foreignKeyDiv.appendChild(foreignKeyCollapse);
  tableAccContent.appendChild(foreignKeyDiv);
}

/**
 * Function to select foreign key behaviour in each table (convert to interleave or use as is)
 *
 * @param {number} index table index
 * @return {null}
 */
const saveInterleaveHandler = (index) => {
  const radioValues = document.querySelectorAll('input[name="fks"]');
            let selectedValue;
            for (const x of radioValues) {
                if (x.checked) {
                    selectedValue = x.value;
                    break;
                }
            }
  if (selectedValue == 'interleave') {
    console.log(index);
    console.log(interleaveApiCallResp[index]);
    if (interleaveApiCallResp[index].Possible == false) {
      showSnackbar('Cannot be Interleaved', ' redBg');  
    }
    else if (interleaveApiCallResp[index].Possible == true) {
      showSnackbar('Successfully Interleaved', ' greenBg');
    }
  }
  else {
    showSnackbar('Response Saved', ' greenBg');
  }
}

/**
 * Function to handle spanner table editing
 *
 * @param {event} event event generated by clicking edit spanner button
 * @return {null}
 */
const editSpannerHandler = (event) => {
  if (event.html() === 'Edit Spanner Schema') {
    jQuery(event[0]).removeAttr('data-toggle');
  }

  tableNumber = parseInt(event.attr('id').match(/\d+/), 10);
  uncheckCount[tableNumber] = 0;
  tableId = '#src-sp-table' + tableNumber + ' tr';
  event.html("Save Changes");
  tableColumnNumber = 0;
  tableCheckboxGroup = '.chckClass_' + tableNumber;

  jQuery(tableId).each(function (index) {
    if (index === 1) {
      var temp = jQuery(this).find('.src-tab-cell');
      temp.prepend(`<span class="bmd-form-group is-filled">
                      <div class="checkbox">
                        <label>
                          <input type="checkbox" id='chckAll_${tableNumber}' value="">
                          <span class="checkbox-decorator"><span class="check" style='margin-left: -7px;'></span><div class="ripple-container"></div></span>
                        </label>
                      </div>
                    </span>`)
    }
    var checkAllTableNumber = jQuery('#chckAll_' + tableNumber);
    var checkClassTableNumber = jQuery('.chckClass_' + tableNumber);
    checkAllTableNumber.prop('checked', true);
    checkAllTableNumber.click(function () {
      tableNumber = parseInt(jQuery(this).attr('id').match(/\d+/), 10);
      checkClassTableNumber = jQuery('.chckClass_' + tableNumber);
      switch (jQuery(this).is(':checked')) {
        case true:
          checkClassTableNumber.prop('checked', true);
          break;
        case false:
          checkClassTableNumber.prop('checked', false);
          break;
      }
    });

    if (index > 1) {
      var temp = jQuery(this).find('.src-tab-cell');
      temp.prepend(`<span class="bmd-form-group is-filled">
                      <div class="checkbox">
                        <label>
                          <input type="checkbox" id="chckBox_${tableColumnNumber}" value="" class="chckClass_${tableNumber}">
                          <span class="checkbox-decorator"><span class="check"></span><div class="ripple-container"></div></span>
                        </label>
                      </div>
                    </span>`)
      jQuery(tableCheckboxGroup).prop('checked', true);
      spannerCellsList = document.getElementsByClassName('spannerTabCell' + tableNumber + tableColumnNumber);

      editSpannerColumnName(spannerCellsList[0], tableNumber, tableColumnNumber);
      editSpannerDataType(spannerCellsList[1], tableNumber, tableColumnNumber);
      editSpannerConstraint(spannerCellsList[2], tableNumber, tableColumnNumber);
      tableColumnNumber++;
    }
  });
  checkClassTableNumber = jQuery('.chckClass_' + tableNumber);
  checkClassTableNumber.click(function () {
    tableNumber = parseInt(jQuery(this).closest("table").attr('id').match(/\d+/), 10);
    tableColumnNumber = parseInt(jQuery(this).attr('id').match(/\d+/), 10);
    checkAllTableNumber = jQuery('#chckAll_' + tableNumber);
    if (jQuery(this).is(":checked")) {
      uncheckCount[tableNumber] = uncheckCount[tableNumber] - 1;
      if (uncheckCount[tableNumber] === 0) {
        checkAllTableNumber.prop('checked', true);
      }
    }
    else {
      uncheckCount[tableNumber] = uncheckCount[tableNumber] + 1;
      checkAllTableNumber.prop('checked', false);
    }
  });
}

/**
 * Function to edit column name for spanner table
 *
 * @param {html Element} editColumn
 * @param {number} tableNumber
 * @param {number} tableColumnNumber
 * @return {null}
 */
const editSpannerColumnName = (editColumn, tableNumber, tableColumnNumber) => {
  spannerCellsList[0] = editColumn;
  columnNameVal = document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML;
  initialColNameArray[tableNumber].push(columnNameVal);
  currSeqId = '';
  for (var x = 0; x < pkArray[tableNumber].length; x++) {
    if (pkArray[tableNumber][x].Col === columnNameVal.trim()) {
      currSeqId = pkArray[tableNumber][x].seqId;
    }
  }
  if (notPrimary[tableNumber][tableColumnNumber] === true) {
    spannerCellsList[0].innerHTML = `<span class="column left keyNotActive keyMargin keyClick" id='keyIcon${tableNumber}${tableColumnNumber}${tableColumnNumber}'>
                                      <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>
                                    </span>
                                    <span class="column right form-group">
                                      <input id='columnNameText${tableNumber}${tableColumnNumber}${tableColumnNumber}' type="text" value=${columnNameVal} class="form-control spanner-input" autocomplete='off'>
                                    </span>`
  }
  else {
    spannerCellsList[0].innerHTML = `<span class="column left keyActive keyMargin keyClick" id='keyIcon${tableNumber}${tableColumnNumber}${tableColumnNumber}'>
                                      <sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
                                    </span>
                                    <span class="column right form-group">
                                      <input id='columnNameText${tableNumber}${tableColumnNumber}${tableColumnNumber}' type="text" value=${columnNameVal} class="form-control spanner-input" autocomplete='off'>
                                    </span>`
  }
  jQuery('#keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).click(function () {
    jQuery(this).toggleClass('keyActive keyNotActive');
    keyId = jQuery(this).attr('id');
    for (var z = 0; z < keyColumnMap[tableNumber].length; z++) {
      if (keyId === keyColumnMap[tableNumber][z].keyIconId) {
        columnName = keyColumnMap[tableNumber][z].columnName;
      }
    }

    if (document.getElementById(keyId).classList.contains('keyActive')) {
      getNewSeqNumForPrimaryKey(keyId, tableNumber);
    }
    else {
      removePrimaryKeyFromSeq(tableNumber);
    }
  });
}

/**
 * Function to get new seq number for primary key
 *
 * @param {html id} keyId
 * @param {number} tableNumber specifies table number in json object
 * @return {null}
 */
const getNewSeqNumForPrimaryKey = (keyId, tableNumber) => {
  maxSeqId = 0;
  for (var z = 0; z < pkArray[tableNumber].length; z++) {
    if (pkArray[tableNumber][z].seqId > maxSeqId) {
      maxSeqId = pkArray[tableNumber][z].seqId;
    }
  }
  maxSeqId = maxSeqId + 1;
  pkSeqId[tableNumber] = maxSeqId;
  pkFoundFlag = false;
  for (var z = 0; z < pkArray[tableNumber].length; z++) {
    if (columnName != pkArray[tableNumber][z].Col) {
      pkFoundFlag = false;
    }
    else {
      pkFoundFlag = true;
      break;
    }
  }
  if (pkFoundFlag === false) {
    pkArray[tableNumber].push({ 'Col': columnName, 'seqId': pkSeqId[tableNumber] });
  }
  schemaConversionObj.SpSchema[src_table_name[tableNumber]].Pks = pkArray[tableNumber];
  document.getElementById(keyId).innerHTML = `<sub>${pkSeqId[tableNumber]}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>`;
}

/**
 * Function to remove primary key from existing sequence
 *
 * @param {number} tableNumber
 * @return {null}
 */
const removePrimaryKeyFromSeq = (tableNumber) => {
  for (var z = 0; z < pkArray[tableNumber].length; z++) {
    if (columnName === pkArray[tableNumber][z].Col) {
      pkArray[tableNumber].splice(z, 1);
      break;
    }
  }
  for (var x = z; x < pkArray[tableNumber].length; x++) {
    pkArray[tableNumber][x].seqId = pkArray[tableNumber][x].seqId - 1;
  }
  schemaConversionObj.SpSchema[src_table_name[tableNumber]].Pks = pkArray[tableNumber];

  tableColumnNumber = 0;
  jQuery(tableId).each(function (index) {
    if (index > 1) {
      notPrimary[tableNumber][tableColumnNumber] = true;
      currSeqId = '';
      for (var x = 0; x < pkArray[tableNumber].length; x++) {
        if (pkArray[tableNumber][x].Col === initialColNameArray[tableNumber][tableColumnNumber].trim()) {
          currSeqId = pkArray[tableNumber][x].seqId;
          notPrimary[tableNumber][tableColumnNumber] = false;
        }
      }
      if (notPrimary[tableNumber][tableColumnNumber] === true) {
        document.getElementById('keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>`;
      }
      if (notPrimary[tableNumber][tableColumnNumber] === false) {
        document.getElementById('keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML = `<sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>`;
      }
      tableColumnNumber++;
    }
  });
}

/**
 * Function to edit data type for spanner table
 *
 * @param {html Element} editColumn
 * @param {number} tableNumber
 * @param {number} tableColumnNumber
 * @return {null}
 */
const editSpannerDataType = (editColumn, tableNumber, tableColumnNumber) => {
  spannerCellsList[1] = editColumn;
  spannerCellValue = spannerCellsList[1].innerHTML;
  srcCellValue = document.getElementById('srcDataType' + tableNumber + tableColumnNumber).innerHTML;
  dataTypeArray = null;
  dataType = '';
  globalDataTypesLength = Object.keys(globalDataTypes).length;
  for (var a = 0; a < globalDataTypesLength; a++) {
    if (srcCellValue.toLowerCase() === (Object.keys(globalDataTypes)[a]).toLowerCase()) {
      dataTypeArray = globalDataTypes[Object.keys(globalDataTypes)[a]];
      break;
    }
  }
  dataType = `<div class="form-group">
              <select class="form-control spanner-input tableSelect" id='dataType${tableNumber}${tableColumnNumber}${tableColumnNumber}'>`

  if (dataTypeArray !== null) {
    for (var a = 0; a < dataTypeArray.length; a++) {
      dataType += `<option value=${dataTypeArray[a].T}>${dataTypeArray[a].T}</option>`
    }
  }
  else {
    dataType += `<option value=${spannerCellValue}>${spannerCellValue}</option>`
  }
  dataType += `</select> </div>`;
  spannerCellsList[1].innerHTML = dataType;
}

/**
 * Function to edit constraint for spanner table
 *
 * @param {html Element} editColumn
 * @param {number} tableNumber
 * @param {number} tableColumnNumber
 * @return {null}
 */
const editSpannerConstraint = (editColumn, tableNumber, tableColumnNumber) => {
  let mySelect;
  spannerCellsList[2] = editColumn;
  // not null flag
  if (notNullFoundFlag[tableNumber][tableColumnNumber] === true) {
    notNullFound = "<option class='active' selected>Not Null</option>";
  }
  else if (notNullFoundFlag[tableNumber][tableColumnNumber] === false) {
    notNullFound = "<option>Not Null</option>";
  }
  else {
    notNullFound = '';
  }

  constraintId = 'spConstraint' + tableNumber + tableColumnNumber;
  constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
    + notNullFound
    + "</select>";
  spannerCellsList[2].innerHTML = constraintHtml;
  spannerCellsList[2].setAttribute('class', 'sp-column acc-table-td spannerTabCell' + tableNumber + tableColumnNumber);
  mySelect = new vanillaSelectBox("#spConstraint" + tableNumber + tableColumnNumber, {
    placeHolder: "Select Constraints",
    maxWidth: 500,
    maxHeight: 300
  });
  jQuery('#spConstraint' + tableNumber + tableColumnNumber).on('change', function () {
    constraintId = jQuery(this).attr('id');
    idNum = parseInt(jQuery(this).attr('id').match(/\d+/g), 10);
    constraints = document.getElementById(constraintId);
    notNullConstraint[idNum] = '';
    for (var c = 0; c < constraints.length; c++) {
      if (constraints.options[c].selected) {
        notNullConstraint[idNum] = 'Not Null';
      }
    }
  });
}

/**
 * Function to save changes of spanner table
 *
 * @param {event} event event generated by clicking edit spanner button
 * @return {null}
 */
const saveSpannerChanges = (event, spPlaceholder) => {
  let mySelect;
  if (event.html() === 'Save Changes') {
    showSnackbar('changes saved successfully !!', ' greenBg');
  }

  tableNumber = parseInt(event.attr('id').match(/\d+/), 10);
  tableId = '#src-sp-table' + tableNumber + ' tr';
  event.html("Edit Spanner Schema");
  notPkArray = [];
  initialColNameArray[tableNumber] = [];
  currentPks = schemaConversionObj.SpSchema[src_table_name[tableNumber]].Pks;
  updatedColsData = {
    'UpdateCols': {
    }
  }
  jQuery(tableId).each(function (index) {
    if (index > 1) {
      tableName = src_table_name[tableNumber];
      tableColumnNumber = parseInt(jQuery(this).find('.srcColumn').attr('id').match(/\d+/), 10);
      srcColumnName = jQuery(this).find('.srcColumn').html().trim()
      spannerCellsList = document.getElementsByClassName('spannerTabCell' + tableNumber + tableColumnNumber);
      newColumnName = document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).value;
      originalColumnName = schemaConversionObj.ToSpanner[src_table_name[tableNumber]].Cols[srcColumnName];
      updatedColsData.UpdateCols[originalColumnName] = {};
      updatedColsData.UpdateCols[originalColumnName]['Removed'] = false;
      if (newColumnName === originalColumnName) {
        updatedColsData.UpdateCols[originalColumnName]['Rename'] = '';
      }
      else {
        updatedColsData.UpdateCols[originalColumnName]['Rename'] = newColumnName;
      }
      updatedColsData.UpdateCols[originalColumnName]['NotNull'] = '';
      updatedColsData.UpdateCols[originalColumnName]['PK'] = '';

      saveSpannerColumnName();

      updatedColsData.UpdateCols[originalColumnName]['ToType'] = document.getElementById('dataType' + tableNumber + tableColumnNumber + tableColumnNumber).value;
      
      saveSpannerConstraints();

      if (!(jQuery(this).find("input[type=checkbox]").is(":checked"))) {
        updatedColsData.UpdateCols[originalColumnName]['Removed'] = true;
      }
      mySelect = new vanillaSelectBox('#spConstraint' + tableNumber + tableColumnNumber, {
        placeHolder: spPlaceholder[tableNumber][tableColumnNumber] + " constraints selected",
        maxWidth: 500,
        maxHeight: 300
      });
    }
  })

  jQuery(tableId).each(function () {
    jQuery(this).find('.src-tab-cell .bmd-form-group').remove();
  });
  tooltipHandler();

  fetch(apiUrl + '/typemap/table?table=' + tableName, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedColsData)
  })
    .then(function (res) {
      if (res.ok) {
        res.json().then(async function (response) {
          localStorage.setItem('conversionReportContent', JSON.stringify(response));
          await ddlSummaryAndConversionApiCall();
          await getInterleaveInfo();
          const { component = ErrorComponent } = findComponentByPath(location.hash.slice(1).toLowerCase() || '/', routes) || {};
          document.getElementById('app').innerHTML = component.render();
          showSchemaConversionReportContent();
        });
      }
      else {
        return Promise.reject(res);
      }
    })
    .catch(function (err) {
      showSnackbar(err, ' redBg');
    })
}

/**
 * Function to save column name for spanner table
 *
 * @return {null}
 */
const saveSpannerColumnName = () => {
  if (document.getElementById('keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).classList.contains('keyActive')) {
    // checking if this key is newly added or removed
    foundOriginally = false;
    for (var z = 0; z < pksSp[tableNumber].length; z++) {
      if (originalColumnName === pksSp[tableNumber][z].Col) {
        foundOriginally = true;
        break;
      }
    }
    if (foundOriginally === false) {
      updatedColsData.UpdateCols[originalColumnName]['PK'] = 'ADDED';
    }

    for (var z = 0; z < currentPks.length; z++) {
      if (currentPks[z].Col === newColumnName) {
        currSeqId = currentPks[z].seqId;
      }
    }
    spannerCellsList[0].innerHTML = `
                        <span class="column left" data-toggle="tooltip" data-placement="bottom" title="primary key : ${document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).value}" style="cursor:pointer">
                          <sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
                        </span>
                        <span class="column right" data-toggle="tooltip" data-placement="bottom" title="primary key : ${document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).value}" id='columnNameText${tableNumber}${tableColumnNumber}${tableColumnNumber}' style="cursor:pointer">
                          ${document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).value}
                        </span>`;
    notPrimary[tableNumber][tableColumnNumber] = false;
  }
  else {

    // checking if this key is newly added or removed
    foundOriginally = false;
    for (var z = 0; z < pksSp[tableNumber].length; z++) {
      if (originalColumnName === pksSp[tableNumber][z].Col) {
        foundOriginally = true;
        updatedColsData.UpdateCols[originalColumnName]['PK'] = 'REMOVED';
        break;
      }
    }
  }
  notPrimary[tableNumber][tableColumnNumber] = true;
}

/**
 * Function to save constraints for spanner table
 *
 * @return {null}
 */
const saveSpannerConstraints = () => {
  constraintIndex = String(tableNumber) + String(tableColumnNumber);
  constraintIndex = parseInt(constraintIndex);

  if (notNullConstraint[constraintIndex] === 'Not Null') {
    notNullFound = "<option disabled class='active' selected>Not Null</option>";
    updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'ADDED';
  }
  else if (notNullConstraint[constraintIndex] === '') {
    notNullFound = "<option disabled>Not Null</option>";
    updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'REMOVED';
  }
  constraintId = 'spConstraint' + tableNumber + tableColumnNumber;
                  constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
                    + notNullFound
                    + "</select>";
}

/**
 * Function to create summary tab for each table
 *
 * @param {number} index table index
 * @param {json} summary json object containing summary for each table
 * @return {null}
 */
const createSummaryForEachTable = (index, summary) => {
  summaryCard = document.createElement('div');
  summaryCard.className = 'summaryCard';

  summaryCardHeader = document.createElement("div")
  summaryCardHeader.className = 'summaryCardHeader';
  summaryCardHeader.role = 'tab';

  summaryCardHeading = document.createElement("h5")
  summaryCardHeading.className = 'mb-0';

  summaryCardLink = document.createElement("a")
  summaryCardLink.innerHTML = `View Summary`;
  summaryCardLink.className = 'summaryFont';
  summaryCardLink.setAttribute("data-toggle", "collapse");
  summaryCardLink.setAttribute("href", "#viewSummary" + index);

  summaryCardHeading.appendChild(summaryCardLink);
  summaryCardHeader.appendChild(summaryCardHeading);
  summaryCard.appendChild(summaryCardHeader);

  summaryCollapse = document.createElement("div")
  summaryCollapse.setAttribute("id", 'viewSummary' + index);
  summaryCollapse.className = "collapse summaryCollapse";

  summaryCollapseCard = document.createElement("div");
  summaryCollapseCard.className = "mdc-card mdc-card-content summaryBorder";
  summaryCollapseCard.setAttribute('border', '0px');

  summaryContent = document.createElement('div');
  summaryContent.className = 'mdc-card summary-content';
  summaryContent.innerHTML = summary[Object.keys(summary)[index]].split('\n').join('<br />');
  summaryCollapseCard.appendChild(summaryContent);

  summaryCollapse.appendChild(summaryCollapseCard);
  summaryCard.appendChild(summaryCollapse);
  tableAccContent.appendChild(summaryCard);
}

/**
 * Function to create summary tab for each table
 *
 * @param {json} result json object contaning summary for each table
 * @return {null}
 */
const createSummaryFromJson = (result) => {
  jQuery("#download-report").click(function () {
    downloadFilePaths = JSON.parse(localStorage.getItem('downloadFilePaths'));
    reportFilePath = downloadFilePaths.Report;
    reportFileName = reportFilePath.split('/')[reportFilePath.split('/').length - 1];
    filePath = './' + reportFileName;
    readTextFile(filePath, function (text) {
      jQuery("<a />", {
        "download": reportFileName + '.txt',
        "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
      }).appendTo("body")
        .click(function () {
          jQuery(this).remove()
        })[0].click();
    })
  });

  summary = result;
  summaryLength = Object.keys(summary).length;

  summaryAccordion = document.getElementById('summary-accordion');
  summaryUl = document.createElement('ul');

  expand_button = document.createElement("button");
  expand_button.setAttribute('id', 'summaryExpandButton');
  expand_button.innerHTML = "Expand All";
  expand_button.className = "expand";
  expand_button.addEventListener('click', function () {
    if (jQuery(this).html() === 'Expand All') {
      jQuery(this).html('Collapse All');
      jQuery('.summaryCollapse').collapse('show');
    }
    else {
      jQuery(this).html('Expand All');
      jQuery('.summaryCollapse').collapse('hide');
    }
  })
  summaryAccordion.appendChild(expand_button);

  for (var i = 0; i < summaryLength; i++) {
    li = document.createElement('area');

    // panel creation for each table
    summaryTabCard = document.createElement("div");
    summaryTabCard.className = "card";

    summaryTabCardHeader = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    summaryTabCardHeader.className = 'card-header ddl-card-header ddlBorderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    summaryTabCardHeader.role = 'tab';

    summaryTabHeading = document.createElement("h5");
    summaryTabHeading.className = 'mb-0';

    summaryTabLink = document.createElement("a");
    summaryTabLink.innerHTML = `Table: ${Object.keys(summary)[i]} <i class="fas fa-angle-down rotate-icon" />`;
    summaryTabLink.setAttribute("data-toggle", "collapse");
    summaryTabLink.setAttribute("href", "#" + Object.keys(summary)[i] + '-summary');

    summaryTabHeading.appendChild(summaryTabLink);
    summaryTabCardHeader.appendChild(summaryTabHeading);
    summaryTabCard.appendChild(summaryTabCardHeader);

    summaryTabCollapse = document.createElement("div")
    summaryTabCollapse.setAttribute("id", Object.keys(summary)[i] + '-summary')
    summaryTabCollapse.className = "collapse summaryCollapse";

    summaryTabCardContent = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    summaryTabCardContent.className = "mdc-card mdc-card-content ddl-border table-card-border" + mdcCardBorder(conversionRateResp[src_table_name[i]]);

    summaryTabCard2 = document.createElement('div');
    summaryTabCard2.className = 'mdc-card summary-content';
    summaryTabCard2.innerHTML = summary[Object.keys(summary)[i]].split('\n').join('<br />');
    summaryTabCardContent.appendChild(summaryTabCard2);

    summaryTabCollapse.appendChild(summaryTabCardContent);
    summaryTabCard.appendChild(summaryTabCollapse);

    li.appendChild(summaryTabCard);
    summaryUl.appendChild(li);
  }
  summaryAccordion.appendChild(summaryUl);
}

/**
 * Function to create ddl panel for each table
 *
 * @param {json} result json object contaning ddl statements for each table
 * @return {null}
 */
const createDdlFromJson = (result) => {
  jQuery("#download-ddl").click(function () {
    jQuery("<a />", {
      "download": "ddl.json",
      "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 4)),
    }).appendTo("body")
      .click(function () {
        jQuery(this).remove()
      })[0].click()
  });

  ddl = result;
  ddl_length = Object.keys(ddl).length;
  ddl_accordion = document.getElementById('ddl-accordion');

  expand_button = document.createElement("button");
  expand_button.setAttribute('id', 'ddlExpandButton');
  expand_button.innerHTML = "Expand All";
  expand_button.className = "expand";
  expand_button.addEventListener('click', function () {
    if (jQuery(this).html() === 'Expand All') {
      jQuery(this).html('Collapse All');
      jQuery('.ddlCollapse').collapse('show');
    }
    else {
      jQuery(this).html('Expand All');
      jQuery('.ddlCollapse').collapse('hide');
    }
  })
  ddl_accordion.appendChild(expand_button);
  ddlUl = document.createElement('ul');

  for (var i = 0; i < ddl_length; i++) {
    li = document.createElement('area');

    // panel creation for each table
    ddlCard = document.createElement("div");
    ddlCard.className = "card";

    ddlCardHeader = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    ddlCardHeader.className = 'card-header ddl-card-header ddlBorderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    ddlCardHeader.role = 'tab';

    ddlCardHeading = document.createElement("h5")
    ddlCardHeading.className = 'mb-0';

    ddlCardLink = document.createElement("a");
    ddlCardLink.innerHTML = `Table: ${Object.keys(ddl)[i]} <i class="fas fa-angle-down rotate-icon" />`;
    ddlCardLink.setAttribute("data-toggle", "collapse");
    ddlCardLink.setAttribute("href", "#" + Object.keys(ddl)[i] + '-ddl');

    ddlCardHeading.appendChild(ddlCardLink);
    ddlCardHeader.appendChild(ddlCardHeading);
    ddlCard.appendChild(ddlCardHeader);

    ddlCardCollapse = document.createElement("div");
    ddlCardCollapse.setAttribute("id", Object.keys(ddl)[i] + '-ddl');
    ddlCardCollapse.className = "collapse ddlCollapse";

    ddlCardContent = document.createElement("div");
    conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
    ddlCardContent.className = "mdc-card mdc-card-content ddl-border table-card-border" + mdcCardBorder(conversionRateResp[src_table_name[i]]);
    createIndex = (ddl[Object.keys(ddl)[i]]).search('CREATE TABLE');
    createEndIndex = createIndex + 12;
    ddl[Object.keys(ddl)[i]] = ddl[Object.keys(ddl)[i]].substring(0, createIndex) + ddl[Object.keys(ddl)[i]].substring(createIndex, createEndIndex).fontcolor('#4285f4').bold() + ddl[Object.keys(ddl)[i]].substring(createEndIndex);

    ddlCardContent2 = document.createElement('div');
    ddlCardContent2.className = 'mdc-card ddl-content';
    ddlCardContent2.innerHTML = `<pre><code>${ddl[Object.keys(ddl)[i]].split('\n').join(`<span class='sql-c'></span>`)}</code></pre>`
    ddlCardContent.appendChild(ddlCardContent2);

    ddlCardCollapse.appendChild(ddlCardContent)
    ddlCard.appendChild(ddlCardCollapse)

    li.appendChild(ddlCard);
    ddlUl.appendChild(li)
  }
  ddl_accordion.appendChild(ddlUl);
}

/**
 * Function to render edit schema screen from connect to DB mode
 *
 * @param {event} windowEvent hashchange or load event
 * @return {null}
 */
const showSchemaAssessment = async(windowEvent) => {
  showSpinner();
  reportData = await fetch(apiUrl + '/convert/infoschema')
  .then(function (response) {
    if (response.ok) {
      return response;
    }
    else {
      return Promise.reject(response);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  });
  reportDataResp = await reportData.json();
  localStorage.setItem('conversionReportContent', JSON.stringify(reportDataResp));
  await ddlSummaryAndConversionApiCall();
  await getInterleaveInfo();
  sourceTableFlag = localStorage.getItem('sourceDbName');
  jQuery('#connectModalSuccess').modal("hide");
  jQuery('#connectToDbModal').modal("hide");
  jQuery('#globalDataTypeModal').modal("hide");
  const { component = ErrorComponent } = findComponentByPath('/schema-report-connect-to-db', routes) || {};
  document.getElementById('app').innerHTML = component.render();
  showSchemaConversionReportContent();
  if (windowEvent == 'hashchange') {
    sessionRetrieval(sourceTableFlag);
  }
  showSnackbar('schema converted successfully !!', ' greenBg');
}

/**
 * Function to make conversion api call
 *
 * @return {null}
 */
const getConversionRate = async() => {
  conversionRate = await fetch(apiUrl + '/conversion')
  .then(function (response) {
    if (response.ok) {
      return response;
    }
    else {
      return Promise.reject(response);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  });
  conversionRateResp = await conversionRate.json();
  localStorage.setItem('tableBorderColor', JSON.stringify(conversionRateResp));
}

/**
 * Function to make ddl, summary and conversion api calls
 *
 * @return {null}
 */
const ddlSummaryAndConversionApiCall = async() => {
  fetch(apiUrl + '/ddl')
  .then(async function (response) {
    if (response.ok) {
      ddlData=response;
      ddlDataResp = await ddlData.json();
      localStorage.setItem('ddlStatementsContent', JSON.stringify(ddlDataResp));

      fetch(apiUrl + '/summary')
      .then(async function (response) {
        if (response.ok) {
          summaryData=response;
          summaryDataResp = await summaryData.json();
          localStorage.setItem('summaryReportContent', JSON.stringify(summaryDataResp));

          fetch(apiUrl + '/conversion')
          .then(async function (response) {
            if (response.ok) {
              conversionRate=response;
              conversionRateResp = await conversionRate.json();
              localStorage.setItem('tableBorderColor', JSON.stringify(conversionRateResp));
            }
            else {
              return Promise.reject(response);
            }
          })
          .catch(function (err) {
            showSnackbar(err, ' redBg');
          });
        }
        else {
          return Promise.reject(response);
        }
      })
      .catch(function (err) {
        showSnackbar(err, ' redBg');
      });
      
    }
    else {
      return Promise.reject(response);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  });
  
}

/**
 * Function to call create tables function for edit schema screen
 *
 * @param {event} windowEvent hashchange or load event
 * @return {null}
 */
const showSchemaConversionReportContent = () => {
  createSourceAndSpannerTables(JSON.parse(localStorage.getItem('conversionReportContent')));
  createDdlFromJson(JSON.parse(localStorage.getItem('ddlStatementsContent')));
  createSummaryFromJson(JSON.parse(localStorage.getItem('summaryReportContent')));
}

/**
 * Function to make an api call to get download file paths
 *
 * @return {null}
 */
const getFilePaths = () => {
  fetch(apiUrl + '/filepaths')
  .then(async function (response) {
    if (response.ok) {
      filePaths =  response;
      filePathsResp = await filePaths.json();
      localStorage.setItem('downloadFilePaths', JSON.stringify(filePathsResp));
    }
    else {
      filePaths = Promise.reject(response);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  });
}

/**
 * Function to store each session by making an api call
 *
 * @param {string} dbType source db name
 * @return {null}
 */
const sessionRetrieval = (dbType) => {
  fetch(apiUrl + '/session', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(async function (res) {
    if (res.ok) {
      sessionInfoResp = await res.json();
      sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
      sessionInfoResp.sourceDbType = dbType;
      if (sessionStorageArr === null) {
        sessionStorageArr = [];
        sessionStorageArr.push(sessionInfoResp);
      }
      else {
        sessionStorageArr.push(sessionInfoResp);
      }
      sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
    }
    else {
      sessionInfoResp = Promise.reject(res);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  })
}

/**
 * Function to store db dump values in local storage
 *
 * @param {string} dbType selected db like mysql, postgres, etc
 * @param {string} filePath path entered for the dump file
 * @return {null}
 */
const storeDumpFileValues = (dbType, filePath) => {
  if (dbType === 'mysql') {
    localStorage.setItem('globalDbType', dbType + 'dump');
    sourceTableFlag = 'MySQL';
    localStorage.setItem('sourceDbName', sourceTableFlag);
  }
  else if (dbType === 'postgres') {
    localStorage.setItem('globalDbType', 'pg_dump');
    sourceTableFlag = 'Postgres';
    localStorage.setItem('sourceDbName', sourceTableFlag);
  }
  localStorage.setItem('globalDumpFilePath', filePath);
  onLoadDatabase(localStorage.getItem('globalDbType'), localStorage.getItem('globalDumpFilePath'), window.event.type);
}

/**
 * Function to call /convert/dump api to get con json structure
 *
 * @param {string} dbType selected db like mysql, postgres, etc
 * @param {string} dumpFilePath path entered for the dump file
 * @return {null}
 */
const onLoadDatabase = async(dbType, dumpFilePath, windowEvent) => {
  showSpinner();
  reportData = await fetch(apiUrl + '/convert/dump', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Driver": dbType,
      "Path": dumpFilePath
    })
  });
  requestCode = await reportData.status;
  reportDataResp = await reportData.text();

  if (requestCode != 200) {
    hideSpinner();
    showSnackbar(reportDataResp, ' redBg');
    return;
  }
  else {
    window.location.href = '#/schema-report-load-db-dump';
    jQuery('#loadDatabaseDumpModal').modal('hide');
    reportDataResp = JSON.parse(reportDataResp);
    localStorage.setItem('conversionReportContent', JSON.stringify(reportDataResp));
  }
  await ddlSummaryAndConversionApiCall();
  await getInterleaveInfo();
  sourceTableFlag = localStorage.getItem('sourceDbName');
  const { component = ErrorComponent } = findComponentByPath('/schema-report-load-db-dump', routes) || {};
  document.getElementById('app').innerHTML = component.render();
  showSchemaConversionReportContent();
  sessionRetrieval(sourceTableFlag);
  showSnackbar('schema converted successfully !!', ' greenBg');
}

/**
 * Function to get interleave info for each table
 *
 * @return {null}
 */
const getInterleaveInfo = async() => {
  schemaObj = JSON.parse(localStorage.getItem('conversionReportContent'));
  tablesNumber = Object.keys(schemaObj.SpSchema).length;
  for (var i = 0; i < tablesNumber; i++) {
    tableName = Object.keys(schemaObj.ToSpanner)[i];
    interleaveApiCall = await fetch(apiUrl + '/checkinterleave/table?table=' + tableName)
    .then(async function (response) {
      if (response.ok) {
        return response;
      }
      else {
        return Promise.reject(response);
      }
    })
    .catch(function (err) {
      showSnackbar(err, ' redBg');
    });
    interleaveApiCallResp[i] = await interleaveApiCall.json();
  }
  localStorage.setItem('interleaveInfo', JSON.stringify(interleaveApiCallResp));
}

/**
 * Function to call database connection api.
 *
 * @param {string} dbType Type of db like mysql, postgres, etc
 * @param {string} dbHost Database host
 * @param {number} dbPort Database port number
 * @param {string} dbUser Database user name
 * @param {string} dbName Database name
 * @param {string} dbPassword Database password
 * @return {null}
 */
const onconnect = (dbType, dbHost, dbPort, dbUser, dbName, dbPassword) => {
  showSpinner();
  fetch(apiUrl + '/connect', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Driver": dbType,
      "Database": dbName,
      "Password": dbPassword,
      "User": dbUser,
      "Port": dbPort,
      "Host": dbHost
    })
  })
  .then(function (res) {
    hideSpinner();
    if (res.ok) {
      sourceTableFlag = 'MySQL';
      localStorage.setItem('sourceDbName', sourceTableFlag);
      jQuery('#connectToDbModal').modal('hide');
      jQuery('#connectModalSuccess').modal();
      
    }
    else {
      res.text().then(function (result) {
        jQuery('#connectToDbModal').modal('hide');
        jQuery('#connectModalFailure').modal();
      });
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  })
}

/**
 * Function to import schema and populate summary, ddl, conversion report panels
 *
 * @return {null}
 */
const onImport = async() => {
  await getConversionRate();
  await ddlSummaryAndConversionApiCall();
  await getInterleaveInfo();
  jQuery('#importSchemaModal').modal('hide');
  const { component = ErrorComponent } = findComponentByPath('/schema-report-import-db', routes) || {};
  document.getElementById('app').innerHTML = component.render();
  showSchemaConversionReportContent();
}

/**
 * Function to store session info
 *
 * @param {string} driver database driver
 * @param {string} path file path
 * @param {string} fileName file name
 * @param {string} sourceDb source db name
 * @return {null}
 */
const storeResumeSessionId = (driver, path, fileName, sourceDb) => {
  localStorage.setItem('driver', driver);
  localStorage.setItem('path', path);
  localStorage.setItem('fileName', fileName);
  localStorage.setItem('sourceDb', sourceDb);
}

/**
 * Function to read file content when clicked on resume session
 *
 * @param {string} driver database driver
 * @param {string} path file path
 * @param {string} fileName file name
 * @param {string} sourceDb source db name
 * @param {string} windowEvent hashchange or load event
 * @return {null}
 */
const resumeSession = async(driver, path, fileName, sourceDb, windowEvent) => {
  filePath = './' + fileName;
  readTextFile(filePath, function (text) {
    var data = JSON.parse(text);
    localStorage.setItem('conversionReportContent', JSON.stringify(data));
    sourceTableFlag = sourceDb;
  });
  fetch(apiUrl + '/session/resume', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "driver": driver,
      "path": path,
      "fileName": fileName
    })
  })
  .then(function (response) {
    if (response.ok) {
      fetch(apiUrl + '/ddl')
      .then(async function (response) {
        if (response.ok) {
          ddlData=response;
          ddlDataResp = await ddlData.json();
          localStorage.setItem('ddlStatementsContent', JSON.stringify(ddlDataResp));

          fetch(apiUrl + '/summary')
          .then(async function (response) {
            if (response.ok) {
              summaryData=response;
              summaryDataResp = await summaryData.json();
              localStorage.setItem('summaryReportContent', JSON.stringify(summaryDataResp));
            }
            else {
              return Promise.reject(response);
            }
            })
            .catch(function (err) {
              showSnackbar(err, ' redBg');
            });
          }
          else {
            return Promise.reject(response);
          }
          })
          .catch(function (err) {
            showSnackbar(err, ' redBg');
          });
    }
    else {
      Promise.reject(response);
    }
  })
  .catch(function (err) {
    showSnackbar(err, ' redBg');
  });
  // await ddlSummaryAndConversionApiCall();
  await getConversionRate();
  await getInterleaveInfo();
  jQuery('#importSchemaModal').modal('hide');
  const { component = ErrorComponent } = findComponentByPath('/schema-report-resume-session', routes) || {};
  document.getElementById('app').innerHTML = component.render();
  showSchemaConversionReportContent();
  if (windowEvent === 'hashchange') {
    showSnackbar('schema resumed successfully', ' greenBg');
  }
}

/**
 * Callback function to read file content
 *
 * @param {file}
 * @return {null}
 */
const readTextFile = (file, callback) => {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState == 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

/**
 * Function to create session table content
 *
 * @return {null}
 */
const setSessionTableContent = () => {
  sessionArray = JSON.parse(sessionStorage.getItem('sessionStorage'));
  if (sessionArray === null) {
    document.getElementById('session-table-content').innerHTML = `<tr>
      <td colspan='5' class='center session-image'><img src='Icons/Icons/Group 2154.svg' alt='nothing to show'></td>
    </tr>
    <tr>
      <td colspan='5' class='center simple-grey-text'>No active session available! <br> Please connect a database to initiate a new session.</td>
    </tr>`
  }
  else {
    let sessionTableContentEle = document.getElementById('session-table-content');
    for (var x = 0; x < sessionArray.length; x++) {
      session = sessionArray[x];
      driver = session.driver;
      path = session.path;
      sessionName = session.fileName;
      sessionDate = session.createdAt.substr(0, session.createdAt.indexOf("T"));
      sessionTime = session.createdAt.substr(session.createdAt.indexOf("T") + 1);
      sessionTableTr = document.createElement('tr');
      sessionTableTr.className = 'd-flex';

      td1 = document.createElement('td');
      td1.className = 'col-2 session-table-td2';
      td1.innerHTML = sessionName;

      td2 = document.createElement('td');
      td2.className = 'col-4 session-table-td2';
      td2.innerHTML = sessionDate;

      td3 = document.createElement('td');
      td3.className = 'col-2 session-table-td2';
      td3.innerHTML = sessionTime;

      td4 = document.createElement('td');
      td4.setAttribute('id', x);
      td4.className = 'col-4 session-table-td2 session-action';
      td4.innerHTML = `<a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;'>Resume Session</a>`;

      td4.addEventListener('click', function () {
        var index = jQuery(this).attr('id');
        storeResumeSessionId(sessionArray[index].driver, sessionArray[index].path, sessionArray[index].fileName, sessionArray[index].sourceDbType);
      });

      sessionTableTr.appendChild(td1);
      sessionTableTr.appendChild(td2);
      sessionTableTr.appendChild(td3);
      sessionTableTr.appendChild(td4);

      sessionTableContentEle.appendChild(sessionTableTr);
    }
  }
}

const sourceSchema = (val) => {
  if (val === 'mysql') {
    sourceTableFlag = 'MySQL';
  }
  else if (val === 'postgres') {
    sourceTableFlag = 'Postgres';
  }
}

/**
 * Function to render home screen html and initiate home screen tasks
 *
 * @param {any} params 
 * @return {null}
 */
const homeScreen = () => {
  initHomeScreenTasks();
  return homeScreenHtml()
}

/**
 * Function to render home screen html
 *
 * @return {html}
 */
const homeScreenHtml = () => {
  return (`
   <header class="main-header">
   <nav class="navbar navbar-static-top">
     <img src="Icons/Icons/google-spanner-logo.png" class="logo">
   </nav>

   <nav class="navbar navbar-static-top">
     <div class="header-topic"><a href='#/' class="active">Home</a></div>
   </nav>

   <nav class="navbar navbar-static-top">
     <div class="header-topic"><a href="#" class="inactive" style="text-decoration: none;">Schema Conversion</a>
     </div>
   </nav>

   <nav class="navbar navbar-static-top">
     <div class="header-topic"><a href="#/instructions" class="inactive" style="text-decoration: none;">Instructions</a></div>
   </nav>

 </header>

 <div class="main-content">

   <h5 class="welcome-heading">
     Welcome To HarbourBridge
   </h5>

   <h5 class="connect-heading">
     Connect or import your database
   </h5>

   <div class="card-section">
     <div class="card-alignment">
       <div class="card-1-alignment">
         <div class="mdc-card connect-db-icon pointer" data-toggle="modal" data-target="#connectToDbModal" data-backdrop="static" data-keyboard="false">
           <img src="Icons/Icons/Group 2048.svg" width="64" height="64"  style="margin:auto" alt="connect to db">
         </div>
         <div class="connect-text pointer" data-toggle="modal" data-target="#connectToDbModal" data-backdrop="static" data-keyboard="false">
            Connect to Database
         </div>
       </div>


       <div class="card-2-alignment">
         <div class="mdc-card connect-db-icon pointer" data-toggle="modal" data-target="#loadDatabaseDumpModal" data-backdrop="static" data-keyboard="false">
           <img src="Icons/Icons/Group 2049.svg" width="64" height="64" style="margin:auto"  alt="load database image">
         </div>
         <div class="load-text pointer" data-toggle="modal" data-target="#loadDatabaseDumpModal" data-backdrop="static" data-keyboard="false">
            Load Database Dump
          </div>
       </div>

       <div class="card-3-alignment">
         <div class="mdc-card connect-db-icon pointer" data-toggle="modal" data-target="#importSchemaModal" data-backdrop="static" data-keyboard="false">
           <img src="Icons/Icons/Group 2047.svg" width="64" height="64" style="margin:auto"  alt="import schema image">
         </div>
         <div class="import-text pointer" data-toggle="modal" data-target="#importSchemaModal" data-backdrop="static" data-keyboard="false">
            Import Schema File
         </div>
       </div>
     </div>
   </div>

   <div id="snackbar"></div>

   <div class='spinner-backdrop' id='toggle-spinner' style="display:none">
    <div id="spinner"></div>
   </div>

   <h4 class="session-heading">Conversion history</h4>

   <table class="table session-table" style="width: 95%;">
    <thead>
      <tr class="d-flex">
        <th class='col-2 session-table-th2'>Session Name</th>
        <th class='col-4 session-table-th2'>Date</th>
        <th class='col-2 session-table-th2'>Time</th>
        <th class='col-4 session-table-th2'>Action Item</th>
        </tr>
    </thead>
    <tbody id='session-table-content'>
      
    </tbody>
  </table>

 </div>

 <!-- Connect to Db Modal -->
 <div class="modal" id="connectToDbModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header content-center">
        <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Connect to Database</h5>
        <i class="large material-icons close" data-dismiss="modal" onclick="clearModal()">cancel</i>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="dbType" class="">Database Type</label>
          <select class="form-control db-select-input" id="dbType" name="dbType" onchange="toggleDbType()">
             <option value="" style="display: none;"></option>
             <option class="db-option" value="mysql">MySQL</option>
             <option class="db-option" value="postgres">Postgres</option>
             <option class='db-option' value='dynamodb'>dynamoDB</option>
          </select>
        </div>
        <div id="sqlFields" style="display: none;">
             <form id="connectForm">
              <div class="form-group">
                <label class="modal-label" for="dbHost">Database Host</label>
                <input type="text" class="form-control db-input" aria-describedby="" name="dbHost" id="dbHost" autocomplete="off" onfocusout="validateInput(document.getElementById('dbHost'), 'dbHostError')"/>
                <span class='formError' id='dbHostError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbPort">Database Port</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbPort" id="dbPort" autocomplete="off" onfocusout="validateInput(document.getElementById('dbPort'), 'dbPortError')"/>
                <span class='formError' id='dbPortError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbUser">Database User</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbUser" id="dbUser" autocomplete="off" onfocusout="validateInput(document.getElementById('dbUser'), 'dbUserError')"/>
                <span class='formError' id='dbUserError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbName">Database Name</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbName" id="dbName" autocomplete="off" onfocusout="validateInput(document.getElementById('dbName'), 'dbNameError')"/>
                <span class='formError' id='dbNameError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbPassword">Database Password</label>
                <input class="form-control db-input" aria-describedby="" type="password" name="dbPassword" id="dbPassword" autocomplete="off" onfocusout="validateInput(document.getElementById('dbPassword'), 'dbPassError')"/>
                <span class='formError' id='dbPassError'></span><br>
              </div>
            </form>
           </div>
        </div>
      <div id="sqlFieldsButtons" style="display: none;">
        <div class="modal-footer">
           <input type="submit" disabled="disabled" value="Connect" id="connectButton" class="connectButton" 
           onclick="onconnect( document.getElementById('dbType').value, document.getElementById('dbHost').value, document.getElementById('dbPort').value, document.getElementById('dbUser').value, document.getElementById('dbName').value, document.getElementById('dbPassword').value)" />
        </div>
      </div>
    </div>
  </div>
</div>


 <!-- Load Database Dump Modal -->
 <div class="modal loadDatabaseDumpModal" id="loadDatabaseDumpModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->
     <div class="modal-content">
       <div class="modal-header content-center">
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Load Database Dump</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick="clearModal()">cancel</i>
       </div>
       <div class="modal-body">
        <!-- <form id="loadDbForm"> -->
         <div class="form-group">
          <label class="" for="loadDbType">Database Type</label>
            <select class="form-control load-db-input" id="loadDbType" name="loadDbType">
              <option value="" style="display: none;"></option>
              <option class="db-option" value="mysql">MySQL</option>
              <option class="db-option" value="postgres">Postgres</option>
            </select>
         </div>

         <form id="loadDbForm">
          <div class="form-group">
            <label class="modal-label" for="dumpFilePath">Path of the Dump File</label>
            <input class="form-control load-db-input" aria-describedby="" type="text" name="dumpFilePath" id="dumpFilePath" autocomplete="off" onfocusout="validateInput(document.getElementById('dumpFilePath'), 'filePathError')"/>
            <span class='formError' id='filePathError'></span>
          </div>
          <input type="text" style="display: none;">
        </form>

       </div>
       <div class="modal-footer">
         <input type="submit" disabled='disabled' value='Confirm' id='loadConnectButton' class='connectButton' onclick='storeDumpFileValues(document.getElementById("loadDbType").value, document.getElementById("dumpFilePath").value)'/>
       </div>
     </div>

   </div>
 </div>

 <!-- Import Schema Modal -->
 <div class="modal importSchemaModal" id="importSchemaModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->

     <div class="modal-content">
       <div class="modal-header content-center">
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Import Schema File</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick="clearModal()">cancel</i>
       </div>
       <div class="modal-body">

         <form id="importForm" class="importForm">
         <div class="form-group">
         <label class="modal-label" for="importDbType">Database Type</label>
         <select class="form-control import-db-input" id="importDbType" name="importDbType" >
           <option value="" style="display: none;"></option>
           <option class="db-option" value="mysql">MySQL</option>
           <option class="db-option" value="postgres">Postgres</option>
         </select>
         </div>

         <div class="form-group">
         <label class="modal-label" for="schemaFile">Schema File</label><br>
         <input class="form-control" aria-describedby="" id="upload" type="file"/>
         <a href="" id="upload_link">Upload File</a>​
         </div>

         </form>

       </div>
       <div class="modal-footer">
         <a href='#/schema-report-import-db'><input type='submit' disabled='disabled' id='importButton' class='connectButton' value='Confirm' onclick='sourceSchema(document.getElementById("importDbType").value)'/></a>
       </div>
     </div>

   </div>
 </div>
 
 <div class="modal" id="connectModalSuccess" role="dialog" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->

     <div class="modal-content">
       <div class="modal-header content-center">
         
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Connection Successful</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick='clearModal()'>cancel</i>
         
       </div>
       <div class="modal-body" style='margin-bottom: 20px; display: inherit;'>

        <div><i class="large material-icons connectionSuccess">check_circle</i></div>
        <div>Please click on convert button to proceed with schema conversion</div>
        
       </div>
       <div class="modal-footer">
         <a href='#/schema-report-connect-to-db'><button id="convert-button" class="connectButton" type="button">Convert</button></a>
         <button class="buttonload" id="convertLoaderButton" style="display: none;">
            <i class="fa fa-circle-o-notch fa-spin"></i>converting
        </button>
       </div>
     </div>

   </div>
 </div>

 <div class="modal" id="connectModalFailure" role="dialog" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->

     <div class="modal-content">
       <div class="modal-header content-center">
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Connection Failure</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick='clearModal()'>cancel</i>
       </div>
       <div class="modal-body" style='margin-bottom: 20px; display: inherit;'>
          <div><i class="large material-icons connectionFailure">cancel</i></div>
          <div>Please check database configuration details and try again !!</div>
       </div>
       <div class="modal-footer">
         <button data-dismiss="modal" onclick='clearModal()' class="connectButton" type="button">Ok</button>
       </div>
     </div>

   </div>
 </div>
     `)
}