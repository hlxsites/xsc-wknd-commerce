/* eslint-disable */
import { getAEMHeadlessClient } from '../../scripts/scripts.js';
import { getConfigValue } from '../../scripts/configs.js';

export default function decorate(block) {
  const container = block.parentNode.parentNode;
  const query = container.getAttribute('data-query');
  const maxCardsCount = parseInt(container.getAttribute('data-limit'));
  const activity = container.getAttribute('data-activity');
  const blockEl = container.querySelector('.cards.block');
  let AEM_HOST;
  let AEM_GRAPHQL_ENDPOINT;

  async function getData() {
    AEM_HOST = await getConfigValue('aem-host');
    AEM_GRAPHQL_ENDPOINT = await getConfigValue('aem-graphql-endpoint');
    const client = await getAEMHeadlessClient(AEM_HOST);

    let dataObj = {};

    if (activity) {
      dataObj = await client.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query, { activity: activity });
    } else {
      dataObj = await client.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query);
    }

    const cardData = dataObj.data.adventureList.items.slice(0, maxCardsCount);
    blockEl.innerHTML = '';
    [...cardData].forEach((card) => {
      const createdCard = document.createElement('a');
      createdCard.classList.add('article-card');
      createdCard.href = `/adventures/${card.slug}`;
      createdCard.innerHTML = `
        <div class="card-image">
          <picture>
            <img loading="lazy" alt="${card.activity}" srcset="${card.primaryImage._publishUrl}" width="200" height="150">
          </picture>
          </div>
        <div class="card-info">
          <p>${card.title}</p>
          <span>${card.tripLength}</span>
        </div>
      `;
      blockEl.append(createdCard);
    });
  }

  getData();

  //Update button to use themed color button
  const sectionLink = container.querySelector('.button-container > a');
  sectionLink.classList.remove('button');
  sectionLink.classList.add('button-secondary');
}
