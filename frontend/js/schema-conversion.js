var notFoundTxt = document.createElement('h5');
notFoundTxt.innerHTML = `No Match Found`;
notFoundTxt.className = 'noText';
notFoundTxt.style.display = 'none';
var reportAccCount = 0;
var summaryAccCount = 0;
var ddlAccCount = 0;
var tableListArea = 'accordion';

/**
 * Function to initialise the tasks of edit schema screen
 *
 * @return {null}
 */
const initTasks = () => {
  jQuery(document).ready(() => {
    jQuery('.reportCollapse').on('show.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      reportAccCount = reportAccCount + 1;
      document.getElementById('reportExpandButton').innerHTML = 'Collapse All';
    });

    jQuery('.reportCollapse').on('hide.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      reportAccCount = reportAccCount - 1;
      if (reportAccCount === 0) {
        document.getElementById('reportExpandButton').innerHTML = 'Expand All';
      }
    });

    jQuery('.ddlCollapse').on('show.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      ddlAccCount = ddlAccCount + 1;
      document.getElementById('ddlExpandButton').innerHTML = 'Collapse All';
    })

    jQuery('.ddlCollapse').on('hide.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      ddlAccCount = ddlAccCount - 1;
      if (ddlAccCount === 0) {
        document.getElementById('ddlExpandButton').innerHTML = 'Expand All';
      }
    })

    jQuery('.summaryCollapse').on('show.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      summaryAccCount = summaryAccCount + 1;
      document.getElementById('summaryExpandButton').innerHTML = 'Collapse All';
    })

    jQuery('.summaryCollapse').on('hide.bs.collapse', function() {
      jQuery(this).closest('.card').find('.rotate-icon').toggleClass('down');
      summaryAccCount = summaryAccCount - 1;
      if (summaryAccCount === 0) {
        document.getElementById('summaryExpandButton').innerHTML = 'Expand All';
      }
    })

    jQuery('.collapse').on('show.bs.collapse hide.bs.collapse', function() {
      jQuery(this).closest('.card').find('.card-header .right-align').toggleClass('show-content hide-content');
      jQuery(this).closest('.card').find('.report-card-header').toggleClass('borderBottom remBorderBottom');
      jQuery(this).closest('.card').find('.ddl-card-header').toggleClass('ddlBorderBottom ddlRemBorderBottom');
    });
  });
}

/**
 * Function for calling initTasks and html functions for edit schema screen
 *
 * @param {any} params
 * @return {Function}
 */
const schemaReport = () => {
  initTasks();
  return renderSchemaReportHtml();
}

/**
 * Function to implement search functionality in all the tabs of edit schema screen
 *
 * @return {null}
 */
const searchTable = (tabId) => {
  var searchInput, searchInputFilter, i, tableVal, list, listElem, flag, elem;
  elem = document.getElementById('tabBg');
  elem.appendChild(notFoundTxt);
  flag = false
  searchInput = document.getElementById(tabId);
  searchInputFilter = searchInput.value.toUpperCase();
  list = document.getElementById(tableListArea);
  list.style.display = '';
  listElem = list.getElementsByTagName('area');
  tableListLength = Object.keys(schemaConversionObj.SpSchema).length;
  for (i = 0; i < Object.keys(schemaConversionObj.SpSchema).length; i++) {
    tableVal = Object.keys(schemaConversionObj.SpSchema)[i];
    if (tableVal.toUpperCase().indexOf(searchInputFilter) > -1) {
      listElem[i].style.display = '';
      flag = true;
    }
    else {
      listElem[i].style.display = 'none';
    }
  }

  if (flag === false) {
    notFoundTxt.style.display = '';
    list.style.display = 'none';
  }

}

/**
 * Function to call set data type api
 *
 * @return {null}
 */
const setGlobalDataType = () => {
  var dataTypeJson = {};
  var tableLen = jQuery('#globalDataType tr').length;
  for (var i = 1; i < tableLen; i++) {
    var row = document.getElementById('dataTypeRow' + i);
    var cells = row.getElementsByTagName('td');
    if (document.getElementById('dataTypeOption' + i) != null) {
      for (var j = 0; j < cells.length; j++) {
        if (j === 0) {
          var key = cells[j].innerText;
        }
        else {
          dataTypeJson[key] = document.getElementById('dataTypeOption' + i).value;
        }
      }
    }
  }
  fetch(apiUrl + '/typemap/global', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataTypeJson)
  })
    .then(function (res) {
      res.json().then(async function (response) {
        localStorage.setItem('conversionReportContent', JSON.stringify(response));
        await ddlSummaryAndConversionApiCall();
        const { component = ErrorComponent } = findComponentByPath(location.hash.slice(1).toLowerCase() || '/', routes) || {};
        document.getElementById('app').innerHTML = component.render();
        showSchemaConversionReportContent(null);
      });
    })
}

/**
 * Function to render edit schema screen html
 *
 * @return {html}
 */
const renderSchemaReportHtml = () => {
  currentLocation = "#" + location.hash.slice(1).toLowerCase() || '/';
  return (`
        <header class="main-header">
          <nav class="navbar navbar-static-top">
            <img src="Icons/Icons/google-spanner-logo.png" class="logo">
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic" style="margin-right: 30px;"><a href='/frontend/' style="text-decoration: none; color: #5E5752;">Home</a></div>
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic" style="margin-right: 30px; text-decoration: none; color: #4285f4;"><a href=${currentLocation}>Schema Conversion</a>
            </div>
          </nav>
        
          <nav class="navbar navbar-static-top">
            <div class="header-topic"><a href="#/instructions" style="text-decoration: none; color: #5E5752;">Instructions</a></div>
          </nav>
        
        </header>

        <div id="snackbar"></div>

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
                  aria-label="Search" onkeyup='searchTable("reportSearchInput")' id='reportSearchInput'>
              </form>

              <form class="form-inline d-flex justify-content-center md-form form-sm mt-0 searchForm" style='display: none !important;' id='ddlSearchForm'>
                <i class="fas fa-search" aria-hidden="true"></i>
                <input class="form-control form-control-sm ml-3 w-75 searchBox" type="text" placeholder="Search table" id='ddlSearchInput' autocomplete='off'
                  aria-label="Search" onkeyup='searchTable("ddlSearchInput")'>
              </form>

              <form class="form-inline d-flex justify-content-center md-form form-sm mt-0 searchForm" style='display: none !important;' id='summarySearchForm'>
                <i class="fas fa-search" aria-hidden="true"></i>
                <input class="form-control form-control-sm ml-3 w-75 searchBox" type="text" placeholder="Search table" id='summarySearchInput' autocomplete='off'
                  aria-label="Search" onkeyup='searchTable("summarySearchInput")'>
              </form>

              <!-- <span class="info-icon statusTooltip" data-title='Excellent &nbsp;&nbsp; Good &nbsp;&nbsp; Poor' data-placement='bottom' style='cursor: pointer;'><i class="large material-icons">info</i></span>
                <span class="legend-icon statusTooltip" data-title='Excellent &nbsp;&nbsp; Good &nbsp;&nbsp; Poor' data-placement='bottom' style='cursor: pointer;'>
                  Status Legend
                </span> -->

              <section class="cus-tip">
                <span  class="cus-a info-icon statusTooltip"><i class="large material-icons">info</i><span class="legend-icon statusTooltip" style='cursor: pointer;display: inline-block;vertical-align: super;'>Status&nbsp;&nbsp;Legend</span></span>
                <div class="legend-hover">
                    <div class="legend-status">
                      <span class="excellent"></span>
                      Excellent
                    </div>
                    <div class="legend-status"> 
                      <span class="good"></span>
                      Good
                    </div>
                    <div class="legend-status">
                      <span class="poor"></span>
                      Poor
                    </div>
                </div>
              </section>


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
              <h5 class="modal-title modal-bg" id="exampleModalLongTitle">Global Data Type Mapping</h5>
              <i class="large material-icons close" data-dismiss="modal">cancel</i>
            </div>
            <div class="modal-body" style='margin: auto; margin-top: 20px;'>
      
              <div class="dataMappingCard" id='globalDataType'>
                
              </div>
              
            </div>
            <div class="modal-footer" style='margin-top: 20px;'>
              <button id="data-type-button" data-dismiss="modal" onclick="setGlobalDataType()" class="connectButton" type="button" style='margin-right: 24px !important;'>Next</button>
              <button class="buttonload" id="dataTypeLoaderButton" style="display: none;">
                  <i class="fa fa-circle-o-notch fa-spin"></i>converting
              </button>
            </div>
          </div>
      
        </div>    
    `)

}

