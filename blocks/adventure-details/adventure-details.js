/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

// Drop-in Tools
import { initializers } from '@dropins/elsie/initializer.js';

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
import { createAccordion, generateListHTML } from '../../scripts/scripts.js';

export default async function decorate(block) {
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
        headerTitle.textContent = "Let's get it in the books.";
        ctx.prependSibling(headerTitle);
      },
      Quantity: (ctx) => {
        const label = document.createElement('div');
        label.className = 'quantity-label';
        label.textContent = 'Label placeholder';
        ctx.prependChild(label);
      },
      Options: (ctx) => {
        const label = document.createElement('div');
        const element = ctx.getSlotElement('product-swatch--color'); // Need to update
        label.className = 'options-label';
        label.textContent = 'Options label placeholder';
        element.appendChild(label);

        ctx.onChange((next) => {
          const optionItems = next?.data?.options[1].items;
          const findSelectedItem = optionItems.find((item) => item.selected);

          if (findSelectedItem) {
            label.textContent = `Options label placeholder - ${findSelectedItem.label}`; // Need to update
          }
        });
      },
      Actions: (ctx) => {
        // Add to Cart Button
        ctx.appendButton((next) => ({
          text: 'Add to Cart',
          icon: 'Cart',
          variant: 'primary',
          disabled: !next.data?.inStock || !next.valid,
          onClick: async () => {
            try {
              await addProductsToCart([{
                ...next.values,
              }]);
            } catch (error) {
              console.warn('Error adding product to cart', error);
            }
          },
        }));

        // Add to Wishlist Button
        ctx.appendButton(() => ({
          text: 'Add to List',
          icon: 'Heart',
          variant: 'tertiary',
          onClick: () => console.debug('Add to Wishlist', ctx.data),
        }));

        // Share this itinerary Button
        ctx.appendButton(() => ({
          text: 'Share this itinerary',
          icon: 'Share',
          variant: 'tertiary',
          onClick: () => console.debug('Share this itinerary: ', ctx.data),
        }));
      },
      Description: (ctx) => {
        const defaultContent = ctx?.data?.description;
        const [html, updateContent] = createAccordion('Overview', defaultContent, false);
        ctx.replaceWith(html);

        ctx.onChange((next) => {
          updateContent(next?.data?.description);
        });
      },
      Attributes: (ctx) => {
        let list;
        const attributes = ctx?.data?.attributes;
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
      controls: 'thumbnailsColumn', /* ThumbnailsColumn, ThumbnailsRow, dots (default) */
      mobile: true,
    },
  })(block);
}
