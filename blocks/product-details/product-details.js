/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

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
import { getSkuFromUrl } from '../../scripts/commerce.js';
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
    sku: getSkuFromUrl(),
    slots: {
      Actions: (ctx) => {
        // Add to Cart Button
        ctx.appendButton((next, state) => {
          const adding = state.get('adding');

          return {
            text: adding
              ? 'Adding to Cart'
              : 'Add to Cart',
            icon: 'Cart',
            variant: 'primary',
            disabled: adding || !next.data?.inStock || !next.valid,
            onClick: async () => {
              state.set('adding', true);
              try {
                await addProductsToCart([{ ...next.values }]);
              } catch (error) {
                console.error('Error occurred while adding products to cart:', error);
              } finally {
                state.set('adding', false);
              }
            },
          };
        });

        // Add to Wishlist Button
        ctx.appendButton(() => ({
          'aria-label': 'Add to Wishlist',
          icon: 'Heart',
          variant: 'secondary',
          onClick: () => console.debug('Add to Wishlist', ctx.data),
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
        if (!shortDescContent) return;

        const [html, updateContent] = createAccordion('Overview', shortDescContent, true);
        ctx.replaceWith(html);

        ctx.onChange((next) => {
          updateContent(next?.data?.shortDescription);
        });
      },
      Attributes: (ctx) => {
        const attributes = ctx?.data?.attributes;
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
      controls: 'thumbnailsColumn', /* thumbnailsColumn, thumbnailsRow, dots (default) */
      mobile: true,
    },
  })(block);
}
