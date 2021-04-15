import Fetch from "./Fetch.service.js";
import Actions from "./Action.service.js";

const DEFAULT_INSTANCE = {
  currentMainPageModal: null,
};

const Store = (function () {
    let schemaConversionObj = JSON.parse(
      localStorage.getItem("conversionReportContent")
    );
    let tableNameArrayLength = Object.keys(schemaConversionObj.SpSchema).length;
  
    let reportArr = [];
    let ddlArr = [];
    let summaryArr = [];
    for(let i=0; i<tableNameArrayLength; i++){
      reportArr.push(false)
      ddlArr.push(false)
      summaryArr.push(false)
    }
    var instance = {
        collapseStatus:{
            report: reportArr,
            ddl: ddlArr,
            summary :summaryArr
    }};
    let modalId = "connectToDbModal"
   

  return {
    getinstance: function () {
      return instance;
    },

    // Other store manipulator functions here
    // may be later can be moved to actions and stiched to affect the store
    addAttrToStore: () => {
      if (!instance) {
        return;
      }
      instance = { ...instance, something: "of value" };
    },
    toggleStore: () => {
      if (!instance) {
        return;
      }
      let openVal = instance.open;
      if (instance.open === "no") {
        openVal = "yes";
      } else {
        openVal = "no";
      }
      instance = { ...instance, open: openVal };
    },
    setCurrentModal: (currentModal) => {
      instance = { ...instance, open: openVal };
    },
    updateSchemaScreen: async (tableData) => {
      localStorage.setItem("conversionReportContent", tableData);
      await Actions.ddlSummaryAndConversionApiCall();
      instance = { ...instance, tableData, saveSchemaId: Math.random() };
    },
    openCollapse:(tableId,tableIndex) => {
        instance.collapseStatus[`${tableId}`][tableIndex]=true;
    },
    closeCollapse:(tableId,tableIndex) => {
      instance.collapseStatus[`${tableId}`][tableIndex]=false;
    },
  };
})();

export default Store;
