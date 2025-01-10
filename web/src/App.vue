<template>
  <v-app>
    <Notification />
    <router-view />
  </v-app>
</template>
<script setup>
import Notification from "@/components/Notifications.vue";
</script>
