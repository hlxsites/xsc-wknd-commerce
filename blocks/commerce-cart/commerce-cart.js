/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

// Drop-in Providers
import { render as provider } from '@dropins/storefront-cart/render.js';

// Drop-in Containers
import Cart from '@dropins/storefront-cart/containers/Cart.js';

export default async function decorate(block) {
  // Initialize Drop-ins – already initialized in scripts/dropins.js

  // Temporary link to Checkout
  const goToCheckoutLink = document.createRange().createContextualFragment('<a href="/checkout" class="button">Checkout</a>');
  block.appendChild(goToCheckoutLink);

  // Render Containers
  return provider.render(Cart, {
    routeEmptyCartCTA: () => '/',
    routeProduct: (product) => `/products/${product.url.urlKey}/${product.sku}`,
  })(block);
}
