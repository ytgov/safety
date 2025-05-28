<template>
  <v-btn v-if="isOffline" color="success" to="/report-an-incident-offline" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident or Hazard Offline</v-btn
  >
  <v-btn v-else-if="isAuthenticated" color="success" to="/report-an-incident" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident or Hazard</v-btn
  >
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { useAuth0 } from "@auth0/auth0-vue";

const interfaceStore = useInterfaceStore();
const { isOffline } = storeToRefs(interfaceStore);
const { isAuthenticated } = useAuth0();
</script>
