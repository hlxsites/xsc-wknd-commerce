import { getMetadata } from '../../scripts/aem.js';
import { getAEMHeadlessClient } from '../../scripts/scripts.js';

/* Hardcoded endpoint */
const AEM_HOST = 'https://publish-p24020-e1129912.adobeaemcloud.com';
const client = await getAEMHeadlessClient(AEM_HOST);
const queryURL = 'aem-demo-assets/adventure-by-slug-v2;slug=bali-surf-camp';
const dataObj = await client.runPersistedQuery(queryURL);

const ADVENTURE_DETAILS = {
  activity: 'Activity',
  adventureType: 'Adventure Type',
  tripLength: 'Trip Length',
  groupSize: 'Group Size',
  difficulty: 'Difficulty',
  price: 'Price',
};

const categories = {
  overview: 'Overview',
  itinerary: 'Itinerary',
  gearList: 'What to Bring',
};


export default async function decorate(block) {
  const metaTag = document.querySelector('meta[name="slug"]');
  if (!metaTag) return;

  const slug = metaTag.getAttribute('content');
  if (!slug) return;

  const adventure = dataObj.data.adventureList.items[0];

  Object.keys(categories).forEach((category) => {
    const body = document.createElement('div');
    const tab = block.querySelector(`div[data-tab-title$="${categories[category]}"]>div`);
    const picture = tab.querySelector('picture');
    [...tab.children].forEach((item) => {
      const regex = '{(.*?)}';

      if (item.textContent.match(regex)) {
        body.innerHTML = adventure[item.textContent.match(regex)[1]].html;
      }
      item.remove();
    });
    if (picture) body.append(picture);
    tab.append(body);

    const sideBar = document.createElement('div');
    sideBar.classList.add('side-bar');

    Object.keys(ADVENTURE_DETAILS).forEach((detail) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      const dl = document.createElement('dl');

      dt.textContent = ADVENTURE_DETAILS[detail];
      dd.textContent = adventure[detail];
      dl.append(dt);
      dl.append(dd);
      sideBar.append(dl);
    });

    tab.append(sideBar);
  });
}
