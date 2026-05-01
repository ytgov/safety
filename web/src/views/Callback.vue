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
import { router } from "@/routes";

const { isLoading, isAuthenticated } = useAuth0();

async function finish() {
  const target = window.location.pathname === "/callback" ? "/" : window.location.pathname;
  if (isAuthenticated.value) {
    await router.replace(target);
  } else {
    await router.replace("/sign-in");
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
