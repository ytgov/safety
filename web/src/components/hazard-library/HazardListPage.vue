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
          <v-text-field v-model="search" label="Search" outlined dense hide-details clearable prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col cols="12" md="3">
          <HazardStatusSelect v-model="status" label="Status" clearable hide-details/>
        </v-col>
        <v-col cols="12" md="3">
          <HazardUrgencySelect v-model="urgency" label="Urgency" clearable hide-details />
        </v-col>
        <v-col cols="12" md="6">
          <LocationSelect v-model="location" label="Location" clearable hide-details />
        </v-col>
        <v-col cols="12" md="6">
          <HazardCategorySelect v-model="category" label="Category" clearable />
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:items-per-page="perPage"
        :page="page"
        :headers="headers"
        :items="hazards"
        :loading="isLoading"
        :items-length="totalCount"
        @click:row="openDialog"
        @update:page="updatePage">
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
        <template #item.due_date="{ item }">
          <v-chip :color="dueDateColor(item.due_date)" small>{{ item.due_date }}</v-chip>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <HazardDetailDialog v-model="dialog" />
  <ActionCreate v-model="showActionAdd" @doClose="closeDialog"></ActionCreate>

  <ActionEdit v-model="showActionEdit" :action="actionToEdit" :hazard-id="hazardId" @doClose="closeDialog"></ActionEdit>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import HazardDetailDialog from "./HazardDetailDialog.vue";
import HazardStatusSelect from "@/components/hazard/HazardStatusSelect.vue";
import HazardUrgencySelect from "@/components/hazard/HazardUrgencySelect.vue";
import LocationSelect from "@/components/common/LocationSelect.vue";
import ActionCreate from "@/components/action/ActionCreate.vue";
import ActionEdit from "@/components/action/ActionDialog.vue";

import { useHazardStore } from "@/store/HazardStore";
import HazardCategorySelect from "../common/HazardCategorySelect.vue";

const dialog = ref(false);
const showActionAdd = ref(false);
const showActionEdit = ref(false);

const page = ref(1);
const perPage = ref(10);

const search = ref(null);
const status = ref(null);
const urgency = ref(null);
const location = ref(null);
const category = ref(null);

const actionToEdit = ref(null);
const hazardId = ref(null);

const headers = [
  { title: "Due", value: "due_date" },
  { title: "Description", value: "description" },
  { title: "Status", value: "status" },
  { title: "Urgency", value: "urgency_code" },
  { title: "Identified", value: "created_at" },
  { title: "Location", value: "location.name" },
  { title: "Assignee", value: "assigned_to" },
];

const hazardStore = useHazardStore();
const { loadHazards, select } = hazardStore;
const { hazards, totalCount, isLoading, categories } = storeToRefs(hazardStore);

reload();

watch([search, status, urgency, location, category, page, perPage], () => {
  reload();
});

async function reload() {
  await loadHazards({
    page: page.value,
    perPage: perPage.value,
    search: search.value,
    status: status.value,
    urgency: urgency.value,
    location: location.value,
    category: category.value,
  });
}

function updatePage(newPage) {
  if (isLoading.value) return;
  page.value = newPage;
}

function formatDate(input) {
  return DateTime.fromISO(input).toFormat("yyyy-MM-dd");
}

function closeDialog() {
  reload();
  showActionAdd.value = false;
  showActionEdit.value = false;
}

function dueDateColor(dueDate) {
  const now = DateTime.now();
  const date = DateTime.fromISO(dueDate);
  if (date < now) {
    return "error";
  } else if (date.diff(now, "days").days < 2) {
    return "warning";
  } else if (date.diff(now, "days").days < 7) {
    return "info";
  } else {
    return "success";
  }
}

function openDialog(_event, { item }) {
  const actions = item.actions;
  if (actions.length === 0) {
    select(item);
    dialog.value = true;
  } else {
    actionToEdit.value = actions[0];
    hazardId.value = item.id;
    showActionEdit.value = true;
  }
}
</script>
