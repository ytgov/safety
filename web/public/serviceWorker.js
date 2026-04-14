/* eslint-disable no-undef, no-restricted-globals */

import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { clientsClaim } from "workbox-core";

self.skipWaiting();
clientsClaim();

// When a new service worker activates, clear the location cache so fresh data is fetched
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.delete("api-location"));
});

/*
 * vite-plugin-pwa provides us with paths to all the files to precache via __WB_MANIFEST.
 * Do not precache anywhere else.
 * Additional files needed to be precached should be configured in vite config.
 */
precacheAndRoute(self.__WB_MANIFEST);

// Works if app is a single page app
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [new RegExp(/^\/api/), new RegExp(/^\/migrate/)],
  })
);

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
        maxAgeSeconds: 60 * 60 * 24 * 90,
      }),
    ],
  })
);

// Cache locations - serve from network when online, fall back to cache when offline, expire after 30 days
registerRoute(
  ({ url }) => {
    return url.pathname.startsWith("/api/location");
  },
  new NetworkFirst({
    cacheName: "api-location",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

const bgSyncPlugin = new BackgroundSyncPlugin("reportQueue", {
  maxRetentionTime: 30 * 24 * 60 , // Retry for max of 30 days (specified in minutes)
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
