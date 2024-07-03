<template>
  <v-app-bar app color="#fff" flat height="70" style="left: 0; border-bottom: 3px #f3b228 solid">
    <router-link to="/"><img src="/yukon.svg" style="margin: -10px 85px 0 14px" height="44" /></router-link>
    <!-- <v-img class="ml-0m pl-0" src="src/assets/yukon.svg" height="44" /> -->
    <v-app-bar-title class="pt-0 font-weight-bold" style="margin-left: -20px">
      <router-link to="/" class="title-link">{{ applicationName }}</router-link>
    </v-app-bar-title>

    <template #append>
      <div v-if="user && user.email">
        <!--  <v-btn color="primary" class="mr-1" to="/administration" icon="mdi-home"></v-btn> -->

        <v-divider class="mr-5" vertical inset></v-divider>
        <span style="font-size: 0.9rem"> {{ user.display_name }} </span>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" color="primary" v-bind="props"></v-btn>
          </template>

          <v-list density="compact">
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
      <h2>Loading {{ applicationName }}</h2>
    </div>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { applicationName } from "@/config";
import { waitForUserToLoad } from "@/modules/administration/router";
import { AuthHelper } from "@/plugins/auth";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const interfaceStore = useInterfaceStore();
const { showApplicationOverlay, isOffline } = storeToRefs(interfaceStore);
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin, user } = storeToRefs(userStore);

showOverlay();

onMounted(async () => {
  await waitForUserToLoad();
  //this.showOverlay = false;
  hideOverlay();
});

async function logoutClick() {
  await AuthHelper.logout({ returnTo: "https://safety.gov.yk.ca" });
}

async function loginClick() {
  AuthHelper.loginWithRedirect({
    appState: { target: window.location.pathname },
  });
}
</script>

<style scoped>
.v-list-item__prepend > .v-icon {
  margin-inline-end: 12px;
}
</style>
