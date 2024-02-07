import { performMonolithGraphQLQuery } from './commerce.js';

const STOREFRONT_QUERY_RESULT_KEY = 'storefront-query-result';

const STOREFRONT_CONTEXT_QUERY = `
   query DataServicesStorefrontInstanceContext {
        dataServicesStorefrontInstanceContext {
            catalog_extension_version
            environment
            environment_id
            store_code
            store_id
            store_name
            store_url
            store_view_code
            store_view_id
            store_view_name
            website_code
            website_id
            website_name
        }
        storeConfig {
            base_currency_code
            store_code
        }
    }
`;

async function getMagentoStorefrontEvents(callback) {
  return new Promise((resolve) => {
    if (window.magentoStorefrontEvents) {
      if (callback) {
        callback(window.magentoStorefrontEvents);
      }
      resolve(window.magentoStorefrontEvents);
      return;
    }

    const eventHandler = ({ data }) => {
      if (data === 'magento-storefront-events-sdk') {
        window.removeEventListener('message', eventHandler);
        if (callback) {
          callback(window.magentoStorefrontEvents);
        }
        resolve(window.magentoStorefrontEvents);
      }
    };
    window.addEventListener('message', eventHandler);
  });
}

let eventsSDKInitialized = false;
export default async function init() {
  if (eventsSDKInitialized) {
    return;
  }
  eventsSDKInitialized = true;

  // Load events SDK and collector
  import('./commerce-events-sdk.js');
  import('./commerce-events-collector.js');

  // Load configuration
  let result;
  if (window.localStorage.getItem(STOREFRONT_QUERY_RESULT_KEY)) {
    result = JSON.parse(window.localStorage.getItem(STOREFRONT_QUERY_RESULT_KEY));
  } else {
    ({ data: result } = await performMonolithGraphQLQuery(STOREFRONT_CONTEXT_QUERY, {}));
    if (result) {
      window.localStorage.setItem(STOREFRONT_QUERY_RESULT_KEY, JSON.stringify(result));
    }
  }

  if (!result) {
    throw new Error('error fetching storefront context');
  }

  const {
    environment,
    environment_id: environmentId,
    website_id: websiteId,
    website_code: websiteCode,
    website_name: websiteName,
    store_url: storeUrl,
    store_id: storeId,
    store_code: storeCode,
    store_name: storeName,
    store_view_id: storeViewId,
    store_view_code: storeViewCode,
    store_view_name: storeViewName,
    catalog_extension_version: catalogExtensionVersion,
  } = result.dataServicesStorefrontInstanceContext;
  const { base_currency_code: baseCurrencyCode } = result.storeConfig;

  const context = {
    environmentId,
    environment,
    storeUrl,
    websiteId,
    websiteCode,
    storeId,
    storeCode,
    storeViewId,
    storeViewCode,
    websiteName,
    storeName,
    storeViewName,
    baseCurrencyCode,
    storeViewCurrencyCode: baseCurrencyCode,
    catalogExtensionVersion,
    storefrontTemplate: 'Franklin',
  };

  getMagentoStorefrontEvents((mse) => {
    mse.context.setStorefrontInstance(context);
    mse.context.setEventForwarding({
      commerce: true,
      aep: false,
    });
  });
}
