const tabs = [
  {
    css: { li: "nav-item", a: "nav-link active" },
    id: "reportTab",
    href: "#report",
    onClick: "findTab",
    text: "Conversion Report",
    dataToggle: "tab",
    role: "tab",
    ariaControl: "report",
    ariaSelected: "false",
  },
  {
    css: { li: "nav-item", a: "nav-link" },
    id: "ddlTab",
    href: "#ddl",
    onClick: "findTab",
    text: "DDL Statements",
    dataToggle: "tab",
    role: "tab",
    ariaControl: "ddl",
    ariaSelected: "true",
  },
  {
    css: { li: "nav-item", a: "nav-link" },
    id: "summaryTab",
    href: "#summary",
    onClick: "findTab",
    text: "Summary Report",
    dataToggle: "tab",
    role: "tab",
    ariaControl: "summary",
    ariaSelected: "false",
  },
];

export default tabs;
