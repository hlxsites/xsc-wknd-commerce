/* eslint-disable */
import { buildAdventureBreadcrumbs } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

/* Hardcoded endpoint */
const AEM_HOST = 'https://publish-p24020-e1129912.adobeaemcloud.com';

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

const adventureText = 'Share this adventure';
const imgPath = '/icons/share.png';

const createElement = (tagName, className) => {
  const el = document.createElement(tagName);
  el.className = className;
  return el;
};

const createImg = () => {
  const img = document.createElement('img');
  img.src = imgPath;
  img.alt = 'Share Icon';
  img.width = 24;
  img.height = 24;
  return img;
};

export default function decorate(block) {
  const slug = getMetadata('slug');
  if (!slug) return;

  const queryURL = `aem-demo-assets/adventure-by-slug-v2;slug=${slug}`;

  const sideBar = document.createElement('div');
  sideBar.classList.add('side-bar');

  import('https://cdn.skypack.dev/pin/@adobe/aem-headless-client-js@v3.2.0-R5xKUKJyh8kNAfej66Zg/mode=imports,min/optimized/@adobe/aem-headless-client-js.js')
    .then((m) => new m.default({ serviceURL: AEM_HOST }))
    .then((client) => client.runPersistedQuery(queryURL))
    .then((dataObj) => {
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

      // Fill side bar
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
        shareElDesktop.insertAdjacentElement('beforebegin', dl);
      });
    });

  // Append 'Share this adventure'
  const shareElDesktop = createElement('p', 'share-adventure desktop');
  shareElDesktop.appendChild(createImg());
  shareElDesktop.insertAdjacentText('beforeend', adventureText);

  const shareElMobile = createElement('p', 'share-adventure mobile');
  shareElMobile.appendChild(createImg());
  shareElMobile.insertAdjacentText('beforeend', adventureText);

  const tabsBlock = document.querySelector('.section.tabs-container');
  sideBar.append(shareElDesktop);
  tabsBlock.prepend(shareElMobile);

  // Append side bar and PDP redirect link button
  tabsBlock.prepend(sideBar);

  const pdpLinkButton = block.querySelector('.tabs-container .button-container a');
  pdpLinkButton.classList.replace('button', 'button-primary');

  const defaultContentWrapper = pdpLinkButton.closest('.default-content-wrapper');
  if (defaultContentWrapper) {
    defaultContentWrapper.classList.replace('default-content-wrapper', 'redirect-btn-container');
    tabsBlock.append(defaultContentWrapper);
  }

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    buildAdventureBreadcrumbs();
  }
}
