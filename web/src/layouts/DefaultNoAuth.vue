<template>
  <v-app-bar app color="#fff" flat height="70" style="left: 0; border-bottom: 3px #f3b228 solid">
    <router-link to="/"
      ><img src="/yukon.svg" style="margin-top: -10px; margin-left: 14px" height="44" class="mr-0 mr-md-6"
    /></router-link>
    <!-- <v-img class="ml-0m pl-0" src="src/assets/yukon.svg" height="44" /> -->
    <v-app-bar-title class="pt-0 font-weight-bold">
      <router-link to="/" class="title-link">{{ applicationName }}</router-link>
    </v-app-bar-title>

    <template #append>
      <div v-if="user && user.email">
        <!--  <v-btn color="primary" class="mr-1" to="/administration" icon="mdi-home"></v-btn> -->

        <v-divider class="mr-5" vertical inset></v-divider>
        <span class="d-none d-md-inline" style="font-size: 0.9rem">{{ user.display_name }}</span>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" color="primary" v-bind="props"></v-btn>
          </template>

          <v-list density="compact">
            <v-list-item class="d-flex d-md-none">
              <template v-slot:prepend> <v-icon>mdi-account</v-icon></template>
              <v-list-item-title style="font-size: 0.9rem !important">{{ user.display_name }}</v-list-item-title>
            </v-list-item>

            <v-list-item to="/hazard-library">
              <template v-slot:prepend>
                <v-icon>mdi-hazard-lights</v-icon>
              </template>
              <v-list-item-title style="font-size: 0.9rem !important">Hazard Library</v-list-item-title>
            </v-list-item>

            <v-list-item to="/inspections">
              <template v-slot:prepend>
                <v-icon>mdi-clipboard-search-outline</v-icon>
              </template>
              <v-list-item-title style="font-size: 0.9rem !important">Inspections</v-list-item-title>
            </v-list-item>

            <v-list-item to="/inspection">
              <template v-slot:prepend>
                <v-icon>mdi-clipboard-list-outline</v-icon>
              </template>
              <v-list-item-title style="font-size: 0.9rem !important">Start Inspection</v-list-item-title>
            </v-list-item>

            <v-list-item to="/administration" v-if="isSystemAdmin">
              <template v-slot:prepend>
                <v-icon>mdi-account-cog</v-icon>
              </template>
              <v-list-item-title style="font-size: 0.9rem !important">Administration</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logoutClick">
              <template v-slot:prepend>
                <v-icon>mdi-exit-run</v-icon>
              </template>
              <v-list-item-title style="font-size: 0.9rem !important">Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-else-if="isOffline" class="mr-4 text-warning">Offline</div>
      <div v-else class="mr-4">
        <a @click="loginClick" class="cursor-pointer">Sign in</a>
      </div>
    </template>
  </v-app-bar>

  <v-main>
    <!-- Provides the application the proper gutter -->
    <!-- fill-height causes the main content to fill the entire page -->
    <v-container fluid class="page-wrapper">
      <router-view></router-view>
    </v-container>
  </v-main>
  <v-overlay v-model="showApplicationOverlay" class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate size="64" class="mb-5" color="#f3b228" width="6"></v-progress-circular>
      <h2>{{ overlayMessage }}</h2>
    </div>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { applicationName } from "@/config";
//import { waitForUserToLoad } from "@/routes";
import { useAuth0 } from "@auth0/auth0-vue";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const interfaceStore = useInterfaceStore();
const { showApplicationOverlay, isOffline, overlayMessage } = storeToRefs(interfaceStore);
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin, user } = storeToRefs(userStore);

const { logout, loginWithRedirect } = useAuth0();

showOverlay();

onMounted(async () => {
  await userStore.initialize();
  //await waitForUserToLoad();
  hideOverlay();
});

async function logoutClick() {
  console.log("returnTo", window.location.origin);
  await logout({ logoutParams: { returnTo: window.location.origin }, returnTo: window.location.origin });
}

async function loginClick() {
  loginWithRedirect({
    appState: { target: window.location.pathname },
  });
}
</script>

<style scoped>
.v-list-item__prepend > .v-icon {
  margin-inline-end: 12px;
}
</style>
