// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';
import initCommerceEvents from './commerce-events.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
initCommerceEvents();
