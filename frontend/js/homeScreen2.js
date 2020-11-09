/**
 * Function to initiate home screen tasks like validating form input fields
 *
 * @return {null}
 */
function initHomeScreenTasks() {
  $(document).ready(function () {

    setSessionTableContent();

    $('#loadDbForm > div').keyup(function () {
      var empty = false;
      $('#loadDbForm > input').each(function () {
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
    // var i = $(this).prev('label').clone();
    var file = $('#upload')[0].files[0].name;
    if (file != '') {
      $('#importButton').removeAttr('disabled');
    }
    $("#upload_link").text(file);
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
    localStorage.setItem('importSchema', JSON.stringify(importSchemaObj));
  }
  reader.readAsText(event.target.files[0]);
});

/**
 * Function to create global edit data type table
 *
 * @return {null}
 */
function createEditDataTypeTable() {
  dataTypeLength = Object.keys(dataType).length;
  var dataTypeTable = document.createElement('table');
  dataTypeTable.className = 'data-type-table';
  dataTypeTable.setAttribute('id', 'globalDataType');
  var tbdy = document.createElement('tbody');

  var tr = document.createElement('tr');
  var th1 = document.createElement('th');
  th1.innerHTML = 'Source';
  var th2 = document.createElement('th');
  th2.innerHTML = 'Spanner';
  tr.appendChild(th1);
  tr.appendChild(th2);
  tbdy.appendChild(tr);

  for (var i = 0; i < dataTypeLength; i++) {
    var tr = document.createElement('tr');
    tr.setAttribute('id', 'dataTypeRow' + (i + 1));
    for (var j = 0; j < 2; j++) {
      var td = document.createElement('td');
      if (j == 0) {
        td.className = 'src-td';
        td.innerHTML = Object.keys(dataType)[i];
      }
      else {
        var len = dataType[Object.keys(dataType)[i]].length;
        var dataTypeArr = [];
        for (var k = 0; k < len; k++) {
          dataTypeArr.push(dataType[Object.keys(dataType)[i]][k].T);
        }

        var selectHTML = "";
        var selectId = 'dataTypeSel' + (i + 1) + j;
        selectHTML = "<select class='form-control tableSelect' id=" + selectId + " style='border: 0px !important;'>";
        for (var k = 0; k < dataTypeArr.length; k++) {
          selectHTML += "<option value='" + dataTypeArr[k] + "'>" + dataTypeArr[k] + "</option>";
        }
        selectHTML += "</select>";
        td.innerHTML = selectHTML;

      }
      tr.appendChild(td);
    }
    tbdy.appendChild(tr);
  }
  dataTypeTable.appendChild(tbdy);
  var dataTypeDiv = document.getElementById('globalDataType');
  dataTypeDiv.innerHTML = '';
  dataTypeDiv.appendChild(dataTypeTable);
}

/**
 * Function to call /getTypeMap api to fetch global data type table values
 *
 * @return {null}
 */
function editGlobalDataType() {
  // showSpinner();
  if (!isLive) {
    createEditDataTypeTable();
  }

  else {
    // showSpinner();
    fetch(apiUrl + '/getTypeMap', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(function (res) {
        res.json().then(function (result) {
          // hideSpinner();
          createEditDataTypeTable();
        })
      })
  }
}

function editButtonClicked(event) {
  num = parseInt(event.attr('id').match(/\d+/), 10);
  tableid = '#src-sp-table' + num + ' tr';
  document.getElementById('editSpannerIcon' + num).innerHTML = `<i style="font-weight: 600; font-size: 18px;" class="large material-icons" style="font-size: 18px;">done</i>`
  event.html("Save Changes");
  tdCnt = 0;
  $(tableid).each(function (index) {
    if (index > 0) {
      var temp = $(this).find('.src-tab-cell')
      tableCheckboxGroup = '.chckClass_' + num;
      temp.prepend(`<span class="bmd-form-group is-filled">
                      <div class="checkbox">
                        <label>
                          <input type="checkbox" id="chckBox_${tdCnt}" value="" class="chckClass_${num}">
                          <span class="checkbox-decorator"><span class="check"></span><div class="ripple-container"></div></span>
                        </label>
                      </div>
                    </span>`)
      $(tableCheckboxGroup).prop('checked', true);
      list = document.getElementsByClassName('spannerTabCell' + num + tdCnt);
      var columnNameVal = document.getElementById('columnNameText' + num + tdCnt + tdCnt).innerHTML;
      initialColNameArray[num].push(columnNameVal);
      currSeqId = '';
      for (var x = 0; x < pkArray[num].length; x++) {
        if (pkArray[num][x].Col == columnNameVal.trim()) {
          currSeqId = pkArray[num][x].seqId;
        }
      }
      if (notPrimary[num][tdCnt] == true) {
        list[0].innerHTML = `<span class="column left keyNotActive keyMargin keyClick" id='keyIcon${num}${tdCnt}${tdCnt}'>
                              <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px;"></i> -->
                              <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>
                            </span>
                            <span class="column right form-group">
                              <input id='columnNameText${num}${tdCnt}${tdCnt}' type="text" value=${columnNameVal} class="form-control spanner-input">
                            </span>`
      }
      else {
        list[0].innerHTML = `<span class="column left keyActive keyMargin keyClick" id='keyIcon${num}${tdCnt}${tdCnt}'>
                              <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px;"></i> -->
                            <sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
                            </span>
                            <span class="column right form-group">
                              <input id='columnNameText${num}${tdCnt}${tdCnt}' type="text" value=${columnNameVal} class="form-control spanner-input">
                            </span>`
      }
      $('#keyIcon' + num + tdCnt + tdCnt).click(function () {
        $(this).toggleClass('keyActive keyNotActive');
        keyId = $(this).attr('id');
        var columnName;
        console.log(keyColumnMap[num]);
        for (var z = 0; z < keyColumnMap[num].length; z++) {
          if (keyId == keyColumnMap[num][z].keyIconId) {
            columnName = keyColumnMap[num][z].columnName;
          }
        }
        
        if (document.getElementById(keyId).classList.contains('keyActive')) {
          // notPrimary[num][tdCnt] = false;
          // pkArray[num] = schemaConversionObj.SpSchema[src_table_name[num]].Pks;
          maxSeqId = 0;
          for (var z = 0; z < pkArray[num].length; z++) {
            if (pkArray[num][z].seqId > maxSeqId) {
              maxSeqId = pkArray[num][z].seqId;
            }
          }
          maxSeqId = maxSeqId + 1;
          pkSeqId[num] = maxSeqId;
          pkFoundFlag = false;
          for (var z = 0; z < pkArray[num].length; z++) {
            if (columnName != pkArray[num][z].Col) {
              pkFoundFlag = false;
            }
            else {
              pkFoundFlag = true;
              break;
            }
          }
          if (pkFoundFlag == false) {
            pkArray[num].push({ 'Col': columnName, 'seqId': pkSeqId[num] });
            // pkSeqId[num]++;
          }
          console.log(pkArray[num]);
          schemaConversionObj.SpSchema[src_table_name[num]].Pks = pkArray[num];
          // schemaConversionObj_original.SpSchema[src_table_name[num]].Pks = pkArray[num];
          document.getElementById(keyId).innerHTML = `<sub>${pkSeqId[num]}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>`;
        }
        else {
          // notPrimary[num][tdCnt] = true;
          // document.getElementById(keyId).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>`;
          for (var z = 0; z < pkArray[num].length; z++) {
            if (columnName == pkArray[num][z].Col) {
              pkArray[num].splice(z, 1);
              break;
            }
          }
          for (var x = z; x < pkArray[num].length; x++) {
            pkArray[num][x].seqId = pkArray[num][x].seqId - 1;
          }
          schemaConversionObj.SpSchema[src_table_name[num]].Pks = pkArray[num];
          // schemaConversionObj_original.SpSchema[src_table_name[num]].Pks = pkArray[num];
          console.log(pkArray[num]);

          tdCnt = 0;
          $(tableid).each(function (index) {
            if (index > 0) {
              notPrimary[num][tdCnt] = true;
              // var columnNameVal = document.getElementById('columnNameText' + num + tdCnt + tdCnt).value;
              currSeqId = '';
              for (var x = 0; x < pkArray[num].length; x++) {
                // for (var y = 0; y < initialColNameArray.length; y++) {
                //   debugger
                console.log(initialColNameArray[num]);
                  if (pkArray[num][x].Col == initialColNameArray[num][tdCnt].trim()) {
                    currSeqId = pkArray[num][x].seqId;
                    notPrimary[num][tdCnt] = false;
                  }
                // }
              }
              if (notPrimary[num][tdCnt] == true) {
                document.getElementById('keyIcon' + num + tdCnt + tdCnt).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>`;
              }
              if (notPrimary[num][tdCnt] == false) {
                document.getElementById('keyIcon' + num + tdCnt + tdCnt).innerHTML = `<sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>`;
              }
              tdCnt++
            }
          });
        }
      });
      // list[0].innerHTML = `<div class="form-group">
      //                       <input id='columnName${num}${tdCnt}${tdCnt}' type="text" value=${val_flag} class="form-control spanner-input">
      //                      </div>`
      var val_flag = list[1].innerHTML;
      list[1].innerHTML = `<div class="form-group">
                            <select class="form-control spanner-input tableSelect" id='dataType${num}${tdCnt}${tdCnt}'>
                                <option value=${val_flag}>${val_flag}</option>
                                <option value='INT'>INT</option>
                                <option value='FLOAT'>FLOAT</option>
                            </select>
                          </div>`

      // not null flag
      if (notNullFoundFlag[num][tdCnt] == true) {
        notNullFound = "<option class='active' selected>Not Null</option>";
      }
      else if (notNullFoundFlag[num][tdCnt] == false) {
        notNullFound = "<option>Not Null</option>";
      }
      else {
        notNullFound = '';
      }

      // unique flag
      if (uniqueFoundFlag[num][tdCnt] == true) {
        uniqueFound = "<option class='active' selected>Unique</option>";
      }
      else if (uniqueFoundFlag[num][tdCnt] == false) {
        uniqueFound = "<option>Unique</option>";
      }
      else {
        uniqueFound = '';
      }

      constraintId = 'spConstraint' + num + tdCnt;
      constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
        + notNullFound
        + uniqueFound
        + "</select>";
      list[2].innerHTML = constraintHtml;
      list[2].setAttribute('class', 'sp-column acc-table-td spannerTabCell' + num + tdCnt);

      mySelect = new vanillaSelectBox("#spConstraint" + num + tdCnt, {
        placeHolder: "Select Constraints",
        maxWidth: 500,
        maxHeight: 300
      });
      selectedConstraints[0] = undefined;
      selectedConstraints[1] = undefined;
      $('#spConstraint' + num + tdCnt).on('change', function () {
        constraintId = $(this).attr('id');
        idNum = parseInt($(this).attr('id').match(/\d+/g), 10);
        var select1 = document.getElementById(constraintId);
        var selected1 = [];
        for (var c = 0; c < select1.length; c++) {
          if (select1.options[c].selected) selected1.push(select1.options[c].value);
        }
        selectedConstraints[idNum] = selected1;
      });

      tdCnt++
    }
  })
  // schemaConversionObj.SpSchema[src_table_name[num]] = JSON.parse(JSON.stringify(schemaConversionObj_original.SpSchema[src_table_name[num]]))
  check_class = '.chckClass_' + num;
  $(check_class).click(function () {
  //   num = parseInt($(this).closest("table").attr('id').match(/\d+/), 10)
  //   num2 = parseInt($(this).attr('id').match(/\d+/), 10)
  //   list = document.getElementsByClassName('spannerTabCell' + num + num2)

  //   if ($(this).is(":checked")) {
  //     var columnNameVal = document.getElementById('columnNameText' + num + num2 + num2).innerHTML;
  //     // initialColNameArray[num].push(columnNameVal);
  //     currSeqId = '';
  //     for (var x = 0; x < pkArray[num].length; x++) {
  //       if (pkArray[num][x].Col == columnNameVal.trim()) {
  //         currSeqId = pkArray[num][x].seqId;
  //       }
  //     }

  //     if (notPrimary[num][num2] == true) {
  //       list[0].innerHTML = `<span class="column left keyNotActive keyMargin keyClick" id='keyIcon${num}${num2}${num2}'>
  //                           <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px;"></i> -->
  //                           <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>
  //                         </span>
  //                         <span class="column right form-group">
  //                           <input id='columnNameText${num}${num2}${num2}' type="text" value=${columnNameVal} class="form-control spanner-input">
  //                         </span>`
  //     }
  //     else {
  //       list[0].innerHTML = `<span class="column left keyActive keyMargin keyClick" id='keyIcon${num}${num2}${num2}'>
  //                           <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px;"></i> -->
  //                           <sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
  //                         </span>
  //                         <span class="column right form-group">
  //                           <input id='columnNameText${num}${num2}${num2}' type="text" value=${document.getElementById('columnNameText' + num + num2 + num2).innerHTML} class="form-control spanner-input">
  //                         </span>`
  //     }
  //     $('#keyIcon' + num + num2 + num2).click(function () {
  //       $(this).toggleClass('keyActive keyNotActive');
  //       keyId = $(this).attr('id');
  //       if (document.getElementById(keyId).classList.contains('keyActive')) {
  //         document.getElementById(keyId).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px.svg'>`
  //       }
  //       else {
  //         document.getElementById(keyId).innerHTML = `<img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg'>`;
  //       }
  //     })
  //     list[1].innerHTML = `<div class="form-group">
  //                           <select class="form-control spanner-input tableSelect" id='dataType${num}${num2}${num2}'>
  //                               <option value=${document.getElementById('dataType' + num + num2).innerHTML}>${document.getElementById('dataType' + num + num2).innerHTML}</option>
  //                               <option value='INT'>INT</option>
  //                               <option value='FLOAT'>FLOAT</option>
  //                           </select>
  //                         </div>`;

  //     constraintIndex = String(num) + String(num2);
  //     constraintIndex = parseInt(constraintIndex);

  //     // not null flag
  //     if (notNullFoundFlag[num][num2] == true) {
  //       notNullFound = "<option class='active' selected>Not Null</option>";
  //     }
  //     else if (notNullFoundFlag[num][num2] == false) {
  //       notNullFound = "<option>Not Null</option>";
  //     }
  //     else {
  //       notNullFound = '';
  //     }

  //     // unique flag
  //     if (uniqueFoundFlag[num][num2] == true) {
  //       uniqueFound = "<option class='active' selected>Unique</option>";
  //     }
  //     else if (uniqueFoundFlag[num][num2] == false) {
  //       uniqueFound = "<option>Unique</option>";
  //     }
  //     else {
  //       uniqueFound = '';
  //     }

  //     constraintId = 'spConstraint' + num + num2;
  //     constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
  //       + notNullFound
  //       + uniqueFound
  //       + "</select>";
  //     list[2].innerHTML = constraintHtml;
  //     list[2].setAttribute('class', 'sp-column acc-table-td spannerTabCell' + num + num2);
  //     mySelect = new vanillaSelectBox("#spConstraint" + num + num2, {
  //       placeHolder: "Select Constraints",
  //       maxWidth: 500,
  //       maxHeight: 300
  //     });

  //     $('#spConstraint' + num + num2).on('change', function () {
  //       constraintId = $(this).attr('id');
  //       idNum = parseInt($(this).attr('id').match(/\d+/g), 10);
  //       var select1 = document.getElementById(constraintId);
  //       var selected1 = [];
  //       for (var c = 0; c < select1.length; c++) {
  //         if (select1.options[c].selected) selected1.push(select1.options[c].value);
  //       }
  //       selectedConstraints[idNum] = selected1;
  //     });
  //   }
  //   else {
  //     list[0].innerHTML = primaryTabCell[num][num2];
  //     // list[0].innerHTML = document.getElementById('columnName'+num+num2+num2).value;
  //     list[1].innerHTML = document.getElementById('dataType' + num + num2 + num2).value;
  //     // list[2].innerHTML = document.getElementById('constraint'+num+num2+num2).value;
  //     list[2].innerHTML = constraintTabCell[num][num2];
  //     mySelect = new vanillaSelectBox("#spConstraint" + num + num2, {
  //       placeHolder: spPlaceholder[num][num2] + " constraints selected",
  //       maxWidth: 500,
  //       maxHeight: 300
  //     });
  //   }
    
  })
}

function saveButtonClicked(event) {
  var array = [];
  num = parseInt(event.attr('id').match(/\d+/), 10)
  tableid = '#src-sp-table' + num + ' tr'
  document.getElementById('editSpannerIcon' + num).innerHTML = `<i class="large material-icons" style="font-size: 18px;">edit</i>`
  event.html("Edit Spanner Schema");
  notPkArray = [];
  initialColNameArray[num] = [];
  currentPks = schemaConversionObj.SpSchema[src_table_name[num]].Pks;
  $(tableid).each(function (index) {
    if ($(this).find("input[type=checkbox]").is(":checked")) {
      num2 = parseInt($(this).find("input[type=checkbox]").attr('id').match(/\d+/), 10)
      list = document.getElementsByClassName('spannerTabCell' + num + num2);

      // schemaConversionObj.SpSchema[src_table_name].ColNames[num2] = document.getElementById('columnNameText'+num+num2+num2).value;
      newColumnName = document.getElementById('columnNameText' + num + num2 + num2).value;
      originalColumnName = schemaConversionObj.SpSchema[src_table_name[num]].ColNames[num2];
      schemaConversionObj.SpSchema[src_table_name[num]].ColNames[num2] = newColumnName;
      // schemaConversionObj_original.SpSchema[src_table_name[num]].ColNames[num2] = newColumnName;
      keyColumnMap[num][num2].columnName = newColumnName;
      initialColNameArray[num].push(newColumnName);

      if (newColumnName != originalColumnName) {
        colDefsKeys = Object.keys(schemaConversionObj.SpSchema[src_table_name[num]].ColDefs);
        for (var x = 0; x < colDefsKeys.length; x++) {
          if (colDefsKeys[x] == originalColumnName) {
            newColDefKey = newColumnName;
            newColDefValue = schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[originalColumnName];
            delete schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[originalColumnName];
            // delete schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[originalColumnName];
            break;
          }
        }
        schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColDefKey] = newColDefValue;
        // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColDefKey] = newColDefValue;

        schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].Name = newColumnName;
        // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].Name = newColumnName;

        table_pks = schemaConversionObj_original.SpSchema[src_table_name[num]].Pks;
        for (var x = 0; x < table_pks.length; x++) {
          if (table_pks[x].Col == originalColumnName) {
            table_pks[x].Col = newColumnName;
          }
        }
        schemaConversionObj.SpSchema[src_table_name[num]].Pks = table_pks;
        // schemaConversionObj_original.SpSchema[src_table_name[num]].Pks = table_pks;

        toSpannerColumns = Object.keys(schemaConversionObj.ToSpanner[src_table_name[num]].Cols);
        for (var x = 0; x < toSpannerColumns.length; x++) {
          if (schemaConversionObj_original.ToSpanner[src_table_name[num]].Cols[toSpannerColumns[x]] == originalColumnName) {
            // schemaConversionObj_original.ToSpanner[src_table_name[num]].Cols[toSpannerColumns[x]] = newColumnName;
            schemaConversionObj.ToSpanner[src_table_name[num]].Cols[toSpannerColumns[x]] = newColumnName;
          }
        }

        toSourceKeys = Object.keys(schemaConversionObj.ToSource[src_table_name[num]].Cols);
        for (var x = 0; x < toSourceKeys.length; x++) {
          if (toSourceKeys[x] == originalColumnName) {
            newToSourceKey = newColumnName;
            newToSourceValue = schemaConversionObj_original.ToSource[src_table_name[num]].Cols[toSourceKeys[x]];
            delete schemaConversionObj.ToSource[src_table_name[num]].Cols[toSourceKeys[x]];
            // delete schemaConversionObj_original.ToSource[src_table_name[num]].Cols[toSourceKeys[x]];
            break;
          }
        }
        schemaConversionObj.ToSource[src_table_name[num]].Cols[newToSourceKey] = newToSourceValue;
        // schemaConversionObj_original.ToSource[src_table_name[num]].Cols[newToSourceKey] = newToSourceValue;
      }

      schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].T.Name = document.getElementById('dataType' + num + num2 + num2).value;
      // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].T.Name = document.getElementById('dataType' + num + num2 + num2).value;

      // list[0].innerHTML = document.getElementById('columnName'+num+num2+num2).value;
      if (document.getElementById('keyIcon' + num + num2 + num2).classList.contains('keyActive')) {
        for (var z = 0; z < currentPks.length; z++) {
          if (currentPks[z].Col == newColumnName) {
            currSeqId = currentPks[z].seqId;
          }
        }
        list[0].innerHTML = `<span class="column left keyActive">
                              <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px;"></i> -->
                              <sub>${currSeqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
                            </span>
                            <span class="column right" id='columnNameText${num}${num2}${num2}'>
                              ${document.getElementById('columnNameText' + num + num2 + num2).value}
                            </span>`;
        notPrimary[num][num2] = false;
      }
      else {
        list[0].innerHTML = `<span class="column left">
                              <!-- <i class="fas fa-key" aria-hidden="true" style="font-size: 18px; visibility: hidden;"></i> -->
                              <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg' style='visibility: hidden;'>
                            </span>
                            <span class="column right" id='columnNameText${num}${num2}${num2}'>
                              ${document.getElementById('columnNameText' + num + num2 + num2).value}
                            </span>`;
        notPrimary[num][num2] = true;
      }

      list[1].innerHTML = document.getElementById('dataType' + num + num2 + num2).value;
      // list[2].innerHTML = document.getElementById('constraint'+num+num2+num2).value;


      constraintIndex = String(num) + String(num2);
      constraintIndex = parseInt(constraintIndex);
      if (selectedConstraints[constraintIndex] == undefined) {
        // not null flag
        if (notNullFoundFlag[num][num2] == true) {
          notNullFound = "<option disabled class='active' selected>Not Null</option>";
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = true;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = true;
        }
        else if (notNullFoundFlag[num][num2] == false) {
          notNullFound = "<option disabled>Not Null</option>";
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = false;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = false;
        }

        // unique flag
        if (uniqueFoundFlag[num][num2] == true) {
          uniqueFound = "<option disabled class='active' selected>Unique</option>";
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = true;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = true;
        }
        else if (uniqueFoundFlag[num][num2] == false) {
          uniqueFound = "<option disabled>Unique</option>";
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = false;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = false;
        }

        constraintId = 'spConstraint' + num + num2;
        constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
          + notNullFound
          + uniqueFound
          + "</select>";
        list[2].innerHTML = constraintHtml;
        list[2].setAttribute('class', 'sp-column acc-table-td spannerTabCell' + num + num2);
      }
      else {
        notNullFound = "<option disabled>Not Null</option>";
        uniqueFound = "<option disabled>Unique</option>";
        uniqueFoundFlag[num][num2] = false;
        notNullFoundFlag[num][num2] = false;
        for (var a = 0; a < selectedConstraints[constraintIndex].length; a++) {
          if (selectedConstraints[constraintIndex][a] == 'Not Null') {
            notNullFound = "<option disabled class='active' selected>Not Null</option>";
            notNullFoundFlag[num][num2] = true;
          }
          else if (selectedConstraints[constraintIndex][a] == 'Unique') {
            uniqueFound = "<option disabled class='active' selected>Unique</option>";
            uniqueFoundFlag[num][num2] = true;
          }
        }
        if (notNullFoundFlag[num][num2] == true) {
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = true;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = true;
        }
        else {
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = false;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].NotNull = false;
        }
        if (uniqueFoundFlag[num][num2] == true) {
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = true;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = true;
        }
        else {
          schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = false;
          // schemaConversionObj_original.SpSchema[src_table_name[num]].ColDefs[newColumnName].Unique = false;
        }
        spPlaceholder[num][num2] = selectedConstraints[constraintIndex].length;
        constraintId = 'spConstraint' + num + num2;
        constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
          + notNullFound
          + uniqueFound
          + "</select>";
        list[2].innerHTML = constraintHtml;
        list[2].setAttribute('class', 'sp-column acc-table-td spannerTabCell' + num + num2);
      }

      mySelect = new vanillaSelectBox('#spConstraint' + num + num2, {
        placeHolder: spPlaceholder[num][num2] + " constraints selected",
        maxWidth: 500,
        maxHeight: 300
      });
    }
    else {
      if (index > 0) {
        num2 = parseInt($(this).find("input[type=checkbox]").attr('id').match(/\d+/), 10);
        list[0].innerHTML = primaryTabCell[num][num2];
        // document.getElementById('columnNameText' + num + num2 + num2).innerHTML = primaryTabCell[num][num2];
        document.getElementById('dataType' + num + num2).innerHTML = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColDefs[Object.keys(schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColDefs)[num2]].T.Name;
        document.getElementById('spConstraint' + num + num2).innerHTML = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColDefs[Object.keys(schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColDefs)[num2]].NotNull;

        var idx = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColNames.indexOf(schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColNames[num2])
        if (idx > -1) {
          array.push(schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[num]].ColNames[num2])
        }
      }

    }

  })
  var col_names_array = schemaConversionObj.SpSchema[src_table_name[num]].ColNames
  // for (var x = 0; x < array.length; x++) {
  //   for (var y = 0; y < col_names_array.length; y++) {
  //     if (array[x] == col_names_array[y]) {
  //       delete schemaConversionObj.SpSchema[src_table_name[num]].ColDefs[col_names_array[y]]
  //       col_names_array.splice(y, 1)
  //     }
  //   }
  // };
  schemaConversionObj.SpSchema[src_table_name[num]].ColNames = col_names_array;

  // var pkArray = schemaConversionObj.SpSchema[src_table_name[num]].Pks;
  // for (var x = 0; x < notPkArray.length; x++) {
  //   for (var y = 0; y < pkArray.length; y++) {
  //     if (notPkArray[x].Col == pkArray[y].Col) {
  //       pkArray.splice(y, 1)
  //     }
  //   }
  // }
  // schemaConversionObj.SpSchema[src_table_name[num]].Pks = pkArray;

  document.getElementById('download-schema').setAttribute('data-obj', JSON.stringify(schemaConversionObj))
  $(tableid).each(function (index) {
    if (index > 0) {
      $(this).find('.src-tab-cell .bmd-form-group').remove();
    }
  })
}

/**
 * Function to create table from con json structure
 *
 * @return {null}
 */
function createTableFromJson(obj) {
  // schemaConversionObj_original = obj;
  // schemaConversionObj = JSON.parse(JSON.stringify(schemaConversionObj_original))
  schemaConversionObj = obj;
  document.getElementById('download-schema').setAttribute('data-obj', JSON.stringify(schemaConversionObj))

  $("#download-schema").click(function () {
    $("<a />", {
      "download": "session.json",
      "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemaConversionObj, null, 4)),
    }).appendTo("body")
      .click(function () {
        $(this).remove()
      })[0].click()
  });

  var accordion = document.getElementById("accordion");

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
  editButton.innerHTML = 'Edit Data Type';
  editButton.addEventListener('click', function () {
    editGlobalDataType();
    $('#globalDataTypeModal').modal();
  });
  accordion.appendChild(editButton);

  var reportUl = document.createElement('ul');
  reportUl.setAttribute('id', 'reportUl');
  y = 0;
  z = 0;

  for (var x = 0; x < src_table_num; x++) {
    initialPkSeqId[x] = new Array();
    initialColNameArray[x] = new Array();
    constraintTabCell[x] = new Array();
    primaryTabCell[x] = new Array();
    notPrimary[x] = new Array();
    uniqueFoundFlag[x] = new Array();
    notNullFoundFlag[x] = new Array();
    keyColumnMap[x] = new Array();
    pkArray[x] = new Array();
    selectedConstraints[x] = new Array();
    spPlaceholder[x] = new Array();
    count_sp[x] = new Array();
    count_src[x] = new Array();
  }

  // creating table accordion one by one for each table
  for (i = 0; i < src_table_num; i++) {
    var li = document.createElement('area');
    reportUl.appendChild(li);

    div1 = document.createElement("div")
    div1.className = "card";
    div1.setAttribute('id', i);

    var div2 = document.createElement("div")
    div2.className = 'card-header report-card-header borderBottom';
    div2.role = 'tab';

    var h5 = document.createElement("h5");
    h5.className = 'mb-0';

    var a = document.createElement("a");
    a.innerHTML = `${Object.keys(schemaConversionObj.SrcSchema)[i]} <i class="fas fa-angle-down rotate-icon"></i>`
    a.setAttribute("data-toggle", "collapse");
    a.setAttribute("href", "#" + Object.keys(schemaConversionObj.SrcSchema)[i]);

    h5.appendChild(a);
    div2.appendChild(h5);
    div1.appendChild(div2);

    var span5 = document.createElement("span")
    span5.className = "spanner-text right-align hide-content"
    span5.innerHTML = "Spanner"
    span5.removeAttribute('data-toggle');
    h5.appendChild(span5)

    var span6 = document.createElement("span")
    span6.className = "spanner-icon right-align hide-content"
    span6.innerHTML = `<i class="large material-icons" style="font-size: 18px;">circle</i>`
    h5.appendChild(span6)

    var span3 = document.createElement("span")
    span3.className = "source-text right-align hide-content"
    span3.innerHTML = "Source"
    h5.appendChild(span3)

    var span4 = document.createElement("span")
    span4.className = "source-icon right-align hide-content"
    span4.innerHTML = `<i class="large material-icons" style="font-size: 18px;">circle</i>`
    h5.appendChild(span4)

    var span1 = document.createElement("a")
    span1.className = "edit-text right-align hide-content"
    span1.innerHTML = "Edit Spanner Schema"
    span1.setAttribute('id', 'editSpanner' + i)
    span1.addEventListener('click', function () {
      // num = parseInt($(this).attr('id').match(/\d+/),10)
      // tableid = '#src-sp-table' + num + ' tr'
      if ($(this).html() === "Edit Spanner Schema") {
        editButtonClicked($(this));
      }
      else if ($(this).html() === "Save Changes") {
        saveButtonClicked($(this));
      }
    })
    h5.appendChild(span1)

    span2 = document.createElement("a")
    span2.className = "edit-icon right-align hide-content"
    span2.innerHTML = `<i class="large material-icons" style="font-size: 18px;">edit</i>`
    span2.setAttribute('id', 'editSpannerIcon' + i)
    h5.appendChild(span2)

    var div3 = document.createElement("div")
    div3.setAttribute("id", Object.keys(schemaConversionObj.SrcSchema)[i])
    div3.className = "collapse reportCollapse";

    var div4 = document.createElement("div");
    div4.className = "mdc-card mdc-card-content table-card-border";

    div5 = document.createElement("div");
    div5.className = "acc-card-content";

    var div6 = document.createElement("div");
    div6.className = "acc-header";

    var acc_table = document.createElement("table")
    var acc_table_tr = acc_table.insertRow(-1)
    var acc_table_th1 = document.createElement("th")
    acc_table_th1.className = "acc-column"
    acc_table_th1.innerHTML = "Column Name"
    acc_table_tr.appendChild(acc_table_th1)

    var acc_table_th2 = document.createElement("th")
    acc_table_th2.className = "acc-column"
    acc_table_th2.innerHTML = "Data Type"
    acc_table_tr.appendChild(acc_table_th2)

    var acc_table_th4 = document.createElement("th")
    acc_table_th4.className = "acc-column"
    acc_table_th4.innerHTML = "Constraints"
    acc_table_tr.appendChild(acc_table_th4)

    div6.appendChild(acc_table)
    div5.appendChild(div6)

    // creating column headers for each table
    var col = []
    for (var m = 0; m < 6; m++) {
      if (m % 2 == 0) {
        col.push('MySQL');
      }
      else
        col.push('Spanner');
    }

    // appending column headers to the table
    var table = document.createElement("table")
    table.setAttribute('id', 'src-sp-table' + i)
    table.className = 'acc-table'

    // table.className = "acc-table"
    var tr = table.insertRow(-1)
    for (var j = 0; j < col.length; j++) {
      var th = document.createElement("th")
      if (j % 2 == 0) {
        th.className = "acc-table-th-src"
      }
      else {
        th.className = "acc-table-th-spn"
      }
      th.innerHTML = col[j]
      tr.appendChild(th)
    }


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
    // schemaConversionObj_original.SpSchema[src_table_name[i]].Pks = pkArray[i];

    // for loop for spanner columns
    if (src_table_cols != null) {
      for (var k = 0; k < src_table_cols.length; k++) {
        var tr_checkbox = table.insertRow(-1);
        var currentColumnSrc;
        var currentColumnSp;

        // for loop for column names
        for (var l = 0; l < 2; l++) {
          var tabCell = tr_checkbox.insertCell(-1);
          if (l % 2 == 0) {
            currentColumnSrc = src_table_cols[k];
            if (src_table.PrimaryKeys[0].Column == src_table_cols[k]) {
              tabCell.innerHTML = `<span class="column left">
                                  <!-- <i class="fas fa-key" aria-hidden="true" style="color: #eacc22; font-size: 18px;"></i> -->
                                  <img src='./Icons/Icons/ic_vpn_key_24px.svg' style='margin-left: 3px;'>
                                </span>
                                <span class="column right">
                                  ${src_table_cols[k]}
                                </span>`
              // tabCell.innerHTML = `<i class="fas fa-key" aria-hidden="true" style="color: #eacc22; font-size: 18px;"></i>${src_table_cols[k]}`
            }
            else {
              tabCell.innerHTML = `<span class="column left">
                                            <!-- <i class="fas fa-key" aria-hidden="true" style="color: #eacc22; font-size: 18px; visibility: hidden;"></i> -->
                                            <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg' style='visibility: hidden; margin-left: 3px;'>
                                          </span>
                                          <span class="column right">
                                            ${src_table_cols[k]}
                                          </span>`
              // tabCell.innerHTML = src_table_cols[k]
            }
            tabCell.className = 'acc-table-td src-tab-cell';
          }
          else {
            currentColumnSp = sp_table_cols[k];
            pksSp = sp_table.Pks;
            pkFlag = false
            for (var x = 0; x < pksSp.length; x++) {
              if (pksSp[x].Col == sp_table_cols[k]) {
                pkFlag = true;
                tabCell.innerHTML = `<span class="column left" id='keyIcon${i}${k}${k}'>
                                    <sub>${pksSp[x].seqId}</sub><img src='./Icons/Icons/ic_vpn_key_24px.svg'>
                                  </span>
                                  <span class="column right" id='columnNameText${i}${k}${k}'>
                                    ${sp_table_cols[k]}
                                  </span>`;
                notPrimary[i][k] = false;
                initialPkSeqId[i][k] = pksSp[x].seqId;
                break
              }
            }
            if (pkFlag == false) {
              notPrimary[i][k] = true;
              tabCell.innerHTML = `<span class="column left" id='keyIcon${i}${k}${k}'>
                                            <!-- <i class="fas fa-key" aria-hidden="true" style="color: gray; font-size: 18px; visibility: hidden;"></i> -->
                                            <img src='./Icons/Icons/ic_vpn_key_24px-inactive.svg' style='visibility: hidden;'>
                                          </span>
                                          <span class="column right" id='columnNameText${i}${k}${k}'>
                                            ${sp_table_cols[k]}
                                          </span>`;
              // primaryTabCell[i][k] = tabCell.innerHTML;
              // tabCell.innerHTML = sp_table_cols[k]
            }
            tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k)
            // tabCell.setAttribute('id', 'columnName'+i+k);
            primaryTabCell[i][k] = tabCell.innerHTML;
            keyIconValue = 'keyIcon' + i + k + k;
            keyColumnObj = { 'keyIconId': keyIconValue, 'columnName': currentColumnSp };
            keyColumnMap[i].push(keyColumnObj);
          }
        }

        // for loop for data types
        for (var l = 0; l < 2; l++) {
          var tabCell = tr_checkbox.insertCell(-1);
          if (l % 2 == 0) {
            tabCell.className = "acc-table-td pl-data-type"
            if (src_table.ColDefs[currentColumnSrc].Type.ArrayBounds != null)
              tabCell.innerHTML = 'ARRAY(' + src_table.ColDefs[currentColumnSrc].Type.Name + ')';
            else
              tabCell.innerHTML = src_table.ColDefs[currentColumnSrc].Type.Name;
          }
          else {
            tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k)
            tabCell.setAttribute('id', 'dataType' + i + k)
            if (sp_table.ColDefs[currentColumnSp].IsArray == true)
              tabCell.innerHTML = 'ARRAY(' + sp_table.ColDefs[currentColumnSp].T.Name + ')';
            else {
              tabCell.innerHTML = sp_table.ColDefs[currentColumnSp].T.Name;
            }
          }
        }

        // for loop for not null and unique constraint
        for (var l = 0; l < 2; l++) {
          var tabCell = tr_checkbox.insertCell(-1);
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

            if (src_table.ColDefs[currentColumnSrc].Unique != undefined) {
              if (src_table.ColDefs[currentColumnSrc].Unique == true) {
                count_src[i][k] = count_src[i][k] + 1;
                srcPlaceholder[z] = count_src[i][k];
                uniqueFound = "<option disabled class='active'>Unique</option>";
              }
              else {
                uniqueFound = "<option disabled>Unique</option>";
              }
            }
            else {
              uniqueFound = '';
            }

            if (src_table.ColDefs[currentColumnSrc].Ignored.AutoIncrement != undefined) {
              if (src_table.ColDefs[currentColumnSrc].Ignored.AutoIncrement == true) {
                count_src[i][k] = count_src[i][k] + 1;
                srcPlaceholder[z] = count_src[i][k];
                autoIncrementFound = "<option disabled class='active'>Auto Increment</option>";
              }
              else {
                autoIncrementFound = "<option disabled>Auto Increment</option>";
              }
            }
            else {
              autoIncrementFound = '';
            }
            constraintId = 'srcConstraint' + z;
            srcConstraintHtml = "<select id=" + constraintId + " multiple size='1' class='form-control spanner-input tableSelect'>"
              + notNullFound
              + uniqueFound
              + autoIncrementFound
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
            // checking unique constraint
            if (sp_table.ColDefs[currentColumnSp].Unique != undefined) {
              if (sp_table.ColDefs[currentColumnSp].Unique == true) {
                count_sp[i][k] = count_sp[i][k] + 1
                spPlaceholder[i][k] = count_sp[i][k];
                uniqueFound = "<option disabled class='active'>Unique</option>";
                uniqueFoundFlag[i][k] = true;
              }
              else {
                uniqueFound = "<option disabled>Unique</option>";
                uniqueFoundFlag[i][k] = false;
              }
            }
            else {
              uniqueFound = "<option disabled>Unique</option>";
              uniqueFoundFlag[i][k] = false;
            }
            constraintId = 'spConstraint' + i + k;
            spConstraintHtml = "<select id=" + constraintId + " multiple size='1' class='form-control spanner-input tableSelect'>"
              + notNullFound
              + uniqueFound
              + "</select>";
            tabCell.innerHTML = spConstraintHtml;
            tabCell.setAttribute('class', 'sp-column acc-table-td spannerTabCell' + i + k);
            constraintTabCell[i][k] = tabCell.innerHTML;
            // tabCell.setAttribute('id', 'constraint'+i+k);
            y++;
          }
        }
      }
    }

    div5.appendChild(table)
    div4.appendChild(div5)
    div3.appendChild(div4)
    div1.appendChild(div3)

    // createSummaryForEachTable(i, summaryDataResp);

    li.appendChild(div1);
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
}

function createSummaryForEachTable(index, summary) {
  var summaryCard = document.createElement('div');
  summaryCard.className = 'summaryCard';

  var summaryCardHeader = document.createElement("div")
  summaryCardHeader.className = 'summaryCardHeader';
  summaryCardHeader.role = 'tab';

  var summaryCardHeading = document.createElement("h5")
  summaryCardHeading.className = 'mb-0';

  var summaryCardLink = document.createElement("a")
  summaryCardLink.innerHTML = `View Summary`;
  summaryCardLink.className = 'summaryFont';
  summaryCardLink.setAttribute("data-toggle", "collapse");
  summaryCardLink.setAttribute("href", "#viewSummary" + index);

  summaryCardHeading.appendChild(summaryCardLink);
  summaryCardHeader.appendChild(summaryCardHeading);
  summaryCard.appendChild(summaryCardHeader);

  var summaryCollapse = document.createElement("div")
  summaryCollapse.setAttribute("id", 'viewSummary' + index);
  summaryCollapse.className = "collapse summaryCollapse";

  var summaryCollapseCard = document.createElement("div");
  summaryCollapseCard.className = "mdc-card mdc-card-content summaryBorder";
  summaryCollapseCard.setAttribute('border', '0px');

  var summaryContent = document.createElement('div');
  summaryContent.className = 'mdc-card summary-content';
  summaryContent.innerHTML = summary[Object.keys(summary)[index]].split('\n').join('<br />');
  summaryCollapseCard.appendChild(summaryContent);

  summaryCollapse.appendChild(summaryCollapseCard);
  summaryCard.appendChild(summaryCollapse);

  div5.appendChild(summaryCard);
}

/**
 * Function to validate if input fields ae empty.
 *
 * @param {Element} inputField Input html element like <input>..
 * @return {null}
 */
function validateInput(inputField) {
  const field = inputField;
  if (field.value.trim() == '') {
    field.nextElementSibling.innerHTML = `Required`;
    field.nextElementSibling.style.color = RED;
  }
  else {
    field.nextElementSibling.innerHTML = '';
  }
}

/**
 * Function to render home screen html and initiate home screen tasks
 *
 * @param {any} params 
 * @return {null}
 */
function homeScreen(params) {
  initHomeScreenTasks();
  console.log(JSON.parse(sessionStorage.getItem('sessionStorage')));
  return homeScreenHtml()
}

/**
 * Function to hide all modals when user clicks on cancel button.
 *
 * @return {null}
 */
function clickCancelModal() {
  clearModal()
  jQuery('#connectToDbModal').modal('hide');
  jQuery('#connectModalSuccess').modal('hide');
  jQuery('#connectModalFailure').modal('hide');
}

/**
 * Function to toggle input fields based on db type.
 *
 * @return {null}
 */
function toggle() {
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
 * @return {null}
 */
function findTab(id) {
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
 * Function to create summary content for each table based on api response
 *
 * @return {null}
 */
function createSummaryFromJson(result) {
  $("#download-report").click(function () {
    $("<a />", {
      "download": "report.json",
      "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 4)),
    }).appendTo("body")
      .click(function () {
        $(this).remove()
      })[0].click()
  });

  var summary = result;
  var summaryLength = Object.keys(summary).length;

  var summaryAccordion = document.getElementById('summary-accordion');
  var summaryUl = document.createElement('ul');

  expand_button = document.createElement("button")
  expand_button.setAttribute('id', 'summaryExpandButton');
  expand_button.innerHTML = "Expand All"
  expand_button.className = "expand"
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
    var li = document.createElement('area');

    // panel creation for each table
    var div1 = document.createElement("div")
    div1.className = "card"

    var div2 = document.createElement("div")
    div2.className = 'card-header ddl-card-header ddlBorderBottom';
    div2.role = 'tab';

    var h5 = document.createElement("h5")
    h5.className = 'mb-0';

    var a = document.createElement("a")
    a.innerHTML = `${Object.keys(summary)[i]} <i class="fas fa-angle-down rotate-icon"></i>`;
    a.setAttribute("data-toggle", "collapse")
    a.setAttribute("href", "#" + Object.keys(summary)[i] + '-summary')

    h5.appendChild(a);
    div2.appendChild(h5);
    div1.appendChild(div2);

    var div3 = document.createElement("div")
    div3.setAttribute("id", Object.keys(summary)[i] + '-summary')
    div3.className = "collapse summaryCollapse";

    var div4 = document.createElement("div");
    div4.className = "mdc-card mdc-card-content ddl-border table-card-border";

    var div5 = document.createElement('div');
    div5.className = 'mdc-card summary-content';
    div5.innerHTML = summary[Object.keys(summary)[i]].split('\n').join('<br />')
    div4.appendChild(div5);

    div3.appendChild(div4)
    div1.appendChild(div3)

    li.appendChild(div1);
    summaryUl.appendChild(li)
  }
  summaryAccordion.appendChild(summaryUl);
}

/**
 * Function to create DDL for each table based on api response
 *
 * @return {null}
 */
function createDdlFromJson(result) {
  $("#download-ddl").click(function () {
    $("<a />", {
      "download": "ddl.json",
      "href": "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 4)),
    }).appendTo("body")
      .click(function () {
        $(this).remove()
      })[0].click()
  });

  var ddl = result
  var ddl_length = Object.keys(ddl).length

  var ddl_accordion = document.getElementById('ddl-accordion');

  expand_button = document.createElement("button")
  expand_button.setAttribute('id', 'ddlExpandButton');
  expand_button.innerHTML = "Expand All"
  expand_button.className = "expand"
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
  var ddlUl = document.createElement('ul');

  for (var i = 0; i < ddl_length; i++) {
    var li = document.createElement('area');

    // panel creation for each table
    var div1 = document.createElement("div")
    div1.className = "card"

    var div2 = document.createElement("div")
    div2.className = 'card-header ddl-card-header ddlBorderBottom';
    div2.role = 'tab';

    var h5 = document.createElement("h5")
    h5.className = 'mb-0';

    var a = document.createElement("a")
    a.innerHTML = `${Object.keys(ddl)[i]} <i class="fas fa-angle-down rotate-icon"></i>`;
    a.setAttribute("data-toggle", "collapse");
    a.setAttribute("href", "#" + Object.keys(ddl)[i] + '-ddl');

    h5.appendChild(a);
    div2.appendChild(h5);
    div1.appendChild(div2);

    var div3_ddl = document.createElement("div")
    div3_ddl.setAttribute("id", Object.keys(ddl)[i] + '-ddl')
    div3_ddl.className = "collapse ddlCollapse";

    var div4 = document.createElement("div");
    div4.className = "mdc-card mdc-card-content ddl-border table-card-border";
    var createIndex = (ddl[Object.keys(ddl)[i]]).search('CREATE TABLE');
    var createEndIndex = createIndex + 12;
    ddl[Object.keys(ddl)[i]] = ddl[Object.keys(ddl)[i]].substring(0, createIndex) + ddl[Object.keys(ddl)[i]].substring(createIndex, createEndIndex).fontcolor('#4285f4').bold() + ddl[Object.keys(ddl)[i]].substring(createEndIndex);

    var div5 = document.createElement('div');
    div5.className = 'mdc-card ddl-content';
    div5.innerHTML = `<pre><code>${ddl[Object.keys(ddl)[i]].split('\n').join(`<span class='sql-c'></span>`)}</code></pre>`
    div4.appendChild(div5);

    div3_ddl.appendChild(div4)
    div1.appendChild(div3_ddl)

    li.appendChild(div1);
    ddlUl.appendChild(li)
  }
  ddl_accordion.appendChild(ddlUl);
}

function showSpinner() {
  const toggle_spinner = document.getElementById("toggle-spinner");
  // const spinner = document.getElementById('spinner');
  toggle_spinner.style.display = "block";
  // setTimeout(() => {
  //   toggle_spinner.className = toggle_spinner.className.replace("show", "");
  // }, 12000000);
}

function hideSpinner() {
  const toggle_spinner = document.getElementById("toggle-spinner");
  toggle_spinner.style.display = "none";
  toggle_spinner.className = toggle_spinner.className.replace("show", "");
}

/**
 * Function to create DDL for each table based on api response
 *
 * @return {null}
 */
function showSchemaAssessment() {
  if (!isLive) {
    jQuery('#connectModalSuccess').modal("hide");
    jQuery('#connectToDbModal').modal("hide");
    jQuery('#globalDataTypeModal').modal("hide");

    const { component = ErrorComponent } = findComponentByPath('/schema-report-connect-to-db', routes) || {};
    // Render the component in the "app" placeholder
    document.getElementById('app').innerHTML = component.render();
    // router.loadRoute('schemaReport')
    createTableFromJson(schemaConversionObj_original)
    createDdlFromJson(ddl)
    createSummaryFromJson(summary);
  }

  else {
    showSpinner();
    let reportData = fetch(apiUrl + '/convertSchema');
    let ddlData = fetch(apiUrl + '/getDDL');
    let summaryData = fetch(apiUrl + '/getSummary');
    let sessionInfo = fetch(apiUrl + '/getSession');

    Promise.all([reportData, ddlData, summaryData, sessionInfo])
      .then(values => Promise.all(values.map(value => value.json())))
      .then(finalVals => {
        hideSpinner();
        let reportDataResp = finalVals[0];
        let ddlDataResp = finalVals[1];
        summaryDataResp = finalVals[2];
        let sessionInfoResp = finalVals[3];
        jQuery('#connectModalSuccess').modal("hide");
        jQuery('#connectToDbModal').modal("hide");
        jQuery('#globalDataTypeModal').modal("hide");

        const { component = ErrorComponent } = findComponentByPath('/schema-report-connect-to-db', routes) || {};
        // Render the component in the "app" placeholder
        document.getElementById('app').innerHTML = component.render();

        sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
        if (sessionStorageArr == null) {
          sessionStorageArr = [];
          sessionStorageArr.push(sessionInfoResp);
        }
        else {
          sessionStorageArr.push(sessionInfoResp);
        }
        sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
        // router.loadRoute('schemaReport')
        createTableFromJson(reportDataResp);
        // createTableFromJson(schemaConversionObj_original);
        createDdlFromJson(ddlDataResp)
        createSummaryFromJson(summaryDataResp);
      });
  }
}

/**
 * Function to store db dump values in local storage
 *
 * @param {string} dbType selected db like mysql, postgres, etc
 * @param {string} filePath path entered for the dump file
 * @return {null}
 */
function storeDumpFileValues(dbType, filePath) {
  if (dbType == 'mysql') {
    localStorage.setItem('globalDbType', dbType + 'dump');
  }
  else if (dbType == 'postgres') {
    localStorage.setItem('globalDbType', 'pg_dump');
  }
  localStorage.setItem('globalDumpFilePath', filePath);
}

/**
 * Function to call /convertSchemaDump api to get con json structure
 *
 * @param {string} dbType selected db like mysql, postgres, etc
 * @param {string} dumpFilePath path entered for the dump file
 * @return {null}
 */
function onLoadDatabase(dbType, dumpFilePath) {
  if (!isLive) {
    showSpinner();
    jQuery('#loadDatabaseDumpModal').modal('hide');
    const { component = ErrorComponent } = findComponentByPath('/schema-report-load-db-dump', routes) || {};
    // Render the component in the "app" placeholder
    document.getElementById('app').innerHTML = component.render();
    // router.loadRoute('schemaReport')
    createTableFromJson(schemaConversionObj_original)
    createDdlFromJson(ddl)
    createSummaryFromJson(summary);
  }

  else {
    showSpinner();
    let reportData = fetch(apiUrl + '/convertSchemaDump', {
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
    let ddlData = fetch(apiUrl + '/getDDL');
    let summaryData = fetch(apiUrl + '/getSummary');
    let sessionInfo = fetch(apiUrl + '/getSession');

    Promise.all([reportData, ddlData, summaryData, sessionInfo])
      .then(values => Promise.all(values.map(value => value.json())))
      .then(finalVals => {
        hideSpinner();
        let reportDataResp = finalVals[0];
        let ddlDataResp = finalVals[1];
        summaryDataResp = finalVals[2];
        sessionInfoResp = finalVals[3];
        jQuery('#loadDatabaseDumpModal').modal('hide');

        const { component = ErrorComponent } = findComponentByPath('/schema-report-load-db-dump', routes) || {};
        // Render the component in the "app" placeholder
        document.getElementById('app').innerHTML = component.render();
        console.log(sessionInfoResp);
        sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
        if (sessionStorageArr == null) {
          sessionStorageArr = [];
          sessionStorageArr.push(sessionInfoResp);
        }
        else {
          sessionStorageArr.push(sessionInfoResp);
        }
        sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
        console.log(JSON.parse(sessionStorage.getItem('sessionStorage')))
        createTableFromJson(reportDataResp);
        createDdlFromJson(ddlDataResp);
        createSummaryFromJson(summaryDataResp);
      })
  }
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
function onconnect(dbType, dbHost, dbPort, dbUser, dbName, dbPassword) {
  if (!isLive) {
    jQuery('#connectToDbModal').modal('hide');
    jQuery('#connectModalSuccess').modal();
  }

  else {
    showSpinner();
    // document.getElementById('loaderButton').style.display = 'block';
    // document.getElementById('connectButton').style.display = 'none';
    fetch(apiUrl + '/databaseConnection', {
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
        res.text().then(function (result) {
          hideSpinner();
          // document.getElementById('loaderButton').style.display = 'none'
          // document.getElementById('connectButton').style.display = 'block'
          error = result
          if (error == "") {
            jQuery('#connectToDbModal').modal('hide');
            jQuery('#connectModalSuccess').modal();
          }
          else {
            jQuery('#connectToDbModal').modal('hide');
            jQuery('#connectModalFailure').modal();
          }
        })
      })
  }
}

/**
 * Function to import schema and populate summary, ddl, conversion report panels
 *
 * @return {null}
 */
function onImport() {
  if (!isLive) {
    jQuery('#importSchemaModal').modal('hide');
    const { component = ErrorComponent } = findComponentByPath('/schema-report-import-db', routes) || {};
    // Render the component in the "app" placeholder
    document.getElementById('app').innerHTML = component.render();
    createTableFromJson(JSON.parse(localStorage.getItem('importSchema')));
    createDdlFromJson(ddl)
    createSummaryFromJson(summary);
  }

  else {
    let ddlData = fetch(apiUrl + '/getDDL');
    let summaryData = fetch(apiUrl + '/getSummary');

    Promise.all([ddlData, summaryData])
      .then(values => Promise.all(values.map(value => value.json())))
      .then(finalVals => {
        // hideSpinner();
        let ddlDataResp = finalVals[0];
        summaryDataResp = finalVals[1];

        jQuery('#importSchemaModal').modal('hide');
        const { component = ErrorComponent } = findComponentByPath('/schema-report-import-db', routes) || {};
        // Render the component in the "app" placeholder
        document.getElementById('app').innerHTML = component.render();
        createTableFromJson(JSON.parse(localStorage.getItem('importSchema')));
        createDdlFromJson(ddlDataResp)
        createSummaryFromJson(summaryDataResp);
      });
  }
}

/**
 * Function to clear modal input fields.
 *
 * @return {null}
 */
function clearModal() {
  $('.formError').html('');
  $('.db-input').val('');
  $('.db-select-input').val('');
  $('.load-db-input').val('');
  $('#loadConnectButton').attr('disabled', 'disabled');
  $('#connectButton').attr('disabled', 'disabled');
  document.getElementById("sqlFields").style.display = "none"
  document.getElementById("sqlFieldsButtons").style.display = "none"
}

/**
 * Function to store session id in local storage to resume session
 *
 * @param {string} id session id
 * @return {null}
 */
function storeResumeSessionId(driver, path, fileName) {
  console.log(driver);
  console.log(path);
  console.log(fileName);
  localStorage.setItem('driver', driver);
  localStorage.setItem('path', path);
  localStorage.setItem('fileName', fileName);
}

/**
 * Function to read file content when clicked on resume session
 *
 * @param {string} id session id
 * @return {null}
 */
function resumeSession(driver, path, fileName) {

  fetch(apiUrl + '/resumeSession', {
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
  });

  filePath = path + fileName;
  readTextFile(filePath, function (text) {
    var data = JSON.parse(text);

    if (!isLive) {
      jQuery('#importSchemaModal').modal('hide');
      const { component = ErrorComponent } = findComponentByPath('/schema-report-resume-session', routes) || {};
      document.getElementById('app').innerHTML = component.render();
      createTableFromJson(data);
      createDdlFromJson(ddl)
      createSummaryFromJson(summary);
    }

    else {
      let ddlData = fetch(apiUrl + '/getDDL');
      let summaryData = fetch(apiUrl + '/getSummary');

      Promise.all([ddlData, summaryData])
        .then(values => Promise.all(values.map(value => value.json())))
        .then(finalVals => {
          let ddlDataResp = finalVals[0];
          let summaryDataResp = finalVals[1];

          jQuery('#importSchemaModal').modal('hide');
          const { component = ErrorComponent } = findComponentByPath('/schema-report-resume-session', routes) || {};
          document.getElementById('app').innerHTML = component.render();
          createTableFromJson(data);
          createDdlFromJson(ddlDataResp)
          createSummaryFromJson(summaryDataResp);
        });
    }
  });
}

/**
 * Callback function to read file content
 *
 * @param {file}
 * @return {null}
 */
function readTextFile(file, callback) {
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

function setSessionTableContent() {
  console.log('inside table function');
  var sessionArray = JSON.parse(sessionStorage.getItem('sessionStorage'));
  if (sessionArray == null) {
    document.getElementById('session-table-content').innerHTML = `<tr>
      <td colspan='5' class='center session-image'><img src='assets/icons/Group 2154.svg' alt='nothing to show'></td>
    </tr>
    <tr>
      <td colspan='5' class='center simple-grey-text'>No active session available! <br> Please connect a database to initiate a new session.</td>
    </tr>`
  }
  else {
    console.log(sessionArray);
    var sessionTableContent = document.getElementById('session-table-content');
    for (var x = 0; x < sessionArray.length; x++) {
      var session = sessionArray[x];
      var driver = session.driver;
      var path = session.path;
      var sessionName = session.fileName;
      var sessionDate = session.createdAt.substr(0, session.createdAt.indexOf("T"));
      var sessionTime = session.createdAt.substr(session.createdAt.indexOf("T")+1);
      var sessionTableTr = document.createElement('tr');
      sessionTableTr.className = 'd-flex';

      var td1 = document.createElement('td');
      td1.className = 'col-2 session-table-td2';
      td1.innerHTML = sessionName;

      var td2 = document.createElement('td');
      td2.className = 'col-4 session-table-td2';
      td2.innerHTML = sessionDate;

      var td3 = document.createElement('td');
      td3.className = 'col-2 session-table-td2';
      td3.innerHTML = sessionTime;

      var td4 = document.createElement('td');
      td4.setAttribute('id', x);
      td4.className = 'col-4 session-table-td2 session-action';
      td4.innerHTML = `<a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId(driver, path, sessionName)'>Resume Session</a>`;

      td4.addEventListener('click', function() {
        var index = $(this).attr('id');
        console.log(index);
        console.log(sessionArray);
        console.log(driver);
        storeResumeSessionId(sessionArray[index].driver, sessionArray[index].path, sessionArray[index].fileName);
      });

      sessionTableTr.appendChild(td1);
      sessionTableTr.appendChild(td2);
      sessionTableTr.appendChild(td3);
      sessionTableTr.appendChild(td4);

      sessionTableContent.appendChild(sessionTableTr);
      console.log(sessionTime);
      console.log(sessionDate);
      console.log(sessionName);
      console.log(session);
    }
    // document.getElementById('session-table-content').innerHTML = `<tr class="d-flex">
    //     <td class='col-2 session-table-td2'>Session 1</td>
    //     <td class='col-4 session-table-td2'>Tuesday, 18 August 2020</td>
    //     <td class='col-2 session-table-td2'>5:30 PM</td>
    //     <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session1")'>Resume Session</a></td>
    //   </tr>
    //   <tr class="d-flex">
    //     <td class='col-2 session-table-td2'>Session 2</td>
    //     <td class='col-4 session-table-td2 '>Tuesday, 18 August 2020</td>
    //     <td class='col-2 session-table-td2 '>5:30 PM</td>
    //     <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session2")'>Resume Session</a></td>
    //   </tr>
    //   <tr class="d-flex">
    //     <td class='col-2 session-table-td2 ' >Session 3</td>
    //     <td class='col-4 session-table-td2 '>Tuesday, 18 August 2020</td>
    //     <td class='col-2 session-table-td2 '>5:30 PM</td>
    //     <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session3")'>Resume Session</a></td>
    //   </tr>`
  }
}

/**
 * Function to render home screen html
 *
 * @return {html}
 */
function homeScreenHtml() {
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
     <div class="header-topic"><a href="#" class="inactive" style="text-decoration: none;">Instructions</a></div>
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
            Import Schema Conversion
         </div>
       </div>
     </div>
   </div>

   <div class='spinner-backdrop' id='toggle-spinner' style="display:none">
    <div id="spinner"></div>
   </div>

   <h4 class="session-heading">Session history</h4>

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
      
      <!-- <tr class="d-flex">
        <td class='col-2 session-table-td2'>Session 1</td>
        <td class='col-4 session-table-td2'>Tuesday, 18 August 2020</td>
        <td class='col-2 session-table-td2'>5:30 PM</td>
        <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session1")'>Resume Session</a></td>
      </tr>
      <tr class="d-flex">
        <td class='col-2 session-table-td2'>Session 2</td>
        <td class='col-4 session-table-td2 '>Tuesday, 18 August 2020</td>
        <td class='col-2 session-table-td2 '>5:30 PM</td>
        <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session2")'>Resume Session</a></td>
      </tr>
      <tr class="d-flex">
        <td class='col-2 session-table-td2 ' >Session 3</td>
        <td class='col-4 session-table-td2 '>Tuesday, 18 August 2020</td>
        <td class='col-2 session-table-td2 '>5:30 PM</td>
        <td class='col-4 session-table-td2 session-action'><a href='#/schema-report-resume-session' style='cursor: pointer; text-decoration: none;' onclick='storeResumeSessionId("session3")'>Resume Session</a></td>
      </tr> -->
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
           <button class="buttonload" id="loaderButton" style="display: none;">
             <i class="fa fa-circle-o-notch fa-spin"></i>connecting
           </button>
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
        <form id="loadDbForm">
         <div class="form-group">
         <label class="" for="loadDbType">Database Type</label>
         <select class="form-control load-db-input" id="loadDbType" name="loadDbType" onchange="toggle()">
           <option value="" style="display: none;"></option>
           <option class="db-option" value="mysql">MySQL</option>
           <option class="db-option" value="postgres">Postgres</option>
         </select>
         </div>

         <div class="form-group">
         <label class="modal-label" for="dumpFilePath">Path of the Dump File</label>
         <input type="text" class="form-control load-db-input" aria-describedby="" name="dumpFilePath" id="dumpFilePath" autocomplete="off" onfocusout="validateInput(document.getElementById('dumpFilePath'))"/>
         <span class='formError'></span>
         </div>

        </form>
       </div>
       <div class="modal-footer">
         <a href='#/schema-report-load-db-dump'><input type='submit' disabled='disabled' value='Connect' id='loadConnectButton' class='connectButton'onclick='storeDumpFileValues(document.getElementById("loadDbType").value, document.getElementById("dumpFilePath").value)' /></a>
         <button class="buttonload" id="loaderModalButton" style="display: none;">
          <i class="fa fa-circle-o-notch fa-spin"></i>converting
        </button>
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
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Import Schema Conversion</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick="clearModal()">cancel</i>
       </div>
       <div class="modal-body">

         <form id="importForm" class="importForm">
         <div class="form-group">
         <label class="modal-label" for="importDbType">Database Type</label>
         <select class="form-control" id="importDbType" name="importDbType" onchange="toggle()">
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
         <a href='#/schema-report-import-db'><input type='submit' disabled='disabled' id='importButton' class='connectButton' value='Connect' /></a>
       </div>
     </div>

   </div>
 </div>
 
 <div class="modal" id="connectModalSuccess" role="dialog" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->

     <div class="modal-content">
       <div class="modal-header content-center">
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Connection Successful</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick="clickCancelModal()">cancel</i>
       </div>
       <div class="modal-body" style='margin-bottom: 20px;'>

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

 <div class="modal" id="connectModalFailure" role="dialog" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered" role="document">

     <!-- Modal content-->

     <div class="modal-content">
       <div class="modal-header content-center">
         <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Connection Failure</h5>
         <i class="large material-icons close" data-dismiss="modal" onclick="clickCancelModal()">cancel</i>
       </div>
       <div class="modal-body" style='margin-bottom: 20px;'>

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