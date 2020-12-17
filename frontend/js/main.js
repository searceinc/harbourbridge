/**
 * Function to initiate home screen tasks like validating form input fields
 *
 * @return {null}
 */
const initHomeScreenTasks = () => {
  $(document).ready(function () {
    setSessionTableContent();
    $('#loadDbForm > div').keyup(function () {
      var empty = false;
      $('#loadDbForm > div > input').each(function () {
        if ($(this).val() == '') {
          empty = true;
        }
      });
      if (empty) {
        $('#loadConnectButton').attr('disabled', 'disabled');
      } else {
        $('#loadConnectButton').removeAttr('disabled');
      }
    });
    $('#connectForm > div').keyup(function () {
      var empty = false;
      $('#connectForm > div > input').each(function () {
        if ($(this).val() == '') {
          empty = true;
        }
      });
      if (empty) {
        $('#connectButton').attr('disabled', 'disabled');
      }
      else {
        $('#connectButton').removeAttr('disabled');
      }
    });
  })
}

/**
 * Function to trigger click event while file uploading
 *
 * @return {null}
 */
$(function () {
  $("#upload_link").on('click', function (e) {
    e.preventDefault();
    $("#upload:hidden").trigger('click');
  });
});

/**
 * Function to update selected file name while file uploading
 *
 * @return {null}
 */
$(document).ready(function () {
  $('#upload').change(function () {
    fileName = $('#upload')[0].files[0].name;
    if (fileName != '') {
      $('#importButton').removeAttr('disabled');
    }
    $("#upload_link").text(fileName);
  });
});

/**
 * Function to read the json content of selected file while file uploading
 *
 * @return {null}
 */
$(document).on('change', '#upload', function (event) {
  var reader = new FileReader();
  reader.onload = function (event) {
    var jsonObj = JSON.parse(event.target.result);
    importSchemaObj = jsonObj;
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
      if (j == 0 && globalDataTypeList[Object.keys(globalDataTypeList)[i]] != null) {
        tableCell.className = 'src-td';
        tableCell.innerHTML = Object.keys(globalDataTypeList)[i];
        tableCell.setAttribute('id', 'dataTypeKey' + (i + 1));
      }
      else if (j == 1) {
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
          if (k == 0 && globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].Brief !== "") {
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
    optionFound = false;
    if (dataTypeOptionArray[x].T == document.getElementById(id).value) {
      optionFound = true;
    }
    if (dataTypeOptionArray[x].T == document.getElementById(id).value && dataTypeOptionArray[x].Brief != "") {

      selectHTML = `<div style='display: flex;'>
                      <i class="large material-icons warning" style='cursor: pointer;' data-toggle='tooltip' data-placement='bottom' title='${dataTypeOptionArray[x].Brief}'>warning</i>
                      <select onchange='dataTypeUpdate(id)' class='form-control tableSelect' id=${id} style='border: 0px !important;'>
                    </div>`;
    }
    if (optionFound == true) {
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
async function createSourceAndSpannerTables(obj) {
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
    console.log(res.ok);
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

  $("#download-schema").click(function () {
    downloadFilePaths = JSON.parse(localStorage.getItem('downloadFilePaths'));
    schemaFilePath = downloadFilePaths.Schema;
    schemaFileName = schemaFilePath.split('/')[schemaFilePath.split('/').length - 1];
    filePath = './' + schemaFileName;
    readTextFile(filePath, function (text) {
      $("<a />", {
        "download": schemaFileName + ".txt",
        "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
      }).appendTo("body")
      .click(function () {
        $(this).remove()
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
    if ($(this).html() == 'Expand All') {
      $(this).html('Collapse All');
      $('.reportCollapse').collapse('show');
    }
    else {
      $(this).html('Expand All');
      $('.reportCollapse').collapse('hide');
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
    $('#globalDataTypeModal').modal();
  });
  accordion.appendChild(editButton);

  var reportUl = document.createElement('ul');
  reportUl.setAttribute('id', 'reportUl');
  z = 0;

  for (var x = 0; x < src_table_num; x++) {
    initialPkSeqId[x] = new Array();
    initialColNameArray[x] = new Array();
    constraintTabCell[x] = new Array();
    primaryTabCell[x] = new Array();
    notPrimary[x] = new Array();
    notNullFoundFlag[x] = new Array();
    keyColumnMap[x] = new Array();
    pkArray[x] = new Array();
    selectedConstraints[x] = new Array();
    spPlaceholder[x] = new Array();
    count_sp[x] = new Array();
    count_src[x] = new Array();
    pksSp[x] = new Array();
  }

  interleaveApiCallResp = JSON.parse(localStorage.getItem('interleaveInfo'));

  // creating table accordion one by one for each table
  for (i = 0; i < src_table_num; i++) {
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
    tableCardHeader.className = 'card-header report-card-header borderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    tableCardHeader.role = 'tab';

    tableCardHeading = document.createElement("h5");
    tableCardHeading.className = 'mb-0';

    tableCardHeaderLink = document.createElement("a");
    tableCardHeaderLink.innerHTML = `Table: ${Object.keys(schemaConversionObj.SrcSchema)[i]} <i class="fas fa-angle-down rotate-icon"></i>`
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
      if ($(this).html() === "Edit Spanner Schema") {
        editSpannerHandler($(this));
      }
      else if ($(this).html() === "Save Changes") {
        saveSpannerChanges($(this));
      }
    })
    tableCardHeading.appendChild(editSpannerSpan);

    tableCardCollapse = document.createElement("div");
    tableCardCollapse.setAttribute("id", Object.keys(schemaConversionObj.SrcSchema)[i]);
    tableCardCollapse.className = "collapse reportCollapse";

    tableCardContent = document.createElement("div");
    tableCardContent.className = 'mdc-card mdc-card-content table-card-border' + mdcCardBorder(conversionRateResp[src_table_name[i]]);

    tableAccContent = document.createElement("div");
    tableAccContent.className = "acc-card-content";

    // creating column headers for each table
    tableColHeaders = [];
    for (var m = 0; m < 6; m++) {
      if (m % 2 == 0) {
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
      if (j % 2 == 0) {
        if (j == 0) {
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

    spannerColumnsIterator(i);

    tableAccContent.appendChild(table)
    tableCardContent.appendChild(tableAccContent)
    tableCardCollapse.appendChild(tableCardContent)
    tableCard.appendChild(tableCardCollapse)
    li.appendChild(tableCard);

    if (sp_table.Fks != null) {
      foreignKeyHandler(i, sp_table.Fks);
    }
    interleaveHandler(i, interleaveApiCallResp[i]);
    if (JSON.parse(localStorage.getItem('summaryReportContent')) != undefined) {
      createSummaryForEachTable(i, JSON.parse(localStorage.getItem('summaryReportContent')));
    }
  }
  accordion.appendChild(reportUl);
  z--;
  while (z != -1) {
    mySelect = new vanillaSelectBox('#srcConstraint' + z, {
      placeHolder: srcPlaceholder[z] + " constraints selected",
      maxWidth: 500,
      maxHeight: 300
    });
    z--;
  }

  for (i = 0; i < src_table_num; i++) {
    table_id = '#src-sp-table' + i;
    $(table_id).DataTable();
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
const spannerColumnsIterator = (i) => {
  for (var k = 0; k < columnsLength; k++) {
    tr = table_body.insertRow(-1);
    currentColumnSrc = Object.keys(schemaConversionObj.ToSpanner[sp_table.Name].Cols)[k];
    currentColumnSp = schemaConversionObj.ToSpanner[sp_table.Name].Cols[k];

    columnNameIterator(i, k);
    dataTypeIterator(i, k);
    constraintIterator(i, k);
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
    if (l % 2 == 0) {
      if (src_table.PrimaryKeys != null && src_table.PrimaryKeys[0].Column == currentColumnSrc) {
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
      currentColumnSp = sp_table_cols[k];
      pksSp[i] = [...sp_table.Pks];
      pkFlag = false
      for (var x = 0; x < pksSp[i].length; x++) {
        if (pksSp[i][x].Col == currentColumnSp) {
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
      if (pkFlag == false) {
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
    if (l % 2 == 0) {
      tabCell.className = "acc-table-td pl-data-type";
      tabCell.setAttribute('id', 'srcDataType' + i + k);
      if (src_table.ColDefs[currentColumnSrc].Type.ArrayBounds != null)
        tabCell.innerHTML = 'ARRAY(' + src_table.ColDefs[currentColumnSrc].Type.Name + ')';
      else
        tabCell.innerHTML = src_table.ColDefs[currentColumnSrc].Type.Name;
    }
    else {
      tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k);
      tabCell.setAttribute('id', 'dataType' + i + k);
      if (sp_table.ColDefs[currentColumnSp].IsArray == true)
        tabCell.innerHTML = 'ARRAY(' + sp_table.ColDefs[currentColumnSp].T.Name + ')';
      else {
        tabCell.innerHTML = sp_table.ColDefs[currentColumnSp].T.Name;
      }
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
const constraintIterator = (i, k) => {
  for (var l = 0; l < 2; l++) {
    tabCell = tr.insertCell(-1);
    tabCell.className = "acc-table-td";
    if (l % 2 == 0) {
      count_src[i][k] = 0;
      srcPlaceholder[z] = count_src[i][k];
      if (src_table.ColDefs[currentColumnSrc].NotNull != undefined) {
        if (src_table.ColDefs[currentColumnSrc].NotNull == true) {
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
      if (sp_table.ColDefs[currentColumnSp].NotNull != undefined) {
        if (sp_table.ColDefs[currentColumnSp].NotNull == true) {
          count_sp[i][k] = count_sp[i][k] + 1
          spPlaceholder[i][k] = count_sp[i][k];
          notNullFound = "<option disabled class='active'>Not Null</option>";
          notNullFoundFlag[i][k] = true;
        }
        else {
          notNullFound = "<option disabled>Not Null</option>";
          notNullFoundFlag[i][k] = false;
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

}

async function interleaveHandler(index, interleaveApiCallResp) {
  // interleaveApiCall = await fetch(apiUrl + '/checkinterleave/table?table=' + tableName);
  // interleaveApiCallResp = await interleaveApiCall.json();
  interleaveCard = document.createElement('div');
  interleaveCard.className = 'summaryCard';

  interleaveCardHeader = document.createElement("div")
  interleaveCardHeader.className = 'interleaveCardHeader';
  interleaveCardHeader.role = 'tab';

  interleaveCardHeading = document.createElement("h5")
  interleaveCardHeading.className = 'mb-0';

  interleaveCardLink = document.createElement("a");
  interleaveCardLink.innerHTML = `Interleave Table`;
  interleaveCardLink.className = 'summaryFont';
  interleaveCardLink.setAttribute("data-toggle", "collapse");
  interleaveCardLink.setAttribute("href", "#viewInterleave" + index);

  interleaveCardHeading.appendChild(interleaveCardLink);
  interleaveCardHeader.appendChild(interleaveCardHeading);
  interleaveCard.appendChild(interleaveCardHeader);

  interleaveCollapse = document.createElement("div")
  interleaveCollapse.setAttribute("id", 'viewInterleave' + index);
  interleaveCollapse.className = "collapse summaryCollapse";

  interleaveCollapseCard = document.createElement("div");
  interleaveCollapseCard.className = "mdc-card mdc-card-content summaryBorder";
  interleaveCollapseCard.setAttribute('border', '0px');

  if (interleaveApiCallResp.Parent == '') {
    interleaveApiCallResp.Parent = 'None';
  }

  interleaveContent = document.createElement('div');
  interleaveContent.className = 'mdc-card summary-content';
  interleaveContent.innerHTML = `<span style='font-weight: bold;'>Comment</span>: ${interleaveApiCallResp.Comment} </br> <span style='font-weight: bold;'>Parent</span>: ${interleaveApiCallResp.Parent} </br> <span style='font-weight: bold;'>Possible</span>: ${interleaveApiCallResp.Possible}`;
  interleaveCollapseCard.appendChild(interleaveContent);

  interleaveCollapse.appendChild(interleaveCollapseCard);
  interleaveCard.appendChild(interleaveCollapse);

  tableAccContent.appendChild(interleaveCard);
}

/**
 * Function to handle spanner table editing
 *
 * @param {event} event event generated by clicking edit spanner button
 * @return {null}
 */
const editSpannerHandler = (event) => {
  if (event.html() == 'Edit Spanner Schema') {
    $(event[0]).removeAttr('data-toggle');
  }

  tableNumber = parseInt(event.attr('id').match(/\d+/), 10);
  uncheckCount[tableNumber] = 0;
  tableId = '#src-sp-table' + tableNumber + ' tr';
  event.html("Save Changes");
  tableColumnNumber = 0;
  tableCheckboxGroup = '.chckClass_' + tableNumber;

  $(tableId).each(function (index) {
    if (index == 1) {
      var temp = $(this).find('.src-tab-cell');
      temp.prepend(`<span class="bmd-form-group is-filled">
                      <div class="checkbox">
                        <label>
                          <input type="checkbox" id='chckAll_${tableNumber}' value="">
                          <span class="checkbox-decorator"><span class="check" style='margin-left: -7px;'></span><div class="ripple-container"></div></span>
                        </label>
                      </div>
                    </span>`)
    }
    $('#chckAll_' + tableNumber).prop('checked', true);
    $('#chckAll_' + tableNumber).click(function () {
      tableNumber = parseInt($(this).attr('id').match(/\d+/), 10);
      switch ($(this).is(':checked')) {
        case true:
          $('.chckClass_' + tableNumber).prop('checked', true);
          break;
        case false:
          $('.chckClass_' + tableNumber).prop('checked', false);
          break;
      }
    });

    if (index > 1) {
      var temp = $(this).find('.src-tab-cell');
      temp.prepend(`<span class="bmd-form-group is-filled">
                      <div class="checkbox">
                        <label>
                          <input type="checkbox" id="chckBox_${tableColumnNumber}" value="" class="chckClass_${tableNumber}">
                          <span class="checkbox-decorator"><span class="check"></span><div class="ripple-container"></div></span>
                        </label>
                      </div>
                    </span>`)
      $(tableCheckboxGroup).prop('checked', true);
      spannerCellsList = document.getElementsByClassName('spannerTabCell' + tableNumber + tableColumnNumber);

      editSpannerColumnName(spannerCellsList[0], tableNumber, tableColumnNumber);
      editSpannerDataType(spannerCellsList[1], tableNumber, tableColumnNumber);
      editSpannerConstraint(spannerCellsList[2], tableNumber, tableColumnNumber);
      tableColumnNumber++;
    }
  })
  check_class = '.chckClass_' + tableNumber;
  $(check_class).click(function () {
    tableNumber = parseInt($(this).closest("table").attr('id').match(/\d+/), 10);
    tableColumnNumber = parseInt($(this).attr('id').match(/\d+/), 10);
    if ($(this).is(":checked")) {
      uncheckCount[tableNumber] = uncheckCount[tableNumber] - 1;
      if (uncheckCount[tableNumber] == 0) {
        $('#chckAll_' + tableNumber).prop('checked', true);
      }
    }
    else {
      uncheckCount[tableNumber] = uncheckCount[tableNumber] + 1;
      $('#chckAll_' + tableNumber).prop('checked', false);
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
    if (pkArray[tableNumber][x].Col == columnNameVal.trim()) {
      currSeqId = pkArray[tableNumber][x].seqId;
    }
  }
  if (notPrimary[tableNumber][tableColumnNumber] == true) {
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
  $('#keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).click(function () {
    $(this).toggleClass('keyActive keyNotActive');
    keyId = $(this).attr('id');
    for (var z = 0; z < keyColumnMap[tableNumber].length; z++) {
      if (keyId == keyColumnMap[tableNumber][z].keyIconId) {
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
 * @param {number} tableColumnNumber
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
  if (pkFoundFlag == false) {
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
    if (columnName == pkArray[tableNumber][z].Col) {
      pkArray[tableNumber].splice(z, 1);
      break;
    }
  }
  for (var x = z; x < pkArray[tableNumber].length; x++) {
    pkArray[tableNumber][x].seqId = pkArray[tableNumber][x].seqId - 1;
  }
  schemaConversionObj.SpSchema[src_table_name[tableNumber]].Pks = pkArray[tableNumber];

  tableColumnNumber = 0;
  $(tableId).each(function (index) {
    if (index > 1) {
      notPrimary[tableNumber][tableColumnNumber] = true;
      currSeqId = '';
      for (var x = 0; x < pkArray[tableNumber].length; x++) {
        if (pkArray[tableNumber][x].Col == initialColNameArray[tableNumber][tableColumnNumber].trim()) {
          currSeqId = pkArray[tableNumber][x].seqId;
          notPrimary[tableNumber][tableColumnNumber] = false;
        }
      }
      if (notPrimary[tableNumber][tableColumnNumber] == true) {
        document.getElementById('keyIcon' + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>`;
      }
      if (notPrimary[tableNumber][tableColumnNumber] == false) {
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
    if (srcCellValue.toLowerCase() == (Object.keys(globalDataTypes)[a]).toLowerCase()) {
      dataTypeArray = globalDataTypes[Object.keys(globalDataTypes)[a]];
      break;
    }
  }
  dataType = `<div class="form-group">
              <select class="form-control spanner-input tableSelect" id='dataType${tableNumber}${tableColumnNumber}${tableColumnNumber}'>`

  if (dataTypeArray != null) {
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
  spannerCellsList[2] = editColumn;
  // not null flag
  if (notNullFoundFlag[tableNumber][tableColumnNumber] == true) {
    notNullFound = "<option class='active' selected>Not Null</option>";
  }
  else if (notNullFoundFlag[tableNumber][tableColumnNumber] == false) {
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
  selectedConstraints[0] = undefined;
  selectedConstraints[1] = undefined;
  $('#spConstraint' + tableNumber + tableColumnNumber).on('change', function () {
    constraintId = $(this).attr('id');
    idNum = parseInt($(this).attr('id').match(/\d+/g), 10);
    constraints = document.getElementById(constraintId);
    constraintsSelected = [];
    for (var c = 0; c < constraints.length; c++) {
      if (constraints.options[c].selected) constraintsSelected.push(constraints.options[c].value);
    }
    selectedConstraints[idNum] = constraintsSelected;
  });
}

/**
 * Function to save changes of spanner table
 *
 * @param {event} event event generated by clicking edit spanner button
 * @return {null}
 */
const saveSpannerChanges = (event) => {
  if (event.html() == 'Save Changes') {
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
  $(tableId).each(function (index) {
    if (index > 1) {
      tableName = src_table_name[tableNumber];
      tableColumnNumber = parseInt($(this).find('.srcColumn').attr('id').match(/\d+/), 10);
      spannerCellsList = document.getElementsByClassName('spannerTabCell' + tableNumber + tableColumnNumber);

      newColumnName = document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber).value;
      originalColumnName = schemaConversionObj.SpSchema[src_table_name[tableNumber]].ColNames[tableColumnNumber];
      
      updatedColsData.UpdateCols[originalColumnName] = {};
      updatedColsData.UpdateCols[originalColumnName]['Removed'] = false;
      if (newColumnName == originalColumnName) {
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

      if (!($(this).find("input[type=checkbox]").is(":checked"))) {
        updatedColsData.UpdateCols[originalColumnName]['Removed'] = true;
      }

      mySelect = new vanillaSelectBox('#spConstraint' + tableNumber + tableColumnNumber, {
        placeHolder: spPlaceholder[tableNumber][tableColumnNumber] + " constraints selected",
        maxWidth: 500,
        maxHeight: 300
      });
    }
  })

  $(tableId).each(function (index) {
    $(this).find('.src-tab-cell .bmd-form-group').remove();
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
          showSchemaConversionReportContent(null);
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
      if (originalColumnName == pksSp[tableNumber][z].Col) {
        foundOriginally = true;
        break;
      }
    }
    if (foundOriginally == false) {
      updatedColsData.UpdateCols[originalColumnName]['PK'] = 'ADDED';
    }

    for (var z = 0; z < currentPks.length; z++) {
      if (currentPks[z].Col == newColumnName) {
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
      if (originalColumnName == pksSp[tableNumber][z].Col) {
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
  if (selectedConstraints[constraintIndex] == undefined) {
    // not null flag
    if (notNullFoundFlag[tableNumber][tableColumnNumber] == true) {
      notNullFound = "<option disabled class='active' selected>Not Null</option>";
      updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'ADDED';
    }
    else if (notNullFoundFlag[tableNumber][tableColumnNumber] == false) {
      notNullFound = "<option disabled>Not Null</option>";
      updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'REMOVED';
    }

    constraintId = 'spConstraint' + tableNumber + tableColumnNumber;
    constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
      + notNullFound
      + "</select>";
  }
  else {
    notNullFound = "<option disabled>Not Null</option>";
    notNullFoundFlag[tableNumber][tableColumnNumber] = false;
    for (var a = 0; a < selectedConstraints[constraintIndex].length; a++) {
      if (selectedConstraints[constraintIndex][a] == 'Not Null') {
        notNullFound = "<option disabled class='active' selected>Not Null</option>";
        notNullFoundFlag[tableNumber][tableColumnNumber] = true;
      }
    }
    if (notNullFoundFlag[tableNumber][tableColumnNumber] == true) {
      updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'ADDED';
    }
    else {
      updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'REMOVED';
    }
    spPlaceholder[tableNumber][tableColumnNumber] = selectedConstraints[constraintIndex].length;
    constraintId = 'spConstraint' + tableNumber + tableColumnNumber;
    constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
      + notNullFound
      + "</select>";
  }
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
  $("#download-report").click(function () {
    downloadFilePaths = JSON.parse(localStorage.getItem('downloadFilePaths'));
    reportFilePath = downloadFilePaths.Report;
    reportFileName = reportFilePath.split('/')[reportFilePath.split('/').length - 1];
    filePath = './' + reportFileName;
    readTextFile(filePath, function (text) {
      $("<a />", {
        "download": reportFileName + '.txt',
        "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
      }).appendTo("body")
        .click(function () {
          $(this).remove()
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
    if ($(this).html() == 'Expand All') {
      $(this).html('Collapse All');
      $('.summaryCollapse').collapse('show');
    }
    else {
      $(this).html('Expand All');
      $('.summaryCollapse').collapse('hide');
    }
  })
  summaryAccordion.appendChild(expand_button);

  for (var i = 0; i < summaryLength; i++) {
    li = document.createElement('area');

    // panel creation for each table
    summaryTabCard = document.createElement("div");
    summaryTabCard.className = "card";

    summaryTabCardHeader = document.createElement("div");
    summaryTabCardHeader.className = 'card-header ddl-card-header ddlBorderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    summaryTabCardHeader.role = 'tab';

    summaryTabHeading = document.createElement("h5");
    summaryTabHeading.className = 'mb-0';

    summaryTabLink = document.createElement("a");
    summaryTabLink.innerHTML = `Table: ${Object.keys(summary)[i]} <i class="fas fa-angle-down rotate-icon"></i>`;
    summaryTabLink.setAttribute("data-toggle", "collapse");
    summaryTabLink.setAttribute("href", "#" + Object.keys(summary)[i] + '-summary');

    summaryTabHeading.appendChild(summaryTabLink);
    summaryTabCardHeader.appendChild(summaryTabHeading);
    summaryTabCard.appendChild(summaryTabCardHeader);

    summaryTabCollapse = document.createElement("div")
    summaryTabCollapse.setAttribute("id", Object.keys(summary)[i] + '-summary')
    summaryTabCollapse.className = "collapse summaryCollapse";

    summaryTabCardContent = document.createElement("div");
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
  $("#download-ddl").click(function () {
    $("<a />", {
      "download": "ddl.json",
      "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 4)),
    }).appendTo("body")
      .click(function () {
        $(this).remove()
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
    if ($(this).html() == 'Expand All') {
      $(this).html('Collapse All');
      $('.ddlCollapse').collapse('show');
    }
    else {
      $(this).html('Expand All');
      $('.ddlCollapse').collapse('hide');
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
    ddlCardHeader.className = 'card-header ddl-card-header ddlBorderBottom' + panelBorderClass(conversionRateResp[src_table_name[i]]);
    ddlCardHeader.role = 'tab';

    ddlCardHeading = document.createElement("h5")
    ddlCardHeading.className = 'mb-0';

    ddlCardLink = document.createElement("a");
    ddlCardLink.innerHTML = `Table: ${Object.keys(ddl)[i]} <i class="fas fa-angle-down rotate-icon"></i>`;
    ddlCardLink.setAttribute("data-toggle", "collapse");
    ddlCardLink.setAttribute("href", "#" + Object.keys(ddl)[i] + '-ddl');

    ddlCardHeading.appendChild(ddlCardLink);
    ddlCardHeader.appendChild(ddlCardHeading);
    ddlCard.appendChild(ddlCardHeader);

    ddlCardCollapse = document.createElement("div");
    ddlCardCollapse.setAttribute("id", Object.keys(ddl)[i] + '-ddl');
    ddlCardCollapse.className = "collapse ddlCollapse";

    ddlCardContent = document.createElement("div");
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
async function showSchemaAssessment(windowEvent) {
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
  showSchemaConversionReportContent(windowEvent);
  sessionRetrieval(sourceTableFlag);
  showSnackbar('schema converted successfully !!', ' greenBg');
}

/**
 * Function to make ddl and summary api calls
 *
 * @return {null}
 */
async function ddlSummaryAndConversionApiCall() {
  ddlData = await fetch(apiUrl + '/ddl')
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
  ddlDataResp = await ddlData.json();
  localStorage.setItem('ddlStatementsContent', JSON.stringify(ddlDataResp));

  summaryData = await fetch(apiUrl + '/summary')
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
  summaryDataResp = await summaryData.json();
  localStorage.setItem('summaryReportContent', JSON.stringify(summaryDataResp));

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
 * Function to call create tables function for edit schema screen
 *
 * @param {event} windowEvent hashchange or load event
 * @return {null}
 */
const showSchemaConversionReportContent = (windowEvent) => {
  createSourceAndSpannerTables(JSON.parse(localStorage.getItem('conversionReportContent')));
  createDdlFromJson(JSON.parse(localStorage.getItem('ddlStatementsContent')));
  createSummaryFromJson(JSON.parse(localStorage.getItem('summaryReportContent')));
}

/**
 * Function to make an api call to get download file paths
 *
 * @return {null}
 */
async function getFilePaths() {
  filePaths = await fetch(apiUrl + '/filepaths')
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
  filePathsResp = await filePaths.json();
  localStorage.setItem('downloadFilePaths', JSON.stringify(filePathsResp));
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
  .then(function (res) {
    if (res.ok) {
      res.json().then(function (sessionInfoResp) {
        sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
        sessionInfoResp.sourceDbType = dbType;
        if (sessionStorageArr == null) {
          sessionStorageArr = [];
          sessionStorageArr.push(sessionInfoResp);
        }
        else {
          sessionStorageArr.push(sessionInfoResp);
        }
        sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
      })
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
 * Function to store db dump values in local storage
 *
 * @param {string} dbType selected db like mysql, postgres, etc
 * @param {string} filePath path entered for the dump file
 * @return {null}
 */
const storeDumpFileValues = (dbType, filePath) => {
  if (dbType == 'mysql') {
    localStorage.setItem('globalDbType', dbType + 'dump');
    sourceTableFlag = 'MySQL';
    localStorage.setItem('sourceDbName', sourceTableFlag);
  }
  else if (dbType == 'postgres') {
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
async function onLoadDatabase(dbType, dumpFilePath, windowEvent) {
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
  showSchemaConversionReportContent(windowEvent);
  sessionRetrieval(sourceTableFlag);
  showSnackbar('schema converted successfully !!', ' greenBg');
}

async function getInterleaveInfo() {
  schemaObj = JSON.parse(localStorage.getItem('conversionReportContent'));
  tablesNumber = Object.keys(schemaObj.SpSchema).length;
  for (i = 0; i < tablesNumber; i++) {
    tableName = Object.keys(schemaObj.ToSpanner)[i];
    interleaveApiCall = await fetch(apiUrl + '/checkinterleave/table?table=' + tableName)
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
  if (!isLive) {
    jQuery('#connectToDbModal').modal('hide');
    jQuery('#connectModalSuccess').modal();
  }

  else {
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
      if (res.ok) {
        res.text().then(function (result) {
          hideSpinner();
          error = result
          if (error == "") {
            sourceTableFlag = 'MySQL';
            localStorage.setItem('sourceDbName', sourceTableFlag);
            jQuery('#connectToDbModal').modal('hide');
            jQuery('#connectModalSuccess').modal();
          }
          else {
            jQuery('#connectToDbModal').modal('hide');
            jQuery('#connectModalFailure').modal();
          }
        })
      }
      else {
        return Promise.reject(res);
      }
    })
    .catch(function (err) {
      showSnackbar(err, ' redBg');
    })
  }
}

/**
 * Function to import schema and populate summary, ddl, conversion report panels
 *
 * @return {null}
 */
async function onImport() {
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
const resumeSession = (driver, path, fileName, sourceDb, windowEvent) => {
  filePath = './' + fileName;
  readTextFile(filePath, async function (text) {
    var data = JSON.parse(text);
    localStorage.setItem('conversionReportContent', JSON.stringify(data));
    sourceTableFlag = sourceDb;
    fileData = await fetch(apiUrl + '/session/resume', {
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
        return response;
      }
      else {
        return Promise.reject(response);
      }
    })
    .catch(function (err) {
      showSnackbar(err, ' redBg');
    });
    await ddlSummaryAndConversionApiCall();
    await getInterleaveInfo();
    jQuery('#importSchemaModal').modal('hide');
    const { component = ErrorComponent } = findComponentByPath('/schema-report-resume-session', routes) || {};
    document.getElementById('app').innerHTML = component.render();
    showSchemaConversionReportContent();
    if (windowEvent == 'hashchange') {
      showSnackbar('schema resumed successfully', ' greenBg');
    }
  });
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
    if (rawFile.readyState === 4 && rawFile.status == "200") {
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
  if (sessionArray == null) {
    document.getElementById('session-table-content').innerHTML = `<tr>
      <td colspan='5' class='center session-image'><img src='assets/icons/Group 2154.svg' alt='nothing to show'></td>
    </tr>
    <tr>
      <td colspan='5' class='center simple-grey-text'>No active session available! <br> Please connect a database to initiate a new session.</td>
    </tr>`
  }
  else {
    sessionTableContent = document.getElementById('session-table-content');
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
        var index = $(this).attr('id');
        storeResumeSessionId(sessionArray[index].driver, sessionArray[index].path, sessionArray[index].fileName, sessionArray[index].sourceDbType);
      });

      sessionTableTr.appendChild(td1);
      sessionTableTr.appendChild(td2);
      sessionTableTr.appendChild(td3);
      sessionTableTr.appendChild(td4);

      sessionTableContent.appendChild(sessionTableTr);
    }
  }
}

const sourceSchema = (val) => {
  if (val == 'mysql') {
    sourceTableFlag = 'MySQL';
  }
  else if (val == 'postgres') {
    sourceTableFlag = 'Postgres';
  }
}

/**
 * Function to render home screen html and initiate home screen tasks
 *
 * @param {any} params 
 * @return {null}
 */
const homeScreen = (params) => {
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
   <body>
   <header class="main-header">
   <nav class="navbar navbar-static-top">
     <img src="Icons/Icons/google-spanner-logo.png" class="logo">
   </nav>

   <nav class="navbar navbar-static-top">
     <div class="header-topic"><a href='/frontend/' class="active">Home</a></div>
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
          <select class="form-control db-select-input" id="dbType" name="dbType" onchange="toggle()">
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
                <input type="text" class="form-control db-input" aria-describedby="" name="dbHost" id="dbHost" autocomplete="off" onfocusout="validateInput(document.getElementById('dbHost'))"/>
                <span class='formError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbPort">Database Port</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbPort" id="dbPort" autocomplete="off" onfocusout="validateInput(document.getElementById('dbPort'))"/>
                <span class='formError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbUser">Database User</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbUser" id="dbUser" autocomplete="off" onfocusout="validateInput(document.getElementById('dbUser'))"/>
                <span class='formError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbName">Database Name</label>
                <input class="form-control db-input" aria-describedby="" type="text" name="dbName" id="dbName" autocomplete="off" onfocusout="validateInput(document.getElementById('dbName'))"/>
                <span class='formError'></span><br>
              </div>

              <div class="form-group">
                <label class="modal-label" for="dbPassword">Database Password</label>
                <input class="form-control db-input" aria-describedby="" type="password" name="dbPassword" id="dbPassword" autocomplete="off" onfocusout="validateInput(document.getElementById('dbPassword'))"/>
                <span class='formError'></span><br>
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
            <select class="form-control load-db-input" id="loadDbType" name="loadDbType" onchange="toggle()">
              <option value="" style="display: none;"></option>
              <option class="db-option" value="mysql">MySQL</option>
              <option class="db-option" value="postgres">Postgres</option>
            </select>
         </div>

         <form id="loadDbForm">
          <div class="form-group">
            <label class="modal-label" for="dumpFilePath">Path of the Dump File</label>
            <input class="form-control load-db-input" aria-describedby="" type="text" name="dumpFilePath" id="dumpFilePath" autocomplete="off" onfocusout="validateInput(document.getElementById('dumpFilePath'))"/>
            <span class='formError'></span>
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
         <select class="form-control import-db-input" id="importDbType" name="importDbType" onchange="toggle()">
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
         <i class="large material-icons close" data-dismiss="modal" onclick="clickCancelModal()">cancel</i>
         
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
         <i class="large material-icons close" data-dismiss="modal" onclick="clickCancelModal()">cancel</i>
       </div>
       <div class="modal-body" style='margin-bottom: 20px; display: inherit;'>
          <div><i class="large material-icons connectionFailure">cancel</i></div>
          <div>Please check database configuration details and try again !!</div>
       </div>
       <div class="modal-footer">
         <button onclick="clickCancelModal()" class="connectButton" type="button">Ok</button>
       </div>
     </div>

   </div>
 </div>
 
    </body>
  
     `)
}