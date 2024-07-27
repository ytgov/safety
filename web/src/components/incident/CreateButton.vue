<template>
 <!--  <v-btn v-if="isOffline" color="success" to="/report-an-incident-offline" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident Offline</v-btn
  >
  <v-btn v-else color="success" to="/report-an-incident" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident</v-btn
  > -->

  <v-btn color="success" to="/report-an-incident-offline" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident Offline</v-btn
  >
  <v-btn color="success" to="/report-an-incident" size="large">
    <v-icon class="mr-4">mdi-clipboard-alert-outline</v-icon>
    Report an Incident</v-btn
  >
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useInterfaceStore } from "@/store/InterfaceStore";

const interfaceStore = useInterfaceStore();
const { isOffline } = storeToRefs(interfaceStore);
</script>
