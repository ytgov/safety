<script setup lang="ts">
import Notifications from "@/components/Notifications.vue";

components: {
  Notifications;
}
</script>

<template>
  <v-app>
    <router-view />
    <notifications />
  </v-app>
</template>
