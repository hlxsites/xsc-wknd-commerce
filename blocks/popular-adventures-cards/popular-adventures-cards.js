export default async function decorate(block) {
  [...block.children].forEach((childDiv) => {
    let href = '';
    const firstDiv = childDiv.querySelector('div:first-child');
    const secondDiv = childDiv.querySelector('div:nth-child(2)');
    firstDiv.className = 'card-image';
    secondDiv.className = 'card-info';

    // Get the text content from the existing elements
    const title = secondDiv.querySelector('a').textContent;
    const duration = secondDiv.querySelector('p:nth-of-type(2)').textContent;
    href = secondDiv.querySelector('a').href;

    // Create new elements
    const newTitleElement = document.createElement('p');
    const newDurationElement = document.createElement('span');

    // Set text content for the new elements
    newTitleElement.textContent = title;
    newDurationElement.textContent = duration.replace(/,/g, ' •');

    // Update the structure
    secondDiv.innerHTML = '';
    secondDiv.appendChild(newTitleElement);
    secondDiv.appendChild(newDurationElement);

    // Create a new <a> element
    const linkElement = document.createElement('a');
    linkElement.classList.add('article-card');
    linkElement.href = href;

    while (childDiv.firstChild) {
      linkElement.appendChild(childDiv.firstChild);
    }

    childDiv.parentNode.replaceChild(linkElement, childDiv);
  });

  // Update button to use themed color button
  const cardsContainer = block.parentNode.parentNode;
  const sectionLink = cardsContainer.querySelector('.button-container > a');
  sectionLink.classList.remove('button');
  sectionLink.classList.add('button-secondary');
}
