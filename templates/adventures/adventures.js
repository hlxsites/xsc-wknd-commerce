import { getAEMHeadlessClient } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

/* Hardcoded endpoint */
const AEM_HOST = 'https://publish-p24020-e1129912.adobeaemcloud.com';
const client = await getAEMHeadlessClient(AEM_HOST);

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
  const slug = getMetadata('slug');
  if (!slug) return;

  const queryURL = `aem-demo-assets/adventure-by-slug-v2;slug=${slug}`;
  const dataObj = await client.runPersistedQuery(queryURL);
  const adventure = dataObj.data.adventureList.items[0];

  // Add data to tabs
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
  });

  // Create side bar
  const sideBar = document.createElement('div');
  sideBar.classList.add('side-bar');

  Object.keys(ADVENTURE_DETAILS).forEach((detail) => {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    const dl = document.createElement('dl');

    dt.textContent = ADVENTURE_DETAILS[detail];

    if (detail === 'price') {
      const unformattedPrice = adventure[detail];
      const formattedString = unformattedPrice.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      const roundedNumber = Math.round(parseFloat(formattedString.replace(/[$,]/g, '')));
      const finalFormattedString = roundedNumber.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      dd.textContent = `${finalFormattedString} USD`;
    } else {
      dd.textContent = adventure[detail];
    }
    dl.append(dt);
    dl.append(dd);
    sideBar.append(dl);
  });

  // Append 'Share this adventure'
  const text = 'Share this adventure';
  const imgPath = '/icons/share.png';
  const shareElDesktop = document.createElement('p');
  shareElDesktop.className = 'share-adventure desktop';

  const shareElMobile = document.createElement('p');
  shareElMobile.className = 'share-adventure mobile';

  const imgElDesktop = document.createElement('img');
  imgElDesktop.src = imgPath;
  imgElDesktop.alt = 'Share Icon';
  imgElDesktop.width = 24;
  imgElDesktop.height = 24;

  const imgElMobile = document.createElement('img');
  imgElMobile.src = imgPath;
  imgElMobile.alt = 'Share Icon';
  imgElMobile.width = 24;
  imgElMobile.height = 24;

  shareElDesktop.appendChild(imgElDesktop);
  shareElMobile.appendChild(imgElMobile);

  shareElDesktop.insertAdjacentText('beforeend', text);
  shareElMobile.insertAdjacentText('beforeend', text);

  const tabsBlock = document.querySelector('.section.tabs-container');
  sideBar.append(shareElDesktop);
  tabsBlock.prepend(shareElMobile);

  // Append side bar and PDP redirect link button
  tabsBlock.prepend(sideBar);

  const pdpLinkButton = block.querySelector('.adventure-details .button-container a');
  pdpLinkButton.classList.replace('button', 'button-primary');

  const defaultContentWrapper = pdpLinkButton.closest('.default-content-wrapper');
  if (defaultContentWrapper) {
    defaultContentWrapper.classList.replace('default-content-wrapper', 'redirect-btn-container');
    tabsBlock.append(defaultContentWrapper);
  }
}
