$(document).ready(function () {
    TabBar("#tabbar");
    Search("#searchcomponent", "searchTable")
    jQuery('#createIndexForm > div > input').keyup(function () {
        let empty = false;
        jQuery('#createIndexForm > div > input').each(function () {
            if (jQuery(this).val() === '') {
                empty = true;
            }
        });
        if (empty) {
            jQuery('#createIndexButton').attr('disabled', 'disabled');
        }
        else {
            jQuery('#createIndexButton').removeAttr('disabled');
        }
    });

    setActiveSelectedMenu('schemaScreen');
    $(".modal-backdrop").hide();

    const createDdlFromJson = (result) => {
        let ddl = result;
        let ddlLength = Object.keys(ddl).length;
        let createIndex, createEndIndex, $newDdlElement;
        let conversionRateResp = {};
        conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
        for (var i = 0; i < ddlLength; i++) {
            createIndex = (ddl[Object.keys(ddl)[i]]).search('CREATE TABLE');
            createEndIndex = createIndex + 12;
            ddl[Object.keys(ddl)[i]] = ddl[Object.keys(ddl)[i]].substring(0, createIndex) + ddl[Object.keys(ddl)[i]].substring(createIndex, createEndIndex).fontcolor('#4285f4').bold() + ddl[Object.keys(ddl)[i]].substring(createEndIndex);
            $newDdlElement = jQuery('#ddlDiv').find('.ddlSection.template').clone().removeClass('template');
            $newDdlElement.attr('id', 'ddl' + i);
            $newDdlElement.find('.card-header.ddl-card-header.ddl-border-bottom').addClass(panelBorderClass(conversionRateResp[srcTableName[i]]));
            $newDdlElement.find('a').attr('href', '#' + Object.keys(ddl)[i] + '-ddl');
            $newDdlElement.find('a > span').html(Object.keys(ddl)[i]);
            $newDdlElement.find('.collapse.ddlCollapse').attr('id', Object.keys(ddl)[i] + '-ddl');
            $newDdlElement.find('.mdc-card.mdc-card-content.ddl-border.table-card-border').addClass(mdcCardBorder(conversionRateResp[srcTableName[i]]));
            $newDdlElement.find('code').html(ddl[srcTableName[i]].split('\n').join(`<span class='sql-c'></span>`));
            $newDdlElement.appendTo('#ddlDiv');
        }
    }

    const createSummaryFromJson = (result) => {
        let summary = result;
        let summaryLength = Object.keys(summary).length;
        let summaryContent = '';
        let $newSummaryElement;
        let conversionRateResp = {};
        conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
        for (var i = 0; i < summaryLength; i++) {
            $newSummaryElement = jQuery('#summaryDiv').find('.summarySection.template').clone().removeClass('template');
            $newSummaryElement.attr('id', 'summary' + i);
            $newSummaryElement.find('.card-header.ddl-card-header.ddl-border-bottom').addClass(panelBorderClass(conversionRateResp[srcTableName[i]]));
            $newSummaryElement.find('a').attr('href', '#' + Object.keys(summary)[i] + '-summary');
            $newSummaryElement.find('a > span').html(Object.keys(summary)[i]);
            $newSummaryElement.find('.collapse.summary-collapse').attr('id', Object.keys(summary)[i] + '-summary');
            $newSummaryElement.find('.mdc-card.mdc-card-content.ddl-border.table-card-border').addClass(mdcCardBorder(conversionRateResp[srcTableName[i]]));
            $newSummaryElement.find('.mdc-card.summary-content').html(summary[srcTableName[i]].split('\n').join('<br />'));
            $newSummaryElement.appendTo('#summaryDiv');
        }
    }

    const createSourceAndSpannerTables = async (obj) => {
        hideSpinner();
        getGlobalDataTypeList();
        schemaConversionObj = obj;
        let columnNameContent, dataTypeContent, constraintsContent, notNullFound, constraintId, srcConstraintHtml;
        let pksSp = [], initialColNameArray = [], notNullFoundFlag = [], pkSeqId = [], initialPkSeqId = [], constraintTabCell = [], primaryTabCell = [], spPlaceholder = [], srcPlaceholder = [], countSp = [], countSrc = [];
        let sourceTableFlag = '';
        let conversionRateResp = {};
        let constraintCount = 0;
        let srcTableNum = Object.keys(schemaConversionObj.SrcSchema).length;
        let spTable_num = Object.keys(schemaConversionObj.SpSchema).length;
        let srcTable, spTable, spTableCols, pkArrayLength, columnsLength, currentColumnSp, currentColumnSrc, pksSpLength, $newConvElement, $convTableContent, $fkTableContent, $indexTableContent;

        for (var x = 0; x < srcTableNum; x++) {
            initialPkSeqId[x] = [];
            constraintTabCell[x] = [];
            primaryTabCell[x] = [];
            notPrimary[x] = [];
            notNullFoundFlag[x] = [];
            pkArray[x] = [];
            srcPlaceholder[x] = [];
            spPlaceholder[x] = [];
            countSp[x] = [];
            countSrc[x] = [];
            pksSp[x] = [];
        }

        conversionRateResp = JSON.parse(localStorage.getItem('tableBorderColor'));
        for (var i = 0; i < srcTableNum; i++) {
            srcTable = schemaConversionObj.SrcSchema[Object.keys(schemaConversionObj.ToSpanner)[i]];
            srcTableName[i] = Object.keys(schemaConversionObj.ToSpanner)[i];
            spTable = schemaConversionObj.SpSchema[srcTableName[i]];
            spTableCols = spTable.ColNames;
            pkArray[i] = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[i]].Pks;
            pkSeqId[i] = 1;
            pkArrayLength = pkArray[i].length;
            if (pkArrayLength === 1 && pkArray[i][0].Col === 'synth_id')
                pkArrayLength = 0;
            columnsLength = Object.keys(schemaConversionObj.ToSpanner[spTable.Name].Cols).length;
            for (var x = 0; x < pkArrayLength; x++) {
                if (pkArray[i][x].seqId == undefined) {
                    pkArray[i][x].seqId = pkSeqId[i];
                    pkSeqId[i]++;
                }
            }
            schemaConversionObj.SpSchema[srcTableName[i]].Pks = pkArray[i];
            sourceTableFlag = localStorage.getItem('sourceDbName');
            $newConvElement = jQuery('#reportDiv').find('.reportSection.template').clone().removeClass('template');
            $newConvElement.attr('id', i);
            $newConvElement.find('.card-header.report-card-header.borderBottom').addClass(panelBorderClass(conversionRateResp[srcTableName[i]]));
            $newConvElement.find('a').attr('href', '#' + Object.keys(schemaConversionObj.SrcSchema)[i]);
            $newConvElement.find('a > span').html(Object.keys(schemaConversionObj.SrcSchema)[i]);
            $newConvElement.find('.right-align.edit-button.hide-content').attr('id', 'editSpanner' + i);
            $newConvElement.find('.right-align.edit-instruction.hide-content').attr('id', 'editInstruction' + i);
            $newConvElement.find('#editSpanner' + i).click(function () {
                let index = parseInt(jQuery(this).attr('id').match(/\d+/), 10);
                schemaConversionObj = JSON.parse(localStorage.getItem('conversionReportContent'));
                let spTable = schemaConversionObj.SpSchema[srcTableName[index]];
                initialColNameArray[index] = [];
                if (jQuery(this).html().trim() === "Edit Spanner Schema") {
                    if (spTable.Fks != null && spTable.Fks.length != 0) {
                        jQuery("#saveInterleave" + index).removeAttr('disabled');
                        jQuery("#add" + index).removeAttr('disabled');
                        jQuery("#interleave" + index).removeAttr('disabled');
                        for (var p = 0; p < spTable.Fks.length; p++) {
                            jQuery("#" + srcTableName[index] + p + 'foreignKey').removeAttr('disabled');
                        }
                    }
                    if (spTable.Indexes != null && spTable.Indexes.length != 0) {
                        for (var p = 0; p < spTable.Indexes.length; p++) {
                            jQuery("#" + srcTableName[index] + p + 'secIndex').removeAttr('disabled');
                        }
                    }
                }
                else {
                    if (spTable.Fks != null && spTable.Fks.length != 0) {
                        jQuery("#saveInterleave" + index).attr('disabled', 'disabled');
                        jQuery("#add" + index).attr('disabled', 'disabled');
                        jQuery("#interleave" + index).attr('disabled', 'disabled');
                        for (var p = 0; p < spTable.Fks.length; p++) {
                            jQuery("#" + srcTableName[index] + p + 'foreignKey').attr('disabled', 'disabled');
                        }
                    }
                    if (spTable.Indexes != null && spTable.Indexes.length != 0) {
                        for (var p = 0; p < spTable.Indexes.length; p++) {
                            jQuery("#" + srcTableName[index] + p + 'secIndex').attr('disabled', 'disabled');
                        }
                    }
                }
                editAndSaveButtonHandler(jQuery(this), spPlaceholder[index], pkArray[index], notNullFoundFlag[index], initialColNameArray[index], notPrimary[index]);
            });
            $newConvElement.find('.collapse.reportCollapse').attr('id', Object.keys(schemaConversionObj.SrcSchema)[i]);
            $newConvElement.find('.mdc-card.mdc-card-content.table-card-border').addClass(mdcCardBorder(conversionRateResp[srcTableName[i]]));
            $newConvElement.find('.acc-table').attr('id', 'src-sp-table' + i);
            $newConvElement.find('.acc-table-th-src').append(sourceTableFlag);

            for (var k = 0; k < columnsLength; k++) {
                $convTableContent = $newConvElement.find('.reportTableContent.template').clone().removeClass('template');
                currentColumnSrc = Object.keys(schemaConversionObj.ToSpanner[spTable.Name].Cols)[k];
                currentColumnSp = schemaConversionObj.ToSpanner[spTable.Name].Cols[currentColumnSrc];
                pksSp[i] = [...spTable.Pks];
                pksSpLength = pksSp[i].length;
                $convTableContent.find('.saveColumnName.template').removeClass('template').attr('id', 'saveColumnName' + i + k);
                $convTableContent.find('.editColumnName.template').attr('id', 'editColumnName' + i + k);
                $convTableContent.find('.editDataType.template').attr('id', 'editDataType' + i + k);
                $convTableContent.find('.saveConstraint.template').removeClass('template').attr('id', 'saveConstraint' + i + k);
                $convTableContent.find('.editConstraint.template').attr('id', 'editConstraint' + i + k);
                if (srcTable.PrimaryKeys === null || srcTable.PrimaryKeys[0].Column !== currentColumnSrc) {
                    $convTableContent.find('.srcPk').css('visibility', 'hidden');
                }
                $convTableContent.find('.column.right.srcColumn').html(currentColumnSrc);
                $convTableContent.find('.column.right.srcColumn').attr('id', 'srcColumn' + k);

                $convTableContent.find('.sp-column.acc-table-td.spannerColName').addClass('spannerTabCell' + i + k);
                pkFlag = false;
                for (var x = 0; x < pksSpLength; x++) {
                    if (pksSp[i][x].Col === currentColumnSp) {
                        pkFlag = true;
                        $convTableContent.find('.column.left.spannerPkSpan').attr('data-toggle', 'tooltip');
                        $convTableContent.find('.column.left.spannerPkSpan').attr('data-placement', 'bottom');
                        $convTableContent.find('.column.left.spannerPkSpan').attr('title', 'primary key: ' + currentColumnSp);
                        $convTableContent.find('.column.left.spannerPkSpan').attr('id', 'keyIcon' + i + k + k);
                        $convTableContent.find('.column.left.spannerPkSpan').css('cursor', 'pointer');
                        $convTableContent.find('.column.left.spannerPkSpan > sub').html(pksSp[i][x].seqId);

                        $convTableContent.find('.column.right.spannerColNameSpan').attr('data-toggle', 'tooltip');
                        $convTableContent.find('.column.right.spannerColNameSpan').attr('data-placement', 'bottom');
                        $convTableContent.find('.column.right.spannerColNameSpan').attr('title', 'primary key: ' + currentColumnSp);
                        $convTableContent.find('.column.right.spannerColNameSpan').attr('id', 'columnNameText' + i + k + k);
                        $convTableContent.find('.column.right.spannerColNameSpan').css('cursor', 'pointer');
                        $convTableContent.find('.column.right.spannerColNameSpan').html(currentColumnSp);
                        notPrimary[i][k] = false;
                        initialPkSeqId[i][k] = pksSp[i][x].seqId;
                        break
                    }
                }
                if (pkFlag === false) {
                    notPrimary[i][k] = true;
                    $convTableContent.find('.column.left.spannerPkSpan').attr('id', 'keyIcon' + i + k + k);
                    $convTableContent.find($convTableContent.find('.column.left.spannerPkSpan > img')).css('visibility', 'hidden');
                    $convTableContent.find('.column.right.spannerColNameSpan').attr('id', 'columnNameText' + i + k + k);
                    $convTableContent.find('.column.right.spannerColNameSpan').html(currentColumnSp);
                }
                primaryTabCell[i][k] = $convTableContent;
                keyIconValue = 'keyIcon' + i + k + k;
                keyColumnObj = { 'keyIconId': keyIconValue, 'columnName': currentColumnSp };

                $convTableContent.find('.acc-table-td.srcDataType').attr('id', 'srcDataType' + i + k);
                $convTableContent.find('.acc-table-td.srcDataType').html(srcTable.ColDefs[currentColumnSrc].Type.Name);
                $convTableContent.find('.sp-column.acc-table-td.spannerDataType').attr('id', 'dataType' + i + k);
                $convTableContent.find('.saveDataType.template').removeClass('template').attr('id', 'saveDataType' + i + k).html(spTable.ColDefs[currentColumnSp].T.Name);
                $convTableContent.find('.sp-column.acc-table-td.spannerDataType').addClass('spannerTabCell' + i + k);

                countSrc[i][k] = 0;
                srcPlaceholder[i][k] = countSrc[i][k];
                if (srcTable.ColDefs[currentColumnSrc].NotNull !== undefined) {
                    if (srcTable.ColDefs[currentColumnSrc].NotNull === true) {
                        countSrc[i][k] = countSrc[i][k] + 1;
                        srcPlaceholder[i][k] = countSrc[i][k];
                        $convTableContent.find('.srcNotNullConstraint').addClass('active');
                    }
                }
                constraintId = 'srcConstraint' + i + k;
                $convTableContent.find('.form-control.spanner-input.table-select.srcConstraint').attr('id', constraintId);

                countSp[i][k] = 0;
                spPlaceholder[i][k] = countSp[i][k];
                $convTableContent.find('.acc-table-td.sp-column.acc-table-td').addClass('spannerTabCell' + i + k);
                // checking not null consraint
                if (spTable.ColDefs[currentColumnSp].NotNull !== undefined) {
                    if (spTable.ColDefs[currentColumnSp].NotNull === true) {
                        countSp[i][k] = countSp[i][k] + 1
                        spPlaceholder[i][k] = countSp[i][k];
                        $convTableContent.find('.spannerNotNullConstraint').addClass('active');
                        notNullFoundFlag[i][k] = true;
                        notNullConstraint[parseInt(String(i) + String(k))] = 'Not Null';
                    }
                    else {
                        notNullFoundFlag[i][k] = false;
                        notNullConstraint[parseInt(String(i) + String(k))] = '';
                    }
                }
                constraintId = 'spConstraint' + i + k;
                $convTableContent.find('.form-control.spanner-input.table-select.spannerConstraint').attr('id', constraintId)
                constraintTabCell[i][k] = $convTableContent;
                $convTableContent.appendTo($newConvElement.find('.acc-table-body'));
            }
            $newConvElement.find('.acc-table-body').find("tr").eq(0).remove();
            if (spTable.Fks != null && spTable.Fks.length != 0) {
                let foreignKeyId, tableNumber;
                $newConvElement.find('.fk-card').removeClass('template');
                $newConvElement.find('.fk-font').attr('href', '#foreignKey' + i);
                $newConvElement.find('fieldset').attr('id', 'radioBtnArea' + i);
                $newConvElement.find('.fk-font').html('Foreign Keys');
                $newConvElement.find('.collapse.fk-collapse').attr('id', 'foreignKey' + i);
                $newConvElement.find('.radio.addRadio').attr('id', 'add' + i);
                $newConvElement.find('#add' + i).attr('name', 'fks' + i);
                $newConvElement.find('.radio.interleaveRadio').attr('id', 'interleave' + i);
                $newConvElement.find('#interleave' + i).attr('name', 'fks' + i);
                checkInterleaveConversion(i);
                $newConvElement.find('.fkTableBody').attr('id', 'fkTableBody' + i);
                for (var p = 0; p < spTable.Fks.length; p++) {
                    $fkTableContent = $newConvElement.find('.fkTableTr.template').clone().removeClass('template');
                    $fkTableContent.find('.renameFk.template').attr('id', 'renameFk' + i + p);
                    $fkTableContent.find('.saveFk.template').removeClass('template').attr('id', 'saveFk' + i + p).html(spTable.Fks[p].Name);
                    $fkTableContent.find('.acc-table-td.fkTableColumns').html(spTable.Fks[p].Columns);
                    $fkTableContent.find('.acc-table-td.fkTableReferTable').html(spTable.Fks[p].ReferTable);
                    $fkTableContent.find('.acc-table-td.fkTableReferColumns').html(spTable.Fks[p].ReferColumns);
                    $fkTableContent.find('button').attr('id', spTable.Name + p + 'foreignKey');
                    $fkTableContent.find('#' + spTable.Name + p + 'foreignKey').click(function () {
                        tableNumber = parseInt(jQuery(this).closest('.collapse.fk-collapse').attr('id').match(/\d+/), 10);
                        foreignKeyId = jQuery(this).attr('id');
                        localStorage.setItem('foreignKeyId', foreignKeyId);
                        localStorage.setItem('tableNumber', tableNumber);
                        jQuery('#foreignKeyDeleteWarning').modal();
                    });
                    $fkTableContent.appendTo($newConvElement.find('.fkTableBody'));
                }
            }
            $newConvElement.find('.fkTableBody').find("tr").eq(0).remove();

            $newConvElement.find('.indexesCard').removeClass('template');
            $newConvElement.find('.index-font').attr('href', '#indexKey' + i);
            $newConvElement.find('.index-font').html('Secondary Indexes');
            $newConvElement.find('.indexTableBody').attr('id', 'indexTableBody' + i);
            $newConvElement.find('.new-index-button').attr('id', 'indexButton' + i);
            $newConvElement.find('.collapse.index-collapse').attr('id', 'indexKey' + i);
            $newConvElement.find('.index-acc-table.fk-table').css('visibility', 'hidden');
            $newConvElement.find('.index-acc-table.fk-table').addClass('important-rule-0');
            $newConvElement.find('.index-acc-table.fk-table').removeClass('important-rule-100');
            if (spTable.Indexes != null && spTable.Indexes.length != 0) {
                let indexKeys;
                $newConvElement.find('.index-acc-table.fk-table').css('visibility', 'visible');
                $newConvElement.find('.index-acc-table.fk-table').addClass('important-rule-100');
                $newConvElement.find('.index-acc-table.fk-table').removeClass('important-rule-0');
                for (var p = 0; p < spTable.Indexes.length; p++) {
                    $indexTableContent = $newConvElement.find('.indexTableTr.template').clone().removeClass('template');
                    $indexTableContent.find('.renameSecIndex.template').attr('id', 'renameSecIndex' + i + p);
                    $indexTableContent.find('.saveSecIndex.template').removeClass('template').attr('id', 'saveSecIndex' + i + p).html(spTable.Indexes[p].Name);
                    $indexTableContent.find('.acc-table-td.indexesTable').html(spTable.Indexes[p].Table);
                    $indexTableContent.find('.acc-table-td.indexesUnique').html(spTable.Indexes[p].Unique.toString());
                    indexKeys = '';
                    for (var k = 0; k < spTable.Indexes[p].Keys.length; k++) {
                        indexKeys += spTable.Indexes[p].Keys[k].Col + ', '
                    }
                    indexKeys = indexKeys.replace(/,\s*$/, "");
                    $indexTableContent.find('.acc-table-td.indexesKeys').html(indexKeys);
                    $indexTableContent.find('button').attr('id', spTable.Name + p + 'secIndex');
                    $indexTableContent.find('#' + spTable.Name + p + 'secIndex').click(function () {
                        let indexId = jQuery(this).attr('id');
                        let secIndexTableNumber = parseInt(jQuery(this).closest('.index-collapse.collapse').attr('id').match(/\d+/), 10);
                        localStorage.setItem('indexId', indexId);
                        localStorage.setItem('secIndexTableNumber', secIndexTableNumber);
                        jQuery('#secIndexDeleteWarning').modal();
                    });
                    $indexTableContent.appendTo($newConvElement.find('.indexTableBody'));
                }
            }
            $newConvElement.find('.indexTableBody').find("tr").eq(0).remove();
            $newConvElement.find('.summary-font').attr('href', '#viewSummary' + i);
            $newConvElement.find('.collapse.inner-summary-collapse').attr('id', 'viewSummary' + i);
            $newConvElement.find('.mdc-card.summary-content').html(JSON.parse(localStorage.getItem('summaryReportContent'))[srcTableName[i]].split('\n').join('<br />'));
            $newConvElement.appendTo('#reportDiv');
        }
        // showSnackbar('schema converted successfully !!', ' greenBg');
        initSchemaScreenTasks();
        for (var i = 0; i < spTable_num; i++) {
            let spTable = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[i]]
            let spTableCols = spTable.ColNames;
            let spTableColsLength = spTableCols.length;
            for (var j = 0; j < spTableColsLength; j++) {
                if (document.getElementById('spConstraint' + i + j) != null) {
                    // if (jQuery('#src-sp-table' + i).find('#spConstraint' + i + j) != null) {
                    new vanillaSelectBox('#spConstraint' + i + j, {
                        placeHolder: spPlaceholder[i][j] + " constraints selected",
                        maxWidth: 500,
                        maxHeight: 300
                    });
                }
                if (document.getElementById('srcConstraint' + i + j) != null) {
                    new vanillaSelectBox('#srcConstraint' + i + j, {
                        placeHolder: srcPlaceholder[i][j] + " constraints selected",
                        maxWidth: 500,
                        maxHeight: 300
                    });
                }
            }
        }
        tooltipHandler();
        for (var i = 0; i < srcTableNum; i++) {
            let tableId = '#src-sp-table' + i;
            jQuery(tableId).DataTable({ "paging": false });
        }
    }
    createSourceAndSpannerTables(JSON.parse(localStorage.getItem('conversionReportContent')));
    createDdlFromJson(JSON.parse(localStorage.getItem('ddlStatementsContent')));
    createSummaryFromJson(JSON.parse(localStorage.getItem('summaryReportContent')));
});