function Search(selector, fn) {

    document.querySelector(
      selector
    ).innerHTML = `<form class="form-inline d-flex justify-content-center md-form form-sm mt-0 search-form" id='reportSearchForm'>
      <i class="fas fa-search" aria-hidden="true"></i>
      <input class="form-control form-control-sm ml-3 w-75 search-box" type="text" placeholder="Search table"
          autocomplete='off' aria-label="Search" id="searchText" onkeyup="${fn}()"> 
          </form>`;
  }
  