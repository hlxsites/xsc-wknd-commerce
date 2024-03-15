/* eslint-disable */
import AdobeAemHeadlessClientJs from 'https://cdn.skypack.dev/pin/@adobe/aem-headless-client-js@v3.2.0-R5xKUKJyh8kNAfej66Zg/mode=imports,min/optimized/@adobe/aem-headless-client-js.js';
import { getConfigValue } from '../../scripts/configs.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  let query = '';
  let activity = '';
  let matchedItems = [];
  let cards = [];
  const tableData = [];
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

    if (textContent === 'data' && nextElement) {
      // Get all table rows except the first one (header)
      const rows = nextElement.querySelectorAll('tr:not(:first-child)');
      rows.forEach(function(row) {
          const cells = row.querySelectorAll('td');
          const slug = cells[0].textContent.trim();
          const country = cells[1].textContent.trim();
          const rowData = {
              "slug": slug,
              "country": country
          };
          tableData.push(rowData);
      });
    }
  }
  block.innerHTML = '';

  try {
    const AEM_HOST = await getConfigValue('aem-host');
    const AEM_GRAPHQL_ENDPOINT = await getConfigValue('aem-graphql-endpoint');
    const AEM_HEADLESS_CLIENT = new AdobeAemHeadlessClientJs({ serviceURL: AEM_HOST });
    let dataObj = {};

    if (activity) {
      dataObj = await AEM_HEADLESS_CLIENT.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query, { activity: activity });
    } else {
      dataObj = await AEM_HEADLESS_CLIENT.runPersistedQuery(AEM_GRAPHQL_ENDPOINT + query);
    }
    const data = dataObj?.data?.adventureList?.items;

    // Filter data based on provided slugs or default to first 4 items
    if (tableData.length > 0) {
      matchedItems = tableData.map(item => {
        const matchedItem = data.find(dataItem => dataItem.slug === item.slug);
        return matchedItem ? matchedItem : null;
      });
      cards = matchedItems;
    } else {
      cards = data.slice(0, 4);
    }

    // Use document fragment to minimize DOM manipulation
    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
      const createdCard = document.createElement('a');
      const { country } = tableData?.find(item => item.slug === card.slug) || {};
      const picture = createOptimizedPicture(
        `/images/adventures/${card.slug}.jpg`,
        card.activity,
        false,
        [{ width: 400 }]
      );
      picture.lastElementChild.width = '200';
      picture.lastElementChild.height = '150';

      createdCard.classList.add('article-card');
      createdCard.href = `/adventures/${card.slug}`;
      createdCard.innerHTML = `
        <div class="card-image">${picture.outerHTML}</div>
        <div class="card-info">
          <p>${card.title}</p>
          ${country ? `<span>${card.tripLength} • ${country}</span>` : `<span>${card.tripLength}</span>`}
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
