// import { fetchJson, getAEMHeadlessClient } from '../../scripts/scripts.js';

// export default async function decorate(block) {
//   const container = block.parentNode.parentNode;
//   const query = container.getAttribute('data-query');
//   const maxCardsCount = container.getAttribute('data-limit');
//   const blockEl = container.querySelector('.cards.block');
//   const AEM_ENABLE_CACHE = false;
//   let AEM_GRAPHQL_ENDPOINT = '';
//   let AEM_HOST = '';

//   const configPath = `${window.location.origin}/demo-config.json`;
//   const { data } = await fetchJson(configPath);
//   AEM_GRAPHQL_ENDPOINT = data[0]['aem-graphql-endpoint'];
//   AEM_HOST = data[0]['aem-host'];

//   const client = await getAEMHeadlessClient(AEM_HOST);
//   const queryURL = AEM_GRAPHQL_ENDPOINT + '/adventure-by-slug;slug=bali-surf-camp';
//   const dataObj = await client.runPersistedQuery(queryURL);
//   // adventure-by-slug-v2;slug=bali-surf-camp
//   console.log("testing slug endpoint: ", dataObj);
// }
