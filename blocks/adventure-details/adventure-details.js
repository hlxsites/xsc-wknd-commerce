/* eslint-disable */

// Drop-in Tools
import { initializers } from '@dropins/tools/initializer.js';

// Drop-in APIs
import * as product from '@dropins/storefront-pdp/api.js';
import { addProductsToCart } from '@dropins/storefront-cart/api.js';

// Drop-in Providers
import { render as productRenderer } from '@dropins/storefront-pdp/render.js';

// Drop-in Containers
import ProductDetails from '@dropins/storefront-pdp/containers/ProductDetails.js';

// Libs
import { getConfigValue } from '../../scripts/configs.js';
import { getAdventureSkuFromUrl } from '../../scripts/commerce.js';
import { createAccordion, generateListHTML, getBlockPlaceholderInfo, buildAdventureBreadcrumbs } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const placeholderObject = getBlockPlaceholderInfo(block);
  const carouselControl = placeholderObject['Carousel-Controls'].layout;
  block.innerHTML = '';

  buildAdventureBreadcrumbs();

  // Initialize Drop-ins
  initializers.register(product.initialize, {});

  // Set Fetch Endpoint (Service)
  product.setEndpoint(await getConfigValue('commerce-endpoint'));

  // Set Fetch Headers (Service)
  product.setFetchGraphQlHeaders({
    'Content-Type': 'application/json',
    'Magento-Environment-Id': await getConfigValue('commerce-environment-id'),
    'Magento-Website-Code': await getConfigValue('commerce-website-code'),
    'Magento-Store-View-Code': await getConfigValue('commerce-store-view-code'),
    'Magento-Store-Code': await getConfigValue('commerce-store-code'),
    'Magento-Customer-Group': await getConfigValue('commerce-customer-group'),
    'x-api-key': await getConfigValue('commerce-x-api-key'),
  });

  // Render Containers
  return productRenderer.render(ProductDetails, {
    sku: getAdventureSkuFromUrl(),
    slots: {
      Title: (ctx) => {
        const headerTitle = document.createElement('div');
        headerTitle.className = 'custom-title';
        headerTitle.textContent = placeholderObject['Header-Title'].text;
        ctx.prependSibling(headerTitle);
      },
      Quantity: (ctx) => {
        const label = document.createElement('div');
        label.className = 'quantity-label';
        label.textContent = placeholderObject['Quantity-Label'].text;
        ctx.prependChild(label);
      },
      Actions: (ctx) => {
        // Add to Cart Button
        ctx.appendButton((next, state) => {
          const adding = state.get('adding');

          return {
            text: adding
              ? placeholderObject['Add-To-Cart-Button'].loadingText
              : placeholderObject['Add-To-Cart-Button'].text,
            icon: placeholderObject['Add-To-Cart-Button'].icon,
            variant: placeholderObject['Add-To-Cart-Button'].variant,
            disabled: adding || !next.data?.inStock || !next.valid,
            onClick: async () => {
              state.set('adding', true);
              try {
                // TODO: remove hardcoding after demo
                let selection = {
                  ...next.values
                };
                const optionsMap = {
                  'Y29uZmlndXJhYmxlLzE5Mi8zNw==': 'Y29uZmlndXJhYmxlLzUzOC80Ng==', // dorm
                  'Y29uZmlndXJhYmxlLzE5Mi8zOA==': 'Y29uZmlndXJhYmxlLzUzOC80OQ==', // single
                  'Y29uZmlndXJhYmxlLzE5Mi8zOQ==': 'Y29uZmlndXJhYmxlLzUzOC81Mg==', // double
                  'Y29uZmlndXJhYmxlLzE5My80MA==': 'Y29uZmlndXJhYmxlLzUzNS8zNw==', // may
                  'Y29uZmlndXJhYmxlLzE5My80MQ==': 'Y29uZmlndXJhYmxlLzUzNS80MA==', // june
                  'Y29uZmlndXJhYmxlLzE5My80Mg==': 'Y29uZmlndXJhYmxlLzUzNS80Mw==' // july
                };
                selection.optionsUIDs.forEach((option, idx) => {
                  selection.optionsUIDs[idx] = optionsMap[option];
                });
                selection.sku = 10;
                await addProductsToCart([selection]);
              } catch (error) {
                console.error('Error occurred while adding products to cart:', error);
              } finally {
                state.set('adding', false);
              }
            },
          }
        });

        // Add to Wishlist Button
        ctx.appendButton(() => ({
          text: placeholderObject['Add-To-Wishlist-Button'].text,
          icon: placeholderObject['Add-To-Wishlist-Button'].icon,
          variant: placeholderObject['Add-To-Wishlist-Button'].variant,
          onClick: () => console.debug('Add to Wishlist', ctx.data),
        }));

        // Share this itinerary Button
        ctx.appendButton(() => ({
          text: placeholderObject['Share-This-Itinerary-Button'].text,
          icon: placeholderObject['Share-This-Itinerary-Button'].icon,
          variant: placeholderObject['Share-This-Itinerary-Button'].variant,
          onClick: () => console.debug('Share this itinerary: ', ctx.data),
        }));
      },
      Description: (ctx) => {
        const defaultContent = ctx?.data?.description;
        if (!defaultContent) return;

        const [html, updateContent] = createAccordion('Overview', defaultContent, true);
        ctx.replaceWith(html);

        ctx.onChange((next) => {
          updateContent(next?.data?.description);
        });
      },
      ShortDescription: (ctx) => {
        const shortDescContent = ctx?.data?.shortDescription;
        const strippedString = shortDescContent.replace(/<[^>]+>/g, '').trim();
        if (!shortDescContent || !strippedString) return;

        const [html, updateContent] = createAccordion('Short description', shortDescContent, false);
        ctx.replaceWith(html);

        ctx.onChange((next) => {
          updateContent(next?.data?.shortDescription);
        });
      },
      Attributes: (ctx) => {
        const attributes = ctx?.data?.attributes;
        if (!attributes) return;

        let list;
        list = generateListHTML(attributes);
        const [html, updateContent] = createAccordion('Product specs', list, false);
        ctx.replaceWith(html);

        ctx.onChange((next) => {
          list = generateListHTML(next?.data?.attributes);
          updateContent(list);
        });
      },
    },
    carousel: {
      /* eslint-disable no-nested-ternary */
      controls: carouselControl === 'column' ? 'thumbnailsColumn' : carouselControl === 'row' ? 'thumbnailsRow' : 'dots',
      mobile: true,
    },
  })(block);
}
