/* eslint-disable */
import { getAEMHeadlessClient } from '../../scripts/scripts.js';
import { getConfigValue } from '../../scripts/configs.js';

export default async function decorate(block) {
  let AEM_HOST = '';
  let AEM_GRAPHQL_ENDPOINT = '';
  let query = '';
  let activity = '';
  let slugs = [];
  let matchedItems = [];
  let cards = [];
  const cardsContainer = block.parentNode.parentNode;

  // Extract information from div elements
  const divElements = block.querySelectorAll('div');
  for (let i = 0; i < divElements.length; i++) {
    const divElement = divElements[i];
    const nextElement = divElements[i + 1];
    const textContent = divElement.textContent.trim().toLowerCase();
  
    if (textContent === 'query' && nextElement) {
      query = nextElement.textContent.trim();
    }
  
    if (textContent === 'activity' && nextElement) {
      activity = nextElement.textContent.trim();
    }

    if (textContent === 'slugs' && nextElement) {
      slugs = nextElement.textContent.replace(/\s+/g, '').split(',');
    }
  }
  block.innerHTML = '';

  try {
    AEM_HOST = await getConfigValue('aem-host');
    AEM_GRAPHQL_ENDPOINT = await getConfigValue('aem-graphql-endpoint');
    const client = await getAEMHeadlessClient(AEM_HOST);

    let dataObj = {};

    if (activity) {
      dataObj = await client.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query, { activity: activity });
    } else {
      dataObj = await client.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query);
    }
    const data = dataObj?.data?.adventureList?.items;

    // Filter data based on provided slugs or default to first 4 items
    if (slugs.length > 0) {
      matchedItems = data.filter((item) => slugs.includes(item.slug));
      cards = matchedItems;
    } else {
      cards = data.slice(0, 4);
    }

    // Use document fragment to minimize DOM manipulation
    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
      const createdCard = document.createElement('a');
      createdCard.classList.add('article-card');
      createdCard.href = `/adventures/${card.slug}`;
      createdCard.innerHTML = `
        <div class="card-image">
          <picture>
            <img loading="lazy" alt="${card.activity}" srcset="/images/adventures/${card.slug}.jpg" width="200" height="150">
          </picture>
        </div>
        <div class="card-info">
          <p>${card.title}</p>
          <span>${card.tripLength}</span>
        </div>
      `;
      fragment.appendChild(createdCard);
    });

    block.appendChild(fragment);

    // Update button to use themed color button
    const sectionLink = cardsContainer.querySelector('.button-container > a');
    sectionLink.classList.remove('button');
    sectionLink.classList.add('button-secondary');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
