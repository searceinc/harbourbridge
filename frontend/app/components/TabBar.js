import Tab from './Tab.js'
import tabList from '../config/schema-conversion-tab-config.js'
function TabBar(selector) {
    const element = document.querySelector(selector);
    element.innerHTML = tabList.map((currentTab) => Tab(currentTab)).join("");
  }
  
  export default TabBar;
  