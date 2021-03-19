export default tabsdata = [
    {
      css: { li: "nav-item", a: "nav-link active" },
      id: "reportTab",
      href: "#report",
      text: "Conversion Report",
      dataToggle:"tab",
      role:"tab",
      onClick :'findTab(this.id)',
      ariaSelected:true,
      ariaControl:'report'
    },
    {
      css: { li: "nav-item", a: "nav-link" },
      id: "ddlTab",
      href: "#ddl",
      text: "DDL Statements",
      dataToggle:"tab",
      role:"",
      onClick :'findTab(this.id)',
      ariaSelected:false,
      ariaControl:'summary'
    },
    {
      css: { li: "nav-item", a: "nav-link" },
      id: "summaryTab",
      href:"#summary",
      text: "summary",
      dataToggle:"tab",
      role:"tab",
      onClick :'findTab(this.id)',
      ariaSelected:false,
      ariaControl:'summary'
    }
  ];

