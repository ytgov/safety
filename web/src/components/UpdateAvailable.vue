<template>
  <v-snackbar v-model="visible" :timeout="-1" color="primary" location="bottom right">
    <v-icon class="mr-3">mdi-update</v-icon>
    A new version of Safety is available.
    <template #actions>
      <v-btn variant="text" @click="reload">Reload</v-btn>
      <v-btn variant="text" @click="dismiss">Dismiss</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUpdateStore } from "@/store/UpdateStore";

const store = useUpdateStore();
const visible = computed({
  get: () => store.visible,
  set: (v) => {
    if (!v) store.dismiss();
  },
});

function reload() {
  store.reload();
}
function dismiss() {
  store.dismiss();
}
</script>
