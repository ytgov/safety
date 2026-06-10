<template>
  <v-overlay model-value persistent class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate size="64" class="mb-5" color="#f3b228" width="6" />
      <h2>Signing in…</h2>
    </div>
  </v-overlay>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useApiStore } from "@/store/ApiStore";
import { USERS_URL } from "@/urls";

const { isLoading, isAuthenticated } = useAuth0();
const api = useApiStore();

function finish() {
  const target = window.location.pathname === "/callback" ? "/" : window.location.pathname;
  if (isAuthenticated.value) {
    api.secureCall("post", `${USERS_URL}/me/sync-directory`).catch((err) => {
      console.warn("Directory sync on login failed", err);
    });
    window.location.replace(target);
  } else {
    window.location.replace("/sign-in");
  }
}

onMounted(() => {
  if (!isLoading.value) {
    finish();
    return;
  }
  const stop = watch(isLoading, (loading) => {
    if (!loading) {
      stop();
      finish();
    }
  });
});
</script>
