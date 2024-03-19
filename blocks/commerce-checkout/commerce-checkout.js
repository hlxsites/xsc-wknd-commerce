/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

// Drop-in Tools
import { initializers } from '@dropins/tools/initializer.js';
import { events } from '@dropins/tools/event-bus.js';

// Drop-in APIs
import * as checkout from '@dropins/storefront-checkout/api.js';
import * as adyen from '@dropins/adyen-checkout-extension/api.js';

// Drop-in Providers
import { render as provider } from '@dropins/storefront-checkout/render.js';
import { render as extensionRenderer } from '@dropins/adyen-checkout-extension/render.js';

// Drop-in Containers
import Checkout from '@dropins/storefront-checkout/containers/Checkout.js';
import AdyenPaymentMethod from '@dropins/adyen-checkout-extension/containers/AdyenPaymentMethod.js';

export default async function decorate(block) {
  // If cartId is cached in session storage, use
  // otherwise, checkout drop-in will look for one in the event-bus
  const cartId = sessionStorage.getItem('DROPINS_CART_ID') || '';

  // Initialize Drop-ins
  initializers.register(checkout.initialize, {});
  initializers.register(adyen.initialize, { environment: 'test' });

  // Listen for order confirmation and redirect to order confirmation page
  events.on('checkout/order', (data) => {
    window.location.replace(
      `/order-confirmation?orderRef=${data.masked_order_id}`,
    );
  });

  return provider.render(Checkout, {
    cartId,
    routeHome: () => '/',
    routeCart: () => '/cart',
    slots: {
      PaymentMethods: async (context) => {
        context.addPaymentMethodHandler('adyen_cc', {
          render: (ctx, element) => {
            if (element) {
              // clear the element first
              element.innerHTML = '';
              extensionRenderer.render(AdyenPaymentMethod, ctx)(element);
            }
          },
        });
      },
    },
  })(block);
}
