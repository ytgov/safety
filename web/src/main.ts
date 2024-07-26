import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./routes";
import { AuthHelper } from "@/plugins/auth";

// Plugins
import { registerPlugins } from "./plugins";

const pinia = createPinia();

import App from "./App.vue";
const app = createApp(App);
app
  .use(pinia)
  .use(router)
  .use(AuthHelper as any);

export {}; // Important! See note.

registerPlugins(app);

app.mount("#app");
