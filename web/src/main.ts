import { createApp } from "vue";
import { createPinia } from "pinia";

import { router } from "@/routes";
import auth0 from "@/plugins/auth";
import vuetify from "@/plugins/vuetify";
import { registerPlugins } from "@/plugins";
import { useUpdateStore } from "@/store/UpdateStore";

const pinia = createPinia();

import App from "./App.vue";
const app = createApp(App);
app.use(pinia).use(router).use(auth0).use(vuetify);

registerPlugins(app);

app.mount("#app");

// Prompt the user when a new service worker has installed, and reload the page
// once it takes control. Pairs with serviceWorker.js, which no longer calls
// skipWaiting()/clientsClaim() automatically — without this, new builds would
// only activate after every tab for the site was closed.
if ("serviceWorker" in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const updateStore = useUpdateStore();

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      updateStore.show(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          updateStore.show(installing);
        }
      });
    });
  });
}
