import { createApp } from "vue";
import { createPinia } from "pinia";

import { router } from "@/routes";
import auth0 from "@/plugins/auth";
import vuetify from "@/plugins/vuetify";
import { registerPlugins } from "@/plugins";

const pinia = createPinia();

import App from "./App.vue";
const app = createApp(App);
app.use(pinia).use(router).use(vuetify).use(auth0);

registerPlugins(app);

app.mount("#app");
