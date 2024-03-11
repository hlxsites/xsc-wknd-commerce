/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const imageEl = block.querySelector('img');
  imageEl.setAttribute('loading', 'eager');

  // Target the second child div
  const secondChildDiv = block.children[0];
  [...secondChildDiv.children].forEach((child) => {
    const pictureElement = child.querySelector('picture');

    if (pictureElement) {
      child.className = 'hero-image';
    } else {
      child.className = 'hero-desc-wrapper';
      const buttonLink = child.querySelector('.button-container a');
      buttonLink?.classList.remove('button', 'button-primary');
      buttonLink?.classList.add('button-primary');
    }

    child.querySelectorAll('img').forEach((img) => {
      img.closest('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
      );
    });
  });
}
