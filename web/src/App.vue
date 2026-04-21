<template>
  <v-app>
    <Notification />
    <UpdateAvailable />
    <router-view />
  </v-app>
</template>
<script setup>
import Notification from "@/components/Notifications.vue";
import UpdateAvailable from "@/components/UpdateAvailable.vue";
</script>
