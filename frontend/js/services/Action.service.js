import Store from "./Store.service.js";
import Fetch from "./Fetch.service.js";
import { readTextFile, createEditDataTypeTable } from './../helpers/SchemaConversionHelper.js';

/**
 * All the manipulations to the store happen via the actions mentioned in this module
 *
 */
const Actions = (() => {

    return {
        trial: () => {
            console.log(' this was the trial in the actions ');
            return '1';
        },
        addAttrToStore: () => {
            Store.addAttrToStore();
        },
        closeStore: () => {
            Store.toggleStore();
        },
        onLoadDatabase: async (dbType, dumpFilePath) => {
            let reportData, sourceTableFlag, reportDataResp, reportDataCopy, jsonReportDataResp, requestCode;
            reportData = await Fetch.getAppData('POST', '/convert/dump', { "Driver": dbType, "Path": dumpFilePath });
            reportDataCopy = reportData.clone();
            requestCode = reportData.status;
            reportDataResp = await reportData.text();
            if (requestCode != 200) {
                Fetch.showSnackbar(reportDataResp, ' redBg');
                return false;
            }
            else {
                jsonReportDataResp = await reportDataCopy.json();
                if (Object.keys(jsonReportDataResp.SpSchema).length == 0) {
                    showSnackbar("Please select valid file", " redBg");
                    return false;
                }
                else {
                    jQuery('#loadDatabaseDumpModal').modal('hide');
                    Store.updateSchemaScreen(reportDataResp);
                }
            }
            sourceTableFlag = localStorage.getItem('sourceDbName');
            return true;
        },
        onconnect: async (dbType, dbHost, dbPort, dbUser, dbName, dbPassword) => {
            let sourceTableFlag = '', response;
            let payload = {
                "Driver": dbType,
                "Database": dbName,
                "Password": dbPassword,
                "User": dbUser,
                "Port": dbPort,
                "Host": dbHost
            };
            response = await Fetch.getAppData('POST', '/connect', payload);
            if (response.ok) {
                if (dbType === 'mysql')
                    sourceTableFlag = 'MySQL';
                else if (dbType === 'postgres')
                    sourceTableFlag = 'Postgres';
                localStorage.setItem('sourceDbName', sourceTableFlag);
                jQuery('#connectToDbModal').modal('hide');
                jQuery('#connectModalSuccess').modal();
            }
            else {
                jQuery('#connectToDbModal').modal('hide');
                jQuery('#connectModalFailure').modal();
            }
            return response;
        },
        showSchemaAssessment: async () => {
            let reportDataResp, reportData, sourceTableFlag;
            reportData = await Fetch.getAppData('GET', '/convert/infoschema');
            reportDataResp = await reportData.text();
            Store.updateSchemaScreen(reportDataResp);
            jQuery('#connectModalSuccess').modal("hide");
            sourceTableFlag = localStorage.getItem('sourceDbName');
        },
        ddlSummaryAndConversionApiCall: async () => {
            let conversionRate, conversionRateJson, ddlData, ddlDataJson, summaryData, summaryDataJson;
            ddlData = await Fetch.getAppData('GET', '/ddl');
            summaryData = await Fetch.getAppData('GET', '/summary');
            conversionRate = await Fetch.getAppData('GET', '/conversion');
            if (ddlData.ok && summaryData.ok && conversionRate.ok) {
                ddlDataJson = await ddlData.json();
                summaryDataJson = await summaryData.json();
                conversionRateJson = await conversionRate.json();
                localStorage.setItem('ddlStatementsContent', JSON.stringify(ddlDataJson));
                localStorage.setItem('summaryReportContent', JSON.stringify(summaryDataJson));
                localStorage.setItem('tableBorderColor', JSON.stringify(conversionRateJson));
            }
            else {
                return false;
            }
            return true;
        },
        sessionRetrieval: async (dbType) => {
            let sessionStorageArr, sessionInfo, sessionResp;
            sessionResp = await Fetch.getAppData('GET', '/session');
            sessionInfo = await sessionResp.json();
            sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
            if (sessionStorageArr == undefined)
                sessionStorageArr = [];
            sessionInfo.sourceDbType = dbType;
            sessionStorageArr.unshift(sessionInfo);
            sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
        },
        resumeSessionHandler: async (index, sessionArray) => {
            let driver, path, dbName, sourceDb, pathArray, fileName, filePath;
            localStorage.setItem('sourceDb', sessionArray[index].sourceDbType);
            driver = sessionArray[index].driver;
            path = sessionArray[index].filePath;
            dbName = sessionArray[index].dbName;
            sourceDb = sessionArray[index].sourceDbType;
            pathArray = path.split('/');
            fileName = pathArray[pathArray.length - 1];
            filePath = './' + fileName;
            readTextFile(filePath, async (error, text) => {
                if (error) {
                    showSnackbar(err, ' redBg');
                }
                else {
                    let payload = {
                        "Driver": driver,
                        "DBName": dbName,
                        "FilePath": path
                    }
                    localStorage.setItem('conversionReportContent', text);
                    await Fetch.getAppData('POST', '/session/resume', payload);
                }
            });
            // return false;
        },
        switchToTab: (id) => {
            Store.changeCurrentTab(id)
        },
        SearchTable: (value, tabId) => {
            console.log(value);
            let tableVal, list, listElem;
            let ShowResultNotFound = true;
            let schemaConversionObj = JSON.parse(
                localStorage.getItem("conversionReportContent")
            );
            if (tabId === "reportTab") {
                list = document.getElementById("reportDiv");
            } else if (tabId === "ddlTab") {
                list = document.getElementById("ddlDiv");
            } else {
                list = document.getElementById("summaryDiv");
            }
            listElem = list.getElementsByTagName("section");
            let tableListLength = Object.keys(schemaConversionObj.SpSchema).length;
            for (var i = 0; i < tableListLength; i++) {
                tableVal = Object.keys(schemaConversionObj.SpSchema)[i];
                if (tableVal.indexOf(value) > -1) {
                    listElem[i].style.display = "";
                    ShowResultNotFound = false;
                } else {
                    listElem[i].style.display = "none";
                }
            }
            if (ShowResultNotFound) {
                document.getElementById("notFound").style.display = "block";
            } else {
                document.getElementById("notFound").style.display = "none";
            }
        },
        expandAll: (text, buttonId) => {
            console.log(text, buttonId);
            let collapseSection = buttonId.substring(0, buttonId.indexOf('ExpandButton'))
            if (text === 'Expand All') {
                document.getElementById(buttonId).innerHTML = 'Collapse All';
                jQuery(`.${collapseSection}Collapse`).collapse('show');
            }
            else {
                document.getElementById(buttonId).innerHTML = 'Expand All';
                jQuery(`.${collapseSection}Collapse`).collapse('hide');
            }
        },
        downloadSession: async () => {
            jQuery("<a />", {
                "download": "session.json",
                "href": "data:application/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('conversionReportContent'), null, 4),
            }).appendTo("body")
                .click(function () {
                    jQuery(this).remove()
                })[0].click();
        },
        downloadDdl: async () => {
            await fetch('/schema')
                .then(async function (response) {
                    if (response.ok) {
                        await response.text().then(function (result) {
                            localStorage.setItem('schemaFilePath', result);
                        });
                    }
                    else {
                        Promise.reject(response);
                    }
                })
                .catch(function (err) {
                    showSnackbar(err, ' redBg');
                });
            let schemaFilePath = localStorage.getItem('schemaFilePath');
            let schemaFileName = schemaFilePath.split('/')[schemaFilePath.split('/').length - 1];
            let filePath = './' + schemaFileName;
            readTextFile(filePath, function (error, text) {
                jQuery("<a />", {
                    "download": schemaFileName,
                    "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
                }).appendTo("body")
                    .click(function () {
                        jQuery(this).remove()
                    })[0].click()
            });
        },
        downloadReport: async () => {
            await fetch('/report')
                .then(async function (response) {
                    if (response.ok) {
                        await response.text().then(function (result) {
                            localStorage.setItem('reportFilePath', result);
                        });
                    }
                    else {
                        Promise.reject(response);
                    }
                })
                .catch(function (err) {
                    showSnackbar(err, ' redBg');
                });
            let reportFilePath = localStorage.getItem('reportFilePath');
            let reportFileName = reportFilePath.split('/')[reportFilePath.split('/').length - 1];
            let filePath = './' + reportFileName;
            readTextFile(filePath, function (error, text) {
                jQuery("<a />", {
                    "download": reportFileName,
                    "href": "data:application/json;charset=utf-8," + encodeURIComponent(text),
                }).appendTo("body")
                    .click(function () {
                        jQuery(this).remove()
                    })[0].click();
            })
        },
        editGlobalDataType: () => {
            createEditDataTypeTable();
            jQuery('#globalDataTypeModal').modal();
        },
        editAndSaveButtonHandler: async (event, tableNumber, tableName, notNullConstraint) => {
            let schemaConversionObj = JSON.parse(localStorage.getItem("conversionReportContent"));
            let tableId = '#src-sp-table' + tableNumber + ' tr';
            let tableColumnNumber = 0, tableData, fkTableData, secIndexTableData;
            let renameFkMap = {}, fkLength, secIndexLength, renameIndexMap = {};
            if (event.target.innerHTML.trim() === "Edit Spanner Schema") {
                let uncheckCount = [], $selectAll, $selectEachRow, checkAllTableNumber, checkClassTableNumber, spannerCellsList;
                let tableCheckboxGroup = '.chckClass_' + tableNumber;
                uncheckCount[tableNumber] = 0;
                event.target.innerHTML = "Save Changes";
                document.getElementById("editInstruction" + tableNumber).style.visibility = "hidden";
                jQuery(tableId).each(function (index) {
                    if (index === 1) {
                        $selectAll = jQuery(this).find('.bmd-form-group.is-filled.template').removeClass('template');
                    }
                    checkAllTableNumber = jQuery('#chckAll_' + tableNumber);
                    checkAllTableNumber.prop('checked', true);
                    checkAllTableNumber.click(function () {
                        tableNumber = parseInt(jQuery(this).attr('id').match(/\d+/), 10);
                        checkClassTableNumber = jQuery('.chckClass_' + tableNumber);
                        switch (jQuery(this).is(':checked')) {
                            case true:
                                checkClassTableNumber.prop('checked', true);
                                uncheckCount[tableNumber] = 0;
                                break;
                            case false:
                                checkClassTableNumber.prop('checked', false);
                                uncheckCount[tableNumber] = Object.keys(schemaConversionObj.ToSpanner[schemaConversionObj.SpSchema[tableName].Name].Cols).length;
                                break;
                        }
                    });
                    if (index > 1) {
                        $selectEachRow = jQuery(this).find('.bmd-form-group.is-filled.eachRowChckBox.template').removeClass('template');
                        jQuery(tableCheckboxGroup).prop('checked', true);
                        spannerCellsList = document.getElementsByClassName('spannerTabCell' + tableNumber + tableColumnNumber);
                        if (spannerCellsList) {

                            // edit column name
                            jQuery('#editColumnName' + tableNumber + tableColumnNumber).removeClass('template');
                            jQuery('#saveColumnName' + tableNumber + tableColumnNumber).addClass('template');

                            // edit data type
                            jQuery('#editDataType' + tableNumber + tableColumnNumber).removeClass('template');
                            jQuery('#saveDataType' + tableNumber + tableColumnNumber).addClass('template');
                            let dataTypeArray = null;
                            let globalDataTypes = JSON.parse(localStorage.getItem('globalDataTypeList'));
                            let globalDataTypesLength = Object.keys(globalDataTypes).length;
                            let srcCellValue = document.getElementById('srcDataType' + tableNumber + tableColumnNumber).innerHTML;
                            let spannerCellValue = document.getElementById('saveDataType' + tableNumber + tableColumnNumber).innerHTML;
                            let options = '';
                            for (let a = 0; a < globalDataTypesLength; a++) {
                                if (srcCellValue.trim().toLowerCase() === (Object.keys(globalDataTypes)[a]).toLowerCase()) {
                                    dataTypeArray = globalDataTypes[Object.keys(globalDataTypes)[a]];
                                    break;
                                }
                            }
                            if (dataTypeArray !== null) {
                                let dataTypeArrayLength = dataTypeArray.length;
                                for (let a = 0; a < dataTypeArrayLength; a++) {
                                    if (spannerCellValue.trim() == dataTypeArray[a].T) {
                                        options += '<option class="dataTypeOption" value=' + dataTypeArray[a].T + ' selected>' + dataTypeArray[a].T + '</option>';
                                    }
                                    else {
                                        options += '<option class="dataTypeOption" value=' + dataTypeArray[a].T + '>' + dataTypeArray[a].T + '</option>';
                                    }
                                }
                            }
                            else {
                                options += '<option class="dataTypeOption" value=' + spannerCellValue + '>' + spannerCellValue + '</option>';
                            }
                            document.getElementById("dataType" + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML = options;

                            // edit constraint
                            let notNullFound = '';
                            let constraintId = 'spConstraint' + tableNumber + tableColumnNumber;
                            let columnName = jQuery('#saveColumnName' + tableNumber + tableColumnNumber).find('.column.right.spannerColNameSpan').html();
                            if (schemaConversionObj.SpSchema[tableName].ColDefs[columnName].NotNull === true) {
                                notNullFound = "<option class='active' selected>Not Null</option>";
                            }
                            else if (schemaConversionObj.SpSchema[tableName].ColDefs[columnName].NotNull === false) {
                                notNullFound = "<option>Not Null</option>";
                            }
                            let constraintHtml = "<select id=" + constraintId + " multiple size='0' class='form-control spanner-input tableSelect' >"
                                + notNullFound
                                + "</select>";
                            spannerCellsList[2].innerHTML = constraintHtml;
                            new vanillaSelectBox("#spConstraint" + tableNumber + tableColumnNumber, {
                                placeHolder: "Select Constraints",
                                maxWidth: 500,
                                maxHeight: 300
                            });
                            jQuery('#spConstraint' + tableNumber + tableColumnNumber).on('change', function () {
                                let idNum = parseInt(jQuery(this).attr('id').match(/\d+/g), 10);
                                let constraints = document.getElementById(constraintId);
                                if (constraints) {
                                    let constraintsLength = constraints.length;
                                    for (let c = 0; c < constraintsLength; c++) {
                                        if (constraints.options[c].selected) {
                                            notNullConstraint[idNum] = 'Not Null';
                                        }
                                        else {
                                            notNullConstraint[idNum] = '';
                                        }
                                    }
                                }
                            });
                        }
                        tableColumnNumber++;
                    }
                });
                checkClassTableNumber = jQuery('.chckClass_' + tableNumber);
                checkClassTableNumber.click(function () {
                    tableNumber = parseInt(jQuery(this).closest("table").attr('id').match(/\d+/), 10);
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
                if (schemaConversionObj.SpSchema[tableName].Fks != null && schemaConversionObj.SpSchema[tableName].Fks.length != 0) {
                    fkLength = schemaConversionObj.SpSchema[tableName].Fks.length;
                    for (let x = 0; x < fkLength; x++) {
                        jQuery('#renameFk' + tableNumber + x).removeClass('template');
                        jQuery('#saveFk' + tableNumber + x).addClass('template');
                    }
                    if (schemaConversionObj.SpSchema[tableName].Fks != null && schemaConversionObj.SpSchema[tableName].Fks.length != 0) {
                        for (let p = 0; p < schemaConversionObj.SpSchema[tableName].Fks.length; p++) {
                            jQuery("#" + tableName + p + 'foreignKey').removeAttr('disabled');
                        }
                    }
                }
                if (schemaConversionObj.SpSchema[tableName].Indexes != null && schemaConversionObj.SpSchema[tableName].Indexes.length != 0) {
                    secIndexLength = schemaConversionObj.SpSchema[tableName].Indexes.length;
                    for (let x = 0; x < secIndexLength; x++) {
                        jQuery('#renameSecIndex' + tableNumber + x).removeClass('template');
                        jQuery('#saveSecIndex' + tableNumber + x).addClass('template');
                    }
                    if (schemaConversionObj.SpSchema[tableName].Indexes != null && schemaConversionObj.SpSchema[tableName].Indexes.length != 0) {
                        for (let p = 0; p < schemaConversionObj.SpSchema[tableName].Indexes.length; p++) {
                            jQuery("#" + tableName + p + 'secIndex').removeAttr('disabled');
                        }
                    }
                }
            }
            else if (event.target.innerHTML.trim() === "Save Changes") {
                let updatedColsData = {
                    'UpdateCols': {
                    }
                }
                event.target.innerHTML = "Edit Spanner Schema";
                document.getElementById("editInstruction" + tableNumber).style.visibility = "visible";
                jQuery(tableId).each(function (index) {
                    if (index > 1) {
                        let newColumnName;
                        let srcColumnName = document.getElementById('srcColumnName' + tableNumber + tableColumnNumber + tableColumnNumber).innerHTML;
                        let newColumnNameEle = document.getElementById('columnNameText' + tableNumber + tableColumnNumber + tableColumnNumber);
                        if (newColumnNameEle) {
                            newColumnName = newColumnNameEle.value;
                        }
                        let originalColumnName = schemaConversionObj.ToSpanner[tableName].Cols[srcColumnName];
                        updatedColsData.UpdateCols[originalColumnName] = {};
                        updatedColsData.UpdateCols[originalColumnName]['Removed'] = false;
                        if (newColumnName === originalColumnName) {
                            updatedColsData.UpdateCols[originalColumnName]['Rename'] = '';
                        }
                        else {
                            let columnNameExists = false;
                            let columnsLength = Object.keys(schemaConversionObj.ToSpanner[tableName].Cols).length;
                            for (let k = 0; k < columnsLength; k++) {
                                console.log(document.getElementById('columnNameText' + tableNumber + k + k).value.trim());
                                if (k != tableColumnNumber && newColumnName == document.getElementById('columnNameText' + tableNumber + k + k).value) {
                                    jQuery('#editColumnNameErrorContent').html('');
                                    jQuery('#editColumnNameErrorModal').modal();
                                    jQuery('#editColumnNameErrorContent').append("Column : '" + newColumnName + "'" + ' already exists in table : ' + "'" + tableName + "'" + '. Please try with a different column name.')
                                    updatedColsData.UpdateCols[originalColumnName]['Rename'] = '';
                                    columnNameExists = true;
                                }
                            }
                            if (!columnNameExists)
                                updatedColsData.UpdateCols[originalColumnName]['Rename'] = newColumnName;
                        }
                        updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'ADDED';
                        updatedColsData.UpdateCols[originalColumnName]['PK'] = '';
                        updatedColsData.UpdateCols[originalColumnName]['ToType'] = document.getElementById('dataType' + tableNumber + tableColumnNumber + tableColumnNumber).value;

                        if (notNullConstraint[parseInt(String(tableNumber) + String(tableColumnNumber))] === 'Not Null') {
                            updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'ADDED';
                        }
                        else if (notNullConstraint[parseInt(String(tableNumber) + String(tableColumnNumber))] === '') {
                            updatedColsData.UpdateCols[originalColumnName]['NotNull'] = 'REMOVED';
                        }

                        if (!(jQuery(this).find("input[type=checkbox]").is(":checked"))) {
                            updatedColsData.UpdateCols[originalColumnName]['Removed'] = true;
                        }
                        tableColumnNumber++;
                    }
                });
                jQuery(tableId).each(function () {
                    jQuery(this).find('.src-tab-cell .bmd-form-group').remove();
                });
                tableData = await Fetch.getAppData('POST', '/typemap/table?table=' + tableName, updatedColsData);
                if (tableData.ok) {
                    tableData = await tableData.text();
                    jQuery('#changesSavedModal').modal();
                    jQuery('#changesSavedModal').find('#modal-content').html("Changes are saved successfully !!");
                    jQuery('#changesSavedModal').find('#changes-saved-button, i').on('click', function () {
                        Store.updateSchemaScreen(tableData);
                    });
                }
                else {
                    tableData = await tableData.text();
                    jQuery('#editTableWarningModal').modal();
                    jQuery('#editTableWarningModal').find('#modal-content').html(tableData);
                    jQuery('#editTableWarningModal').find('i').click(function () {
                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                    })
                    document.getElementById('edit-table-warning').addEventListener('click', () => {
                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                    })
                }

                // save fk handler
                if (schemaConversionObj.SpSchema[tableName].Fks != null && schemaConversionObj.SpSchema[tableName].Fks.length != 0) {
                    fkLength = schemaConversionObj.SpSchema[tableName].Fks.length;
                    for (let x = 0; x < fkLength; x++) {
                        let newFkVal = document.getElementById('newFkVal' + tableNumber + x).value;
                        jQuery('#renameFk' + tableNumber + x).addClass('template');
                        if (schemaConversionObj.SpSchema[tableName].Fks[x].Name != newFkVal)
                            renameFkMap[schemaConversionObj.SpSchema[tableName].Fks[x].Name] = newFkVal;
                    }
                    if (Object.keys(renameFkMap).length > 0) {
                        let duplicateCheck = [];
                        let duplicateFound = false;
                        let keys = Object.keys(renameFkMap);
                        keys.forEach(function (key) {
                            for (let x = 0; x < fkLength; x++) {
                                if (schemaConversionObj.SpSchema[tableName].Fks[x].Name === renameFkMap[key]) {
                                    jQuery('#editTableWarningModal').modal();
                                    jQuery('#editTableWarningModal').find('#modal-content').html("Foreign Key: " + renameFkMap[key] + " already exists in table: " + tableName + ". Please try with a different name.");
                                    jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                    })
                                    duplicateFound = true;
                                }
                            }
                            if (duplicateCheck.includes(renameFkMap[key])) {
                                jQuery('#editTableWarningModal').modal();
                                jQuery('#editTableWarningModal').find('#modal-content').html('Please use a different name for each foreign key');
                                jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                    Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                })
                                duplicateFound = true;
                            }
                            else {
                                duplicateCheck.push(renameFkMap[key]);
                            }
                        });
                        switch (duplicateFound) {
                            case true:
                                // store previous state
                                break;
                            case false:
                                fkTableData = await Fetch.getAppData('POST', '/rename/fks?table=' + tableName, renameFkMap);
                                if (!fkTableData.ok) {
                                    fkTableData = await fkTableData.text();
                                    jQuery('#editTableWarningModal').modal();
                                    jQuery('#editTableWarningModal').find('#modal-content').html(fkTableData);
                                    jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                    })
                                }
                                break;
                        }
                    }
                }

                // save Secondary Index handler
                if (schemaConversionObj.SpSchema[tableName].Indexes != null && schemaConversionObj.SpSchema[tableName].Indexes.length != 0) {
                    secIndexLength = schemaConversionObj.SpSchema[tableName].Indexes.length;
                    for (let x = 0; x < secIndexLength; x++) {
                        let newSecIndexVal = document.getElementById('newSecIndexVal' + tableNumber + x).value;
                        jQuery('#renameSecIndex' + tableNumber + x).addClass('template');
                        if (schemaConversionObj.SpSchema[tableName].Indexes[x].Name != newSecIndexVal)
                            renameIndexMap[schemaConversionObj.SpSchema[tableName].Indexes[x].Name] = newSecIndexVal;
                    }
                    if (Object.keys(renameIndexMap).length > 0) {
                        let duplicateCheck = [];
                        let duplicateFound = false;
                        let keys = Object.keys(renameIndexMap);
                        keys.forEach(function (key) {
                            for (let x = 0; x < secIndexLength; x++) {
                                if (schemaConversionObj.SpSchema[tableName].Indexes[x].Name === renameIndexMap[key]) {
                                    jQuery('#editTableWarningModal').modal();
                                    jQuery('#editTableWarningModal').find('#modal-content').html("Index: " + renameIndexMap[key] + " already exists in table: " + tableName + ". Please try with a different name.");
                                    jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                    })
                                    duplicateFound = true;
                                }
                            }
                            if (duplicateCheck.includes(renameIndexMap[key])) {
                                jQuery('#editTableWarningModal').modal();
                                jQuery('#editTableWarningModal').find('#modal-content').html('Please use a different name for each secondary index');
                                jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                    Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                })
                                duplicateFound = true;
                            }
                            else {
                                duplicateCheck.push(renameIndexMap[key]);
                            }
                        });
                        switch (duplicateFound) {
                            case true:
                                // store previous state
                                break;
                            case false:
                                secIndexTableData = await Fetch.getAppData('POST', '/rename/indexes?table=' + tableName, renameIndexMap);
                                if (!secIndexTableData.ok) {
                                    secIndexTableData = await secIndexTableData.text();
                                    jQuery('#editTableWarningModal').modal();
                                    jQuery('#editTableWarningModal').find('#modal-content').html(secIndexTableData);
                                    jQuery('#editTableWarningModal').find('#edit-table-warning').on('click', function () {
                                        Store.updateSchemaScreen(localStorage.getItem('conversionReportContent'));
                                    })
                                }
                                break;
                        }
                    }
                }
            }
        },
        getGlobalDataTypeList: async () => {
            let response = await Fetch.getAppData('GET', '/typemap');
            response = await response.json();
            localStorage.setItem('globalDataTypeList', JSON.stringify(response));
        },
        dropForeignKeyHandler: async (tableName, tableNumber, pos) => {
            let response;
            response = await Fetch.getAppData('GET', '/drop/fk?table=' + tableName + '&pos=' + pos);
            if (response.ok) {
                let responseCopy = response.clone();
                let jsonResponse = await responseCopy.json();
                let textRresponse = await response.text();
                localStorage.setItem('conversionReportContent', textRresponse);
                if (jsonResponse.SpSchema[tableName].Fks != null && jsonResponse.SpSchema[tableName].Fks.length != 0) {
                    let table = document.getElementById('fkTableBody' + tableNumber);
                    let rowCount = table.rows.length;
                    let keyFound;
                    let z;
                    for (let x = 0; x < rowCount; x++) {
                        keyFound = false;
                        for (let y = 0; y < jsonResponse.SpSchema[tableName].Fks.length; y++) {
                            let oldFkVal = jQuery('#saveFk' + tableNumber + x).removeClass('template').html();
                            if (jsonResponse.SpSchema[tableName].Fks[y].Name === oldFkVal) {
                                jQuery('#saveFk' + tableNumber + x).addClass('template');
                                document.getElementById(tableName + x + 'foreignKey').id = tableName + y + 'foreignKey';
                                document.getElementById('saveFk' + tableNumber + x).id = 'saveFk' + tableNumber + y;
                                document.getElementById('renameFk' + tableNumber + x).id = 'renameFk' + tableNumber + y;
                                document.getElementById('newFkVal' + tableNumber + x).id = 'newFkVal' + tableNumber + y;
                                keyFound = true;
                                break;
                            }
                        }
                        if (keyFound == false) {
                            z = x;
                        }
                    }
                    table.deleteRow(z);
                }
                else {
                    jQuery('#' + tableNumber).find('.fkCard').addClass('template');
                }
            }
        },
        dropSecondaryIndexHandler: async (tableName, tableNumber, pos) => {
            let response;
            response = await Fetch.getAppData('GET', '/drop/secondaryindex?table=' + tableName + '&pos=' + pos);
            if (response.ok) {
                let responseCopy = response.clone();
                let jsonObj = await responseCopy.json();
                let textRresponse = await response.text();
                localStorage.setItem('conversionReportContent', textRresponse);
                let table = document.getElementById('indexTableBody' + tableNumber);
                let rowCount = table.rows.length;
                if (jsonObj.SpSchema[tableName].Indexes != null && jsonObj.SpSchema[tableName].Indexes.length != 0) {
                    let keyFound;
                    let z;
                    for (let x = 0; x < rowCount; x++) {
                        keyFound = false;
                        for (let y = 0; y < jsonObj.SpSchema[tableName].Indexes.length; y++) {
                            let oldSecIndex = jQuery('#saveSecIndex' + tableNumber + x).removeClass('template').html();
                            if (jsonObj.SpSchema[tableName].Indexes[y].Name === oldSecIndex) {
                                jQuery('#saveSecIndex' + tableNumber + x).addClass('template');
                                document.getElementById(tableName + x + 'secIndex').id = tableName + y + 'secIndex';
                                document.getElementById('saveSecIndex' + tableNumber + x).id = 'saveSecIndex' + tableNumber + y;
                                document.getElementById('renameSecIndex' + tableNumber + x).id = 'renameSecIndex' + tableNumber + y;
                                document.getElementById('newSecIndexVal' + tableNumber + x).id = 'newSecIndexVal' + tableNumber + y;
                                keyFound = true;
                                break;
                            }
                        }
                        if (keyFound == false) {
                            z = x;
                        }
                    }
                    table.deleteRow(z);
                }
                else {
                    for (let x = 0; x < rowCount; x++) {
                        table.deleteRow(x);
                    }
                    jQuery('#' + tableNumber).find('.index-acc-table.fkTable').css('visibility', 'hidden');
                    jQuery('#' + tableNumber).find('.index-acc-table.fkTable').addClass('importantRule0');
                    jQuery('#' + tableNumber).find('.index-acc-table.fkTable').removeClass('importantRule100');
                }
            }
        }
    };
})();

export default Actions;
