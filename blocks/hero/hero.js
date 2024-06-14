/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */

export default async function decorate(block) {
  // Target the third child div to add button-primary class
  const div = block.children[2];
  const btnContainer = div.querySelector('.button-container');
  btnContainer.querySelector('a').classList.add('button-primary');
}
