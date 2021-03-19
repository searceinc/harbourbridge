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

// const funnctions = {
//   add:(num1, num2) => num1 + num2
// }

// module.exports ={ funnctions};