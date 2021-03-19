import navLinks from "./../config/header-config.js";

function Header(selector) {
  const { logo, links } = navLinks;

  const logoTemplate = `<nav class="${logo.css.nav}">
                    <img src="${logo.img.src}" class="${logo.css.img}">
                    </nav>`;
  document.querySelector(selector).innerHTML =
    logoTemplate + links.map((link) => NavLinkTemplate(link)).join("");
}

function NavLinkTemplate(link) {

  return `
            <nav class="navbar navbar-static-top">
            <div class="header-topic">
                <a name='${link.name}' href="${link.href}" onclick="${link.onClick}()" id="${link.aTagId}" class='inactive'
                style="cursor: pointer;">${link.text}</a>
            </div>
            </nav>
            `;
}

export default Header;

Header('#header-component');
