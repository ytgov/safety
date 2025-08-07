<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Reports' }]" />

  <div>
    <div class="float-right"></div>

    <h1 class="text-h4 mb-2">Reports</h1>
    <div class="my-3" style="clear: both"></div>
  </div>

  <v-card class="default mb-5">
    <v-card-text class="pt-5">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field v-model="search" label="Search" outlined dense clearable prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col cols="12" md="2">
          <IncidentStatusSelect v-model="status" label="Status" clearable />
        </v-col>
        <v-col cols="12" md="2">
          <HazardUrgencySelect v-model="urgency" label="Urgency" clearable />
        </v-col>
        <v-col cols="12" md="3">
          <LocationSelect v-model="location" label="Location" clearable />
        </v-col>
        <v-col cols="12" md="auto" class="d-flex justify-end">
          <v-btn
            icon="mdi-table-arrow-down"
            class="my-0"
            size="50"
            title="Export to CSV"
            variant="tonal"
            color="primary"
            @click="csvExportClick"
        ></v-btn>
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
        <template #item.identifier="{ value }">
          <span class="text-no-wrap">{{ value }}</span>
        </template>
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template #item.urgency_code="{ item }">
          <v-chip v-if="item.urgency_code == 'Low'" color="success" small>{{ item.urgency_code }}</v-chip>
          <v-chip v-else-if="item.urgency_code == 'Medium'" color="info" small>{{ item.urgency_code }}</v-chip>
          <v-chip v-else-if="item.urgency_code == 'High'" color="warning" small>{{ item.urgency_code }}</v-chip>
          <v-chip v-else color="error" small>{{ item.urgency_code }}</v-chip>
        </template>
        <template #item.status="{ item }">
          <v-chip v-if="item.status.name == 'Remediated'" color="success" small>{{ item.status.name }}</v-chip>
          <v-chip v-else-if="item.status.name == 'In Progress'" color="info" small>{{ item.status.name }}</v-chip>
          <v-chip v-else color="error" small>{{ item.status.name }}</v-chip>
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

import IncidentStatusSelect from "@/components/incident/IncidentStatusSelect.vue";
import HazardUrgencySelect from "@/components/hazard/HazardUrgencySelect.vue";
import LocationSelect from "@/components/common/LocationSelect.vue";

import { useReportStore } from "@/store/ReportStore";

const router = useRouter();

const page = ref(1);
const perPage = ref(10);

const search = ref(null);
const status = ref(null);
const urgency = ref(null);
const location = ref(null);

const headers = [
  { title: "Id", value: "identifier" },
  { title: "Description", value: "description" },
  { title: "Status", value: "status" },
  { title: "Urgency", value: "urgency_code" },
  { title: "Identified", value: "created_at" },
  { title: "Location", value: "location.name" },
  { title: "Assignee", value: "assigned_to" },
];

const reportStore = useReportStore();
const { loadReports } = reportStore;
const { reports, totalCount, isLoading } = storeToRefs(reportStore);

reload();

watch([search, status, urgency, location, page, perPage], () => {
  reload();
});

async function reload() {
  await loadReports({
    page: page.value,
    perPage: perPage.value,
    search: search.value,
    status: status.value,
    urgency: urgency.value,
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
  router.push(`/reports/${item.slug}`);
}
function csvExportClick() {
  
}
</script>
