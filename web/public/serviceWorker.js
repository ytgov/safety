/* eslint-disable no-undef, no-restricted-globals */

console.log("Loading serviceWorker.js...");

import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";

self.skipWaiting();
// workbox.core.clientsClaim();

/*
 * vite-plugin-pwa provides us with paths to all the files to precache via __WB_MANIFEST.
 * Do not precahce any where else.
 * Additional files needed to be precache should be configured in vite config
 */
precacheAndRoute(self.__WB_MANIFEST);

// Works if app is a single page app
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

// Example cache GET req (import removed)
// workbox.routing.registerRoute(({ url }) => {
//  return url.pathname.startsWith('/node_modules/');
// },
// new strategies.CacheFirst({
//     cacheName: 'node-module-cache',
//     plugins: [
//       new expiration.ExpirationPlugin({
//         maxEntries: 255,
//         maxAgeSeconds: 60 * 60 * 24 * 30,
//       }),
//     ],
//   })
// );

/*
 * Attempt to cache simple api calls
 */

// Cache fonts
registerRoute(
  ({ request }) => {
    return request.destination === "font";
  },
  new CacheFirst({
    cacheName: "font-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// Cache locations
registerRoute(
  ({ url }) => {
    return url.pathname.startsWith("/api/location");
  },
  new NetworkFirst({
    cacheName: "api-location",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 120,
      }),
    ],
  })
);

const bgSyncPlugin = new BackgroundSyncPlugin("reportQueue", {
  maxRetentionTime: 30 * 24 * 60, // Retry for max of 30 days (specified in minutes)
});

// Queue report submissions
registerRoute(
  ({ url }) => {
    return url.pathname.startsWith("/api/offline-reports");
  },
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  // An optional third parameter specifies the request method
  "POST"
);
