import { router } from "./../../app.js";
/**
 * Function to initialise the tasks of edit schema screen
 *
 * @return {null}
 */
const initSchemaScreenTasks = () => {
  var reportAccCount = 0;
  var summaryAccCount = 0;
  var ddlAccCount = 0;
  jQuery(document).ready(() => {
    setActiveSelectedMenu("schemaScreen");
    $(".modal-backdrop").hide();
    jQuery(".collapse.reportCollapse").on("show.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").addClass("down");
        jQuery(this).closest(".card").find(".card-header .right-align").toggleClass("show-content hide-content");
        jQuery(this).closest(".card").find(".report-card-header").toggleClass("borderBottom rem-border-bottom");
        reportAccCount = reportAccCount + 1;
        document.getElementById("reportExpandButton").innerHTML ="Collapse All";
      }
    });
    jQuery(".collapse.reportCollapse").on("hide.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").removeClass("down");
        jQuery(this).closest(".card").find(".card-header .right-align").toggleClass("show-content hide-content");
        jQuery(this).closest(".card").find(".report-card-header").toggleClass("borderBottom rem-border-bottom");
        reportAccCount = reportAccCount - 1;
        if (reportAccCount === 0) {
          document.getElementById("reportExpandButton").innerHTML ="Expand All";
        }
      }
    });

    jQuery(".collapse.inner-summary-collapse").on(
      "show.bs.collapse",
      function (e) {
        if (!jQuery(this).closest("section").hasClass("template")) {
          e.stopPropagation();
        }
      }
    );
    jQuery(".collapse.inner-summary-collapse").on(
      "hide.bs.collapse",
      function (e) {
        if (!jQuery(this).closest("section").hasClass("template")) {
          e.stopPropagation();
        }
      }
    );

    jQuery(".collapse.fk-collapse").on("show.bs.collapse", function (e) {
      if (!jQuery(this).closest("section").hasClass("template")) {
        e.stopPropagation();
      }
    });
    jQuery(".collapse.fk-collapse").on("hide.bs.collapse", function (e) {
      if (!jQuery(this).closest("section").hasClass("template")) {
        e.stopPropagation();
      }
    });

    jQuery(".collapse.index-collapse").on("show.bs.collapse", function (e) {
      if (!jQuery(this).closest("section").hasClass("template")) {
        e.stopPropagation();
      }
    });
    jQuery(".collapse.index-collapse").on("hide.bs.collapse", function (e) {
      if (!jQuery(this).closest("section").hasClass("template")) {
        e.stopPropagation();
      }
    });

    jQuery(".collapse.ddlCollapse").on("show.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").addClass("down");
        jQuery(this).closest(".card").find(".ddl-card-header").toggleClass("ddl-border-bottom ddl-rem-border-bottom");
        ddlAccCount = ddlAccCount + 1;
        document.getElementById("ddlExpandButton").innerHTML = "Collapse All";
      }
    });
    jQuery(".collapse.ddlCollapse").on("hide.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").removeClass("down");
        jQuery(this).closest(".card").find(".ddl-card-header").toggleClass("ddl-border-bottom ddl-rem-border-bottom");
        ddlAccCount = ddlAccCount - 1;
        if (ddlAccCount === 0) {
          document.getElementById("ddlExpandButton").innerHTML = "Expand All";
        }
      }
    });

    jQuery(".collapse.summary-collapse").on("show.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").addClass("down");
        jQuery(this).closest(".card").find(".ddl-card-header").toggleClass("ddl-border-bottom ddl-rem-border-bottom");
        summaryAccCount = summaryAccCount + 1;
        document.getElementById("summaryExpandButton").innerHTML ="Collapse All";
      }
    });
    jQuery(".collapse.summary-collapse").on("hide.bs.collapse", function () {
      if (!jQuery(this).closest("section").hasClass("template")) {
        jQuery(this).closest(".card").find(".rotate-icon").removeClass("down");
        jQuery(this).closest(".card").find(".ddl-card-header").toggleClass("ddl-border-bottom ddl-rem-border-bottom");
        summaryAccCount = summaryAccCount - 1;
        if (summaryAccCount === 0) {
          document.getElementById("summaryExpandButton").innerHTML =
            "Expand All";
        }
      }
    });

    // jQuery('.collapse').on('show.bs.collapse hide.bs.collapse', function () {
    //   jQuery(this).closest('.card').find('.card-header .right-align').toggleClass('show-content hide-content');
    //   jQuery(this).closest('.card').find('.report-card-header').toggleClass('borderBottom remBorderBottom');
    //   jQuery(this).closest('.card').find('.ddl-card-header').toggleClass('ddlBorderBottom ddlRemBorderBottom');
    // });
  });
};

/**
 * Function to implement search functionality in all the tabs of edit schema screen
 *
 * @param {string} tabId html id attriute for report, ddl or summary tabs
 * @return {null}
 */
function searchTable() {
  let searchInput, searchInputFilter, tableVal, list, listElem, elem;
  let schemaConversionObj = JSON.parse(
    localStorage.getItem("conversionReportContent")
  );
  let flag = false;

  elem = document.getElementById("tabBg");

  if (elem) {
    elem.appendChild(notFoundTxt);
  }
  notFoundTxt.style.display = "none";
  searchInput = document.getElementById("searchText");
  if (searchInput) {
    searchInputFilter = searchInput.value.toUpperCase();
  }
  console.log(tableListArea);
  list = document.getElementById(tableListArea);
  console.log(list);
  if (list) {
    list.style.display = "";
  }
  listElem = list.getElementsByTagName("section");
  let tableListLength = Object.keys(schemaConversionObj.SpSchema).length;
  for (var i = 0; i < tableListLength; i++) {
    tableVal = Object.keys(schemaConversionObj.SpSchema)[i];
    if(tableVal.toUpperCase().indexOf(searchInputFilter) > -1) {
      listElem[i + 1].style.display = "";
      flag = true;
    } else {
      listElem[i + 1].style.display = "none";
    }
  }
  if (flag === false) {
    notFoundTxt.style.display = "";
    list.style.display = "none";
  }
};

/**
 * Function to call set data type api
 *
 * @return {null}
 */
const setGlobalDataType = async () => {
  let globalDataTypeList = JSON.parse(
    localStorage.getItem("globalDataTypeList")
  );
  let dataTypeListLength = Object.keys(globalDataTypeList).length;
  let dataTypeJson = {};
  for (var i = 0; i <= dataTypeListLength; i++) {
    var row = document.getElementById("dataTypeRow" + i);
    if (row) {
      var cells = row.getElementsByTagName("td");
      if (document.getElementById("dataTypeOption" + i) != null) {
        for (var j = 0; j < cells.length; j++) {
          if (j === 0) {
            var key = cells[j].innerText;
          } else {
            dataTypeJson[key] = document.getElementById(
              "dataTypeOption" + i
            ).value;
          }
        }
      }
    }
  }
  await fetch("/typemap/global", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataTypeJson),
  }).then(async function (res) {
    res = await res.text();
    localStorage.setItem("conversionReportContent", res);
    await ddlSummaryAndConversionApiCall();
    router();
  });
};

/**
 * Function to download schema report
 *
 * @return {null}
 */
const downloadSession = async () => {
  jQuery("<a />", {
    download: "session.json",
    href:"data:application/json;charset=utf-8," +
      encodeURIComponent(
        localStorage.getItem("conversionReportContent"),null,4),
  })
    .appendTo("body")
    .click(function () {
jQuery(this).remove();
    })[0]
    .click();
};

/**
 * Function to download ddl statements
 *
 * @return {null}
 */
const downloadDdl = async () => {
  await fetch("/schema")
    .then(async function (response) {
      if (response.ok) {
        await response.text().then(function (result) {
          localStorage.setItem("schemaFilePath", result);
        });
      } else {
        Promise.reject(response);
      }
    })
    .catch(function (err) {
      showSnackbar(err, " red-bg");
    });
  let schemaFilePath = localStorage.getItem("schemaFilePath");
  let schemaFileName = schemaFilePath.split("/")[
    schemaFilePath.split("/").length - 1
  ];
  let filePath = "./" + schemaFileName;
  readTextFile(filePath, function (error, text) {
    jQuery("<a />", {
      download: schemaFileName,
      href: "data:application/json;charset=utf-8," + encodeURIComponent(text),
    })
      .appendTo("body")
      .click(function () {
        jQuery(this).remove();
      })[0]
      .click();
  });
};

/**
 * Function to download summary report
 *
 * @return {null}
 */
const downloadReport = async () => {
  await fetch("/report")
    .then(async function (response) {
      if (response.ok) {
        await response.text().then(function (result) {
          localStorage.setItem("reportFilePath", result);
        });
      } else {
        Promise.reject(response);
      }
    })
    .catch(function (err) {
      showSnackbar(err, " red-bg");
    });
  let reportFilePath = localStorage.getItem("reportFilePath");
  let reportFileName = reportFilePath.split("/")[
    reportFilePath.split("/").length - 1
  ];
  let filePath = "./" + reportFileName;
  readTextFile(filePath, function (error, text) {
    jQuery("<a />", {
      download: reportFileName,
      href: "data:application/json;charset=utf-8," + encodeURIComponent(text),
    })
      .appendTo("body")
      .click(function () {
        jQuery(this).remove();
      })[0]
      .click();
  });
};

/**
 * Function to handle click event on expand all button of report tab
 *
 * @return {null}
 */
const reportExpandHandler = (event) => {
  if (event[0].innerText === "Expand All") {
    event[0].innerText = "Collapse All";
    jQuery(".reportCollapse").collapse("show");
  } else {
    event[0].innerText = "Expand All";
    jQuery(".reportCollapse").collapse("hide");
  }
};

/**
 * Function to handle click event on expand all button of ddl tab
 *
 * @return {null}
 */
const ddlExpandHandler = (event) => {
  if (event[0].innerText === "Expand All") {
    event[0].innerText = "Collapse All";
    jQuery(".ddlCollapse").collapse("show");
  } else {
    event[0].innerText = "Expand All";
    jQuery(".ddlCollapse").collapse("hide");
  }
};

/**
 * Function to handle click event on expand all button of summary tab
 *
 * @return {null}
 */
const summaryExpandHandler = (event) => {
  if (event[0].innerText === "Expand All") {
    event[0].innerText = "Collapse All";
    jQuery(".summary-collapse").collapse("show");
  } else {
    event[0].innerText = "Expand All";
    jQuery(".summary-collapse").collapse("hide");
  }
};

/**
 * Function to handle click event on edit global data type button of report tab
 *
 * @return {null}
 */
const globalEditHandler = () => {
  createEditDataTypeTable();
  jQuery("#globalDataTypeModal").modal();
};

/**
 * Function to make an api call to get global data type list
 *
 * @return {null}
 */
const getGlobalDataTypeList = () => {
  fetch("/typemap", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then(function (res) {
      if (res.ok) {
        res.json().then(function (result) {
          localStorage.setItem("globalDataTypeList", JSON.stringify(result));
        });
      } else {
        return Promise.reject(res);
      }
    })
    .catch(function (err) {
      showSnackbar(err, " red-bg");
    });
};

/**
 * Function to create global edit data type table
 *
 * @return {null}
 */
const createEditDataTypeTable = () => {
  let globalDataTypeList = JSON.parse(
    localStorage.getItem("globalDataTypeList")
  );
  let dataTypeListLength = Object.keys(globalDataTypeList).length;
  for (var i = 0; i < dataTypeListLength; i++) {
    if (document.getElementById("dataTypeRow" + (i + 1)) !== null) {
      break;
    }
    if (globalDataTypeList[Object.keys(globalDataTypeList)[i]] !== null) {
      let $dataTypeOption;
      let $dataTypeRow = jQuery("#globalDataTypeTable")
        .find(".globalDataTypeRow.template")
        .clone()
        .removeClass("template");
      $dataTypeRow.attr("id", "dataTypeRow" + (i + 1));
      for (var j = 0; j < 2; j++) {
        if (j === 0) {
          $dataTypeRow.find(".src-td").attr("id", "dataTypeKey" + (i + 1));
          $dataTypeRow.find(".src-td").html(Object.keys(globalDataTypeList)[i]);
        } else if (j === 1) {
          $dataTypeRow
            .find("#globalDataTypeCell")
            .attr("id", "dataTypeVal" + (i + 1));
          let optionsLength =
            globalDataTypeList[Object.keys(globalDataTypeList)[i]].length;
          if (
            globalDataTypeList[Object.keys(globalDataTypeList)[i]][0].Brief !==
            ""
          ) {
            $dataTypeRow.find("i").attr("data-toggle", "tooltip");
            $dataTypeRow.find("i").attr("data-placement", "bottom");
            $dataTypeRow
              .find("i")
              .attr(
                "title",
                globalDataTypeList[Object.keys(globalDataTypeList)[i]][0].Brief
              );
          } else {
            $dataTypeRow.find("i").css("visibility", "hidden");
          }
          $dataTypeRow.find("select").attr("id", "dataTypeOption" + (i + 1));
          for (var k = 0; k < optionsLength; k++) {
            $dataTypeOption = $dataTypeRow
              .find(".dataTypeOption.template")
              .clone()
              .removeClass("template");
            $dataTypeOption.attr(
              "value",
              globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].T
            );
            $dataTypeOption.html(
              globalDataTypeList[Object.keys(globalDataTypeList)[i]][k].T
            );
            $dataTypeOption.appendTo($dataTypeRow.find("select"));
          }
        }
      }
      $dataTypeRow.find("select").find("option").eq(0).remove();
      $dataTypeRow
        .find("#dataTypeOption" + (i + 1))
        .unbind("change")
        .bind("change", function () {
          dataTypeUpdate(jQuery(this).attr("id"), globalDataTypeList);
        });
      $dataTypeRow.appendTo(jQuery("#globalDataTypeTable"));
    }
  }
  tooltipHandler();
};

/**
 * Function to update data types with warnings(if any) in global data type table
 *
 * @param {string} id id of select box in global data type table
 * @param {list} globalDataTypeList list for source and spanner global data types
 * @return {null}
 */
const dataTypeUpdate = (id, globalDataTypeList) => {
  let idNum = parseInt(id.match(/\d+/), 10);
  let dataTypeOptionArray =
    globalDataTypeList[
    document.getElementById("dataTypeKey" + idNum).innerHTML
    ];
  let optionFound;
  let length = dataTypeOptionArray.length;
  let $dataTypeSel = jQuery(".globalDataTypeRow.template").clone();
  $dataTypeSel.find(".src-td").attr("id", "dataTypeKey" + idNum);
  $dataTypeSel.find(".src-td").html(Object.keys(globalDataTypeList)[idNum - 1]);
  $dataTypeSel.find("i").css("visibility", "hidden");
  for (var x = 0; x < length; x++) {
    let $dataTypeOption = $dataTypeSel
      .find(".dataTypeOption.template")
      .clone()
      .removeClass("template");
    optionFound =
      dataTypeOptionArray[x].T === document.getElementById(id).value;
    if (
      dataTypeOptionArray[x].T === document.getElementById(id).value &&
      dataTypeOptionArray[x].Brief !== ""
    ) {
      $dataTypeSel.find("i").attr("data-toggle", "tooltip");
      $dataTypeSel.find("i").attr("data-placement", "bottom");
      $dataTypeSel.find("i").attr("title", dataTypeOptionArray[x].Brief);
      $dataTypeSel.find("i").css("visibility", "");
    }
    if (optionFound === true) {
      $dataTypeOption.attr("value", dataTypeOptionArray[x].T);
      $dataTypeOption.html(dataTypeOptionArray[x].T);
      $dataTypeOption.attr("selected", "selected");
    } else {
      $dataTypeOption.attr("value", dataTypeOptionArray[x].T);
      $dataTypeOption.html(dataTypeOptionArray[x].T);
    }
    $dataTypeOption.appendTo($dataTypeSel.find("select"));
  }
  $dataTypeSel.find("select").find("option").eq(0).remove();
  $dataTypeSel.find("select").attr("id", id);
  jQuery(this)
    .unbind("change")
    .bind("change", function () {
      dataTypeUpdate(id, globalDataTypeList);
    });
  jQuery("#dataTypeRow" + idNum).html($dataTypeSel.html());
  tooltipHandler();
};

/**
 * Function to render html for edit schema screen
 *
 * @return {null}
 */
const schemaReport = () => {
  jQuery("#app").load(
    "app/view/schema-conversion/schema-conversion-screen.html"
  );
};

export {
  schemaReport,
  getGlobalDataTypeList,
  downloadSession,
  reportExpandHandler,
  ddlExpandHandler,
  summaryExpandHandler,
  initSchemaScreenTasks,
  searchTable,
  setGlobalDataType,
  downloadDdl,
  downloadReport,
  globalEditHandler,
};