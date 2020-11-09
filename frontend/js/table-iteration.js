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
            col.push('MySQL')
        }
        else
            col.push('Spanner')
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

    // schemaConversionObj = JSON.stringify(schemaConversionObj);
    // schemaConversionObj = schemaConversionObj.toLowerCase();
    // schemaConversionObj = JSON.parse(schemaConversionObj);

    src_table = schemaConversionObj.SrcSchema[Object.keys(schemaConversionObj.ToSpanner)[i]];
    src_table_name = Object.keys(schemaConversionObj.ToSpanner)[i]
    src_table_cols = src_table.ColNames
    sp_table = schemaConversionObj.SpSchema[src_table_name]
    sp_table_cols = sp_table.ColNames;
    pkArray[i] = schemaConversionObj.SpSchema[Object.keys(schemaConversionObj.SpSchema)[i]].Pks;
    pkSeqId[i] = 1;
    for (var x = 0; x < pkArray[i].length; x++) {
        pkArray[i][x].seqId = pkSeqId[i];
        pkSeqId[i]++;
    }

}