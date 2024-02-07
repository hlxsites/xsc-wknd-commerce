/* eslint-disable */
import { fetchJson, getAEMHeadlessClient } from '../../scripts/scripts.js';

export default function decorate(block) {
  const container = block.parentNode.parentNode;
  const query = container.getAttribute('data-query');
  const maxCardsCount = container.getAttribute('data-limit');
  const blockEl = container.querySelector('.cards.block');
  const AEM_ENABLE_CACHE = false;
  let AEM_GRAPHQL_ENDPOINT;
  let AEM_HOST;

  async function getData() {
    const configPath = `${window.location.origin}/demo-config.json`;
    const { data } = await fetchJson(configPath);
    AEM_GRAPHQL_ENDPOINT = data[0]['aem-graphql-endpoint'];
    AEM_HOST = data[0]['aem-host'];
    const client = await getAEMHeadlessClient(AEM_HOST);
    const dataObj = await client.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query, {
      time: AEM_ENABLE_CACHE ? Date.now() : 0, offset: 0, limit: maxCardsCount,
    });

    const cardData = dataObj.data.adventureList.items;
    blockEl.innerHTML = '';
    [...cardData].forEach((card) => {
      const createdCard = document.createElement('a');
      createdCard.classList.add('article-card');
      createdCard.href = `/adventures/${card.slug}`;
      createdCard.innerHTML = `
        <div class="card-image">
          <img loading="lazy" alt="${card.activity}" src="${card.primaryImage._publishUrl}" width="" height="">
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
