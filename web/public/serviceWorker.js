/* eslint-disable no-undef, no-restricted-globals */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({
  debug: true,
});

/* skipWaiting() from workbox-core is no longer recommended and will be removed in Workbox v7. Using self.skipWaiting() instead is equivalent. */
workbox.core.skipWaiting();
workbox.core.clientsClaim();

const { strategies } = workbox;
const { expiration } = workbox;

/* workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '000000' },
]);
 */

// Cache scripts
// TODO: 'Report issue' button functionality breaks when script's are cached, fix this issue
/* workbox.routing.registerRoute(({ request }) => {
  return request.destination === 'script';
},
  new strategies.CacheFirst({
    cacheName: 'js-cache',
    plugins: [
      // Use the ExpirationPlugin to manage the cache size and age
      new expiration.ExpirationPlugin({
        // Set the maximum number of entries (files) that can be stored in the cache
        maxEntries: 255,

        // Set the maximum age of an entry in the cache (in seconds)
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
); */

// Cache stylesheets (css)
// TODO: Figure out what this cache is always empty
workbox.routing.registerRoute(({ request }) => {
  return request.destination === 'style';
},
  new strategies.CacheFirst({
    cacheName: 'css-cache',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 8,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);


// Cache images
workbox.routing.registerRoute(({ request }) => {
  console.log('Request destination:', request.destination);
  return request.destination === 'image';
},
  new strategies.CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 8,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

/* workbox.precaching.precacheAndRoute([
  {url: '/yukon.svg', revision: '123456'}, // Change the revision to force update
]);

// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener("message", (event) => {
  //console.log("MESSAGE", event);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
 */
/*
self.addEventListener("fetch", (event) => {
   
  let store = caches.open("basic")

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        store.put(event.request, response.clone());
        console.log("ADDING TO CACHE", event.request);
        return response;
      })
      .catch((err) => {
        console.log("RETURNING FROM CACHE", event.request, err);
        return store.match(event.request);
      })
  );
  event.respondWith(
    fetch(event.request)
      .then((cache) => {
        return fetch(event.request).then(function (response) {
          caches.open("basic").put(event.request, response.clone());
          console.log("ADDING TO CACHE", event.request);
          return response;
        });
      })
      .catch((err) => {
        console.log("RETURNING FROM CACHE", event.request, err);
        return caches.match(event.request);
      })
  ); 
});
*/

console.log("Loading serviceWorker.js");

//workbox.clientsClaim();

// The precaching code provided by Workbox.
//self.__precacheManifest = [].concat(self.__precacheManifest || []);
//workbox.precaching.suppressWarnings();
//workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
