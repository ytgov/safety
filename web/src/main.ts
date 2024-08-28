import { createApp } from "vue";
import { createPinia } from "pinia";

import { router } from "@/routes";
import auth0 from "@/plugins/auth";
import vuetify from "@/plugins/vuetify";
import { registerPlugins } from "@/plugins";

const pinia = createPinia();

import App from "./App.vue";
const app = createApp(App);
app.use(pinia).use(auth0).use(router).use(vuetify);

registerPlugins(app);

app.mount("#app");
