function Tab(options) {
    const {
      css,
      id,
      dataToggle,
      href,
      role,
      ariaControl,
      ariaSelected,
      text,
      onClick 
    } = options;
    console.log(id);
  
    return `<li class=${css["li"]}>
                      <a class="${css["a"]}" id="${id}" data-toggle="${dataToggle}" href="${href}" role="${role}"
                          aria-controls="${ariaControl}" onclick="(${onClick})('${id}')" aria-selected="${ariaSelected}">${text}</a>
                  </li>`;
  }

function TabBar(selector){
const element = document.querySelector(selector);

  const tabs = [
    {
      css: { li: "nav-item", a: "nav-link active" },
      id: "reportTab",
      href: "#report",
      text: "Conversion Report",
      dataToggle:"tab",
      role:"tab",
      onClick :'findTab',
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
      onClick :'findTab',
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
      onClick :'findTab',
      ariaSelected:false,
      ariaControl:'summary'
    }
  ];

  element.innerHTML = tabs.map((currentTab) => Tab(currentTab)).join("");
}