/* eslint-disable no-undef, no-restricted-globals */

// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener("message", (event) => {
  console.log("MESSAGE", event);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  console.log("FETCH", event.request);

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

console.log("Loading serviceWorker.js");

//workbox.clientsClaim();

// The precaching code provided by Workbox.
//self.__precacheManifest = [].concat(self.__precacheManifest || []);
//workbox.precaching.suppressWarnings();
//workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
