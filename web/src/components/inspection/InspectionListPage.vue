<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Inspections' }]" />

  <div>
    <div class="float-right"></div>

    <h1 class="text-h4 mb-2">Inspections</h1>
    <div class="my-3" style="clear: both"></div>
  </div>

  <v-card class="default mb-5">
    <v-card-text class="pt-5">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="search" label="Search" outlined dense clearable prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col cols="12" md="6">
          <LocationSelect v-model="location" label="Location" clearable />
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:items-per-page="perPage"
        :page="page"
        :headers="headers"
        :items="reports"
        :loading="isLoading"
        :items-length="totalCount"
        @update:page="updatePage"
        @click:row="openReport">
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import LocationSelect from "@/components/common/LocationSelect.vue";

import { useInspectionStore } from "@/store/InspectionStore";

const router = useRouter();

const page = ref(1);
const perPage = ref(10);

const search = ref(null);
const location = ref(null);

const headers = [
  { title: "Date", value: "created_at" },
  { title: "Area", value: "location.name" },
  { title: "Location", value: "inspection_location.name" },
  { title: "Inspector", value: "reporting_person_email" },
];

const inspectionStore = useInspectionStore();
const { loadReports } = inspectionStore;
const { reports, totalCount, isLoading } = storeToRefs(inspectionStore);

reload();

watch([search, location, page, perPage], () => {
  reload();
});

async function reload() {
  await loadReports({
    page: page.value,
    perPage: perPage.value,
    search: search.value,
    location: location.value,
  });
}

function updatePage(newPage) {
  if (isLoading.value) return;
  page.value = newPage;
}

function formatDate(input) {
  return DateTime.fromISO(input).toFormat("yyyy-MM-dd");
}

function openReport(event, { item }) {
  router.push(`/inspections/${item.slug}`);
}
</script>
