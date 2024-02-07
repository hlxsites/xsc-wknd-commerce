// Drop-in Tools
import { events } from '@dropins/elsie/event-bus.js';
import { setEndpoint } from '@dropins/elsie/fetch-graphql.js';
import { initializers } from '@dropins/elsie/initializer.js';

// Drop-ins
import * as cart from '@dropins/storefront-cart/api.js';

// Libs
import { getConfigValue } from './configs.js';

export default async function initializeDropins() {
  // Set Fetch Endpoint (Global)
  setEndpoint(await getConfigValue('commerce-core-endpoint'));

  // Initializers (Global)
  initializers.register(cart.initialize, {});

  // Mount all registered drop-ins
  if (document.readyState === 'complete') {
    initializers.mount();
  } else {
    window.addEventListener('load', initializers.mount);
  }

  events.enableLogger(true);
}
