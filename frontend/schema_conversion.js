/**
 * Function to initialise the tasks of edit schema screen
 *
 * @return {null}
 */
function initTasks() {
  $(document).ready(function () {

    // fetch(apiUrl + '/getSession', {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   }
    // })
    // .then(function (res) {
    //   res.json().then(function (sessionInfoResp) {
    //     debugger
    //     console.log(sessionInfoResp);
    //       sessionStorageArr = JSON.parse(sessionStorage.getItem('sessionStorage'));
    //       if (sessionStorageArr == null) {
    //         sessionStorageArr = [];
    //         sessionStorageArr.push(sessionInfoResp);
    //       }
    //       else {
    //         sessionStorageArr.push(sessionInfoResp);
    //       }
    //       sessionStorage.setItem('sessionStorage', JSON.stringify(sessionStorageArr));
    //       console.log(JSON.parse(sessionStorage.getItem('sessionStorage')))
    //   })
    // });

    $('.reportCollapse').on('show.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      reportAccCount = reportAccCount + 1;
      document.getElementById('reportExpandButton').innerHTML = 'Collapse All';
    })

    $('.reportCollapse').on('hide.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      reportAccCount = reportAccCount - 1;
      if (reportAccCount == 0)
      {
        document.getElementById('reportExpandButton').innerHTML = 'Expand All';
      }
    })

    $('.ddlCollapse').on('show.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      ddlAccCount = ddlAccCount + 1;
      document.getElementById('ddlExpandButton').innerHTML = 'Collapse All';
    })

    $('.ddlCollapse').on('hide.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      ddlAccCount = ddlAccCount - 1;
      if (ddlAccCount == 0)
      {
        document.getElementById('ddlExpandButton').innerHTML = 'Expand All';
      }
    })

    $('.summaryCollapse').on('show.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      summaryAccCount = summaryAccCount + 1;
      document.getElementById('summaryExpandButton').innerHTML = 'Collapse All';
    })

    $('.summaryCollapse').on('hide.bs.collapse', function() {
      $(this).closest('.card').find('.rotate-icon').toggleClass('down');
      summaryAccCount = summaryAccCount - 1;
      if (summaryAccCount == 0)
      {
        document.getElementById('summaryExpandButton').innerHTML = 'Expand All';
      }
    })

    $('.collapse').on('show.bs.collapse hide.bs.collapse', function () {
        $(this).closest('.card').find('.card-header .right-align').toggleClass('show-content hide-content');
        $(this).closest('.card').find('.report-card-header').toggleClass('borderBottom remBorderBottom');
        $(this).closest('.card').find('.ddl-card-header').toggleClass('ddlBorderBottom ddlRemBorderBottom');
    });
  });
}

/**
 * Function for calling initTasks and html functions for edit schema screen
 *
 * @param {any} params
 * @return {Function}
 */
function schemaReport(params)
{ 
  initTasks();
  return this.renderSchemaReportHtml();
}

/**
 * Function to implement search functionality in all the tabs of edit schema screen
 *
 * @return {null}
 */
function searchTable() {
  var input, filter, tableList, i, tableVal, ul, li, flag, elem;
  
  notFoundTxt.style.display = 'none';

  elem = document.getElementById('tabBg');
  elem.appendChild(notFoundTxt);
  
  flag = false
  input = document.getElementById(tabSearchInput);
  filter = input.value.toUpperCase();
  ul = document.getElementById(tableListArea);
  ul.style.display = '';
  li = ul.getElementsByTagName('area');
  tableListLength = Object.keys(schemaConversionObj_original.SpSchema).length;
  for (i=0; i<Object.keys(schemaConversionObj_original.SpSchema).length; i++) {
    tableVal = Object.keys(schemaConversionObj_original.SpSchema)[i];
    if (tableVal.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = '';
      flag = true;
    }
    else {
      li[i].style.display = 'none';
    }
  }

  if (flag == false) {
    notFoundTxt.style.display = '';
    ul.style.display = 'none';
  }

}

/**
 * Function to call set data type api
 *
 * @return {null}
 */
function setGlobalDataType() {
  var dataTypeJson = {};
  if (!isLive) {
    var tableLen = jQuery('#globalDataType tr').length;
    for (var i=1; i<tableLen; i++) {
      var row = document.getElementById('dataTypeRow'+i);
      var cells = row.getElementsByTagName('td');
      for (var j=0; j<cells.length; j++) {
        if (j == 0) {
          var key = cells[j].innerText;
        }
        else {
          dataTypeJson[key] = document.getElementById('dataTypeSel'+i+j).value
        }
      }
    }
  }
  else {

    var tableLen = jQuery('#globalDataType tr').length;
    for (var i=1; i<tableLen; i++) {
      var row = document.getElementById('dataTypeRow'+i);
      var cells = row.getElementsByTagName('td');
      for (var j=0; j<cells.length; j++) {
        if (j == 0) {
          var key = cells[j].innerText;
        }
        else {
          dataTypeJson[key] = document.getElementById('dataTypeSel'+i+j).value;
        }
      }
    }

    fetch(apiUrl + '/setTypeMap', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataTypeJson)
    })
    .then(function(res){
        console.log(res);
    }) 
  }
}

/**
 * Function to render edit schema screen html
 *
 * @return {html}
 */
function renderSchemaReportHtml()
{
    return(`
      <body>
        <header class="main-header" onLoad="CallbackFunction();">
          <nav class="navbar navbar-static-top">
            <img src="Icons/Icons/google-spanner-logo.png" class="logo">
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic" style="margin-right: 30px;"><a href='/frontend/' style="text-decoration: none; color: #5E5752;">Home</a></div>
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic" style="margin-right: 30px; text-decoration: none; color: #4285f4;"><a href="#">Schema Conversion</a>
            </div>
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic"><a href="#" style="text-decoration: none; color: #5E5752;">Instructions</a></div>
          </nav>
        
        </header>

        <div class='spinner-backdrop' id='toggle-spinner' style="display:none">
          <div id="spinner"></div>
        </div>

        <div class="summary-main-content">

            <div>
                <h4 class="report-header">Recommended Schema Conversion Report 
                  <button id="download-schema" class="download-button">Download Schema File</button>
                  <button id="download-ddl" style='display: none;' class="download-button">Download SQL Schema</button>
                  <button id="download-report" style='display: none;' class="download-button">Download Report</button>
                </h4>
            </div>
            <div class="report-tabs">
            <ul class="nav nav-tabs md-tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="reportTab" data-toggle="tab" href="#report" role="tab" aria-controls="report"
                  aria-selected="true" onclick='findTab(this.id)'>Conversion Report</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="ddlTab" data-toggle="tab" href="#ddl" role="tab" aria-controls="ddl"
                  aria-selected="false" onclick='findTab(this.id)'>DDL Statements</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="summaryTab" data-toggle="tab" href="#summary" role="tab" aria-controls="summary"
                  aria-selected="false" onclick='findTab(this.id)'>Summary Report</a>
              </li>
            </ul>
            </div>

            <div class="status-icons">

              <form class="form-inline d-flex justify-content-center md-form form-sm mt-0 searchForm" id='reportSearchForm'>
                <i class="fas fa-search" aria-hidden="true"></i>
                <input class="form-control form-control-sm ml-3 w-75 searchBox" type="text" placeholder="Search table" autocomplete='off'
                  aria-label="Search" onkeyup='searchTable()' id='reportSearchInput'>
              </form>

              <form class="form-inline d-flex justify-content-center md-form form-sm mt-0 searchForm" style='display: none !important;' id='ddlSearchForm'>
                <i class="fas fa-search" aria-hidden="true"></i>
                <input class="form-control form-control-sm ml-3 w-75 searchBox" type="text" placeholder="Search table" id='ddlSearchInput' autocomplete='off'
                  aria-label="Search" onkeyup='searchTable()'>
              </form>

              <form class="form-inline d-flex justify-content-center md-form form-sm mt-0 searchForm" style='display: none !important;' id='summarySearchForm'>
                <i class="fas fa-search" aria-hidden="true"></i>
                <input class="form-control form-control-sm ml-3 w-75 searchBox" type="text" placeholder="Search table" id='summarySearchInput' autocomplete='off'
                  aria-label="Search" onkeyup='searchTable()'>
              </form>

              <span class="info-icon statusTooltip" data-toggle='tooltip' data-placement='bottom' title='tooltip on bottom'><i class="large material-icons">info</i></span>
              <span class="legend-icon statusTooltip" data-toggle='tooltip' data-placement='bottom' title='tooltip on bottom'>
                Status Legend
              </span>
            </div>
            
            <div class="tab-bg" id='tabBg'>
            <div class="tab-content"> 

                <div id="report" class="tab-pane fade show active">


                  <div class="accordion md-accordion" id="accordion" role="tablist" aria-multiselectable="true">
                    
                  </div>

                </div>

                <div id="ddl" class="tab-pane fade">
                    <div class="panel-group" id="ddl-accordion">
                      
                    </div> 
                </div>

                <div id="summary" class="tab-pane fade">
                    <div class="panel-group" id="summary-accordion">
                      
                    </div> 
                </div>

            </div>
                
            </div>
          </div>
        </div>


        <div class="modal" id="globalDataTypeModal" role="dialog" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header content-center">
              <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Review Data Type Mapping</h5>
              <i class="large material-icons close" data-dismiss="modal">cancel</i>
            </div>
            <div class="modal-body" style='margin: auto; margin-top: 20px;'>
      
              <div mdc-card class="dataMappingCard" id='globalDataType'>
                <!-- <table class="data-type-table">
                  <tr>
                    <th>Source</th>
                    <th>Spanner</th>
                  </tr>
      
                  <tr>
                    <td class="src-td">INT</td>
                    <td>
                      <div class="dropdown">
                          <a style="color: #222222; text-decoration: none;" aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" class="dropdown-toggle" href="javascript:void(0);">
                            <span id="selected1">INT64</span><span class="caret" style="float: right; margin-top: 8px;"></span></a>
                        <ul class="dropdown-menu menu1">
                          <li class='dataTypeDropdown'><a class="dataType" style="color: #222222; text-decoration: none;" href="javascript:void(0);">INT64</a></li>
                          <li class='dataTypeDropdown'><a class="dataType" href="javascript:void(0);">FLOAT64</a></li>
                          <li class='dataTypeDropdown'><a class="dataType" style="color: #222222; text-decoration: none;" href="javascript:void(0);">DOUBLE</a></li>
                          <li class='dataTypeDropdown'><a class="dataType" style="color: #222222; text-decoration: none;" href="javascript:void(0);">LONG</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
      
                  <tr>
                    <td class="src-td">VARCHAR</td>
                    <td>
                      <div class="dropdown">
                          <a style="color: #222222; text-decoration: none;" aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" class="dropdown-toggle" href="javascript:void(0);">
                            <span id="selected2">STRING</span><span class="caret" style="float: right; margin-top: 8px;"></span></a>
                        <ul class="dropdown-menu menu2">
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">STRING</a></li>  
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">VARCHAR</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
      
                  <tr>
                    <td class="src-td">FLOAT</td>
                    <td>
                      <div class="dropdown">
                          <a style="color: #222222; text-decoration: none;" aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" class="dropdown-toggle" href="javascript:void(0);">
                            <span id="selected3">FLOAT64</span><span class="caret" style="float: right; margin-top: 8px;"></span></a>
                        <ul class="dropdown-menu menu3">
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">FLOAT64</a></li>
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">INT64</a></li>
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">DOUBLE</a></li>
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">LONG</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
      
                  <tr>
                    <td class="src-td">DATETIME</td>
                    <td>
      
                      <div class="dropdown">
                          <a style="color: #222222; text-decoration: none;" aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" class="dropdown-toggle" href="javascript:void(0);">
                            <span id="selected4">TIMESTAMP</span><span class="caret" style="float: right; margin-top: 8px;"></span></a>
                        <ul class="dropdown-menu menu4">
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">TIMESTAMP</a></li>
                          <li class='dataTypeDropdown'><a style="color: #222222; text-decoration: none;" href="javascript:void(0);">DATETIME</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </table> -->
              </div>
              
            </div>
            <div class="modal-footer" style='margin-top: 20px;'>
              <!-- <button id="data-type-button" onclick="showSchemaAssessment()" class="connectButton" type="button" style='margin-right: 24px !important;'>Next</button> -->
              <button id="data-type-button" data-dismiss="modal" onclick="setGlobalDataType()" class="connectButton" type="button" style='margin-right: 24px !important;'>Next</button>
              <button class="buttonload" id="dataTypeLoaderButton" style="display: none;">
                    <i class="fa fa-circle-o-notch fa-spin"></i>converting
                </button>
            </div>
          </div>
      
        </div>


    </body>
    
    `)
    
}

