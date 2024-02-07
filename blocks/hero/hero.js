/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const firstChildDiv = block.querySelector('div > div[data-align="right"]');
  const secondChildDiv = block.querySelector('div > div:nth-child(2)');
  const imageEl = firstChildDiv?.querySelector('img');

  firstChildDiv?.classList.add('hero-image');
  imageEl.removeAttribute('loading');

  if (secondChildDiv) {
    secondChildDiv.classList.add('hero-desc-wrapper');
    const buttonLink = secondChildDiv.querySelector('.button-container a');
    buttonLink?.classList.remove('button', 'button-primary');
    buttonLink?.classList.add('button-primary');
  }
}
