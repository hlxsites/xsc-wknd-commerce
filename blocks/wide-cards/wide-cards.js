export default function decorate(block) {
  const link = block.querySelector('a.button');
  let data = [];

  function isJsonFile(str) {
    return str.endsWith('.json');
  }

  function modifyHTML() {
    block.innerHTML = '';

    data.forEach((item) => {
      const createdCard = document.createElement('div');
      createdCard.classList.add('wide-card');
      createdCard.innerHTML = `
        <div class="card-image">
          <img loading="lazy" alt="" src="${item.image}" width="" height="">
        </div>
        <div class="card-info">
          <h2>${item.name}</h2>
          <p>${item.description}</p>
          <p class="button-container"><a href="${item.cta}" title="View trips" class="custom-link">View trips</a></p>
        </div>
      `;
      block.append(createdCard);
    });
  }

  function buildBlock() {
    [...block.children].forEach((cardDiv) => {
      cardDiv.classList.add('wide-card');
      [...cardDiv.children].forEach((childDiv) => {
        const hasPictureElement = childDiv.querySelector('picture');
        if (hasPictureElement) {
          childDiv.classList.add('card-image');
        } else {
          childDiv.classList.add('card-info');
          const linkEl = childDiv.querySelector('a');
          linkEl.classList.remove('button');
          linkEl.classList.add('custom-link');
        }
      });
    });
  }

  async function initialize() {
    const dataIsJSON = isJsonFile(link.href);

    if (dataIsJSON) {
      const response = await fetch(link.href);

      if (response.ok) {
        const jsonData = await response.json();
        data = jsonData?.top?.data;
        modifyHTML();
      }
    } else {
      buildBlock();
    }
  }

  initialize();
}
