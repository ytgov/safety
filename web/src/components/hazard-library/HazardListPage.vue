<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Hazard Library' }]" />

  <div>
    <div class="float-right"></div>

    <h1 class="text-h4 mb-2">Hazard Library</h1>
    <div class="my-3" style="clear: both"></div>
  </div>

  <v-card class="default mb-5">
    <v-card-text class="pt-5">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search"
            outlined
            dense
            clearable
            prepend-inner-icon="mdi-magnify" /> </v-col
        ><!-- 
        <v-col cols="12" md="6">
          <v-select v-model="selectedCategory" :items="categories" label="Category" outlined dense clearable />
        </v-col> -->
      </v-row>

      <v-data-table
        :headers="headers"
        :loading="isLoading"
        :items="hazards"
        :search="search"
        :items-per-page="10"
        @click:row="openDialog">
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <HazardDetailDialog v-model="dialog" />
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import HazardDetailDialog from "./HazardDetailDialog.vue";

import { useHazardStore } from "@/store/HazardStore";

const dialog = ref(false);
const search = ref("");
const selectedCategory = ref(null);

const headers = [
  { title: "Description", value: "description" },
  { title: "Status", value: "status_code" },
  { title: "Urgency", value: "urgency_code" },
  { title: "Identified", value: "created_at" },
  { title: "Location", value: "location.name" },
  { title: "Type", value: "type.name" },
];

const hazardStore = useHazardStore();
const { loadHazards, select } = hazardStore;
const { hazards, isLoading, categories } = storeToRefs(hazardStore);

await loadHazards();

function formatDate(input) {
  return DateTime.fromISO(input).toFormat("yyyy-MM-dd");
}

function openDialog(_event, { item }) {
  select(item);
  dialog.value = true;
}
</script>
