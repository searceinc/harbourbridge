function Tab(options) {
  const {
    css,
    id,
    href,
    dataToggle,
    role,
    ariaControl,
    ariaSelected,
    text,
    onClick,
  } = options;

  return `<li class=${css["li"]}>
                    <a class="${css["a"]}" id="${id}" data-toggle="${dataToggle}" href="${href}" role="${role}"
                        aria-controls="${ariaControl}" onclick="${onClick}('${id}')" aria-selected="${ariaSelected}">${text}</a>
                </li>`;
}

export default Tab;