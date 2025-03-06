<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Action Details' }]" />
  <div v-if="selectedAction">
    <h1 class="text-h4 mb-4">{{ selectedAction.description }}</h1>

    <v-card v-if="selectedAction.status_code == 'Open'" class="default" :loading="isLoading">
      <v-card-title>
        <h4 class="text-h5">Action Classification</h4>
      </v-card-title>
      <v-card-text>
        <p class="mb-4">Before an Action can be completed, it must first be classified.</p>
        <div class="bg-white" style="border: 1px #ddd solid; border-radius: 4px">
          <ActionClassifyForm :action="selectedAction" @do-close="goHome" />
        </div>
      </v-card-text>
    </v-card>
    <v-card v-else class="default" :loading="isLoading">
      <v-card-title>
        <h4 class="text-h5">Action Implementation</h4>
      </v-card-title>
      <v-card-text>
        <div class="bg-white" style="border: 1px #ddd solid; border-radius: 4px">
          <ActionCompleteForm :action="selectedAction" @do-close="goHome" />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useActionStore } from "@/store/ActionStore";
import ActionClassifyForm from "./ActionClassifyForm.vue";
import ActionCompleteForm from "./ActionCompleteForm.vue";

const actionStore = useActionStore();
const { loadAction } = actionStore;
const { selectedAction, isLoading } = storeToRefs(actionStore);

const route = useRoute();
const router = useRouter();

loadAction(route.params.id);

function goHome() {
  router.push("/");
}
</script>
