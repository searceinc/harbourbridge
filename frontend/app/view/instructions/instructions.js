/**
 * Function to render instructions screen html
 *
 * @return {null}
 */
const renderInstructionsHtml = () => {
  setActiveSelectedMenu('instructions');
  $(".modal-backdrop").hide();
  jQuery('#app').load('./app/view/instructions/instructions.html');
}