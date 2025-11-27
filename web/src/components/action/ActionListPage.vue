<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Actions' }]" />

  <div>
    <div class="float-right"></div>

    <h1 class="text-h4 mb-2">Actions</h1>
    <div class="my-3" style="clear: both"></div>
  </div>

  <v-card class="default mb-5">
    <v-card-text class="pt-5">
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field v-model="search" label="Search" outlined dense clearable prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col cols="12" md="3">
          <ActionStatusSelect v-model="status" label="Status" clearable />
        </v-col>
        <v-col v-if="isSystemAdmin" cols="12" md="3">
          <v-select v-model="review" label="Review" clearable :items="reviewOptions" />
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:items-per-page="perPage"
        :page="page"
        :headers="headers"
        :items="actions"
        :loading="isLoading"
        :items-length="totalCount"
        @update:page="updatePage"
        @click:row="openItem">
        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>
        <template #item.complete_date="{ item }">
          {{ formatDate(item.complete_date) }}
        </template>
        <template #item.status="{ item }">
          <v-chip v-if="item.status.name == 'Complete'" color="success" small>{{ item.status.name }}</v-chip>
          <v-chip v-else-if="item.status.name == 'In Progress'" color="info" small>{{ item.status.name }}</v-chip>
          <v-chip v-else color="error" small>{{ item.status.name }}</v-chip>
        </template>
        <template #item.hazard_review="{ item }">
          {{ item.hazard_review == 1 ? "Hazard" : item.hazard_review == -1 ? "Not Hazard" : "Not Reviewed" }}
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import ActionStatusSelect from "@/components/action/ActionStatusSelect.vue";

import { useActionStore } from "@/store/ActionStore";
import { useUserStore } from "@/store/UserStore";

const router = useRouter();
const userStore = useUserStore();
const { isSystemAdmin } = storeToRefs(userStore);

const page = ref(1);
const perPage = ref(10);

const search = ref(null);
const status = ref(null);
const urgency = ref(null);
const location = ref(null);
const review = ref(null);

const reviewOptions = [
  { title: "Not Reviewed", value: 0 },
  { title: "Hazard", value: 1 },
  { title: "Not Hazard", value: -1 },
];

const headers = computed(() => {
  let value = [
    { title: "Description", value: "description" },
    { title: "Status", value: "status" },
    { title: "Assignee", value: "actor_user_email" },
    { title: "Due Date", value: "due_date" },
    { title: "Completed", value: "complete_date" },
  ];

  if (isSystemAdmin.value) {
    value.push({ title: "Hazard Review", value: "hazard_review" });
  }

  return value;
});

const actionStore = useActionStore();
const { loadActions } = actionStore;
const { actions, totalCount, isLoading } = storeToRefs(actionStore);

reload();

watch([search, status, page, perPage, review], () => {
  reload();
});

async function reload() {
  await loadActions({
    page: page.value,
    perPage: perPage.value,
    search: search.value,
    status: status.value,
    review: review.value,
  });
}

function updatePage(newPage) {
  if (isLoading.value) return;
  page.value = newPage;
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input).toFormat("yyyy-MM-dd");
}

function openItem(event, { item }) {
  if (item.incident_type_id == 6) {
    router.push(`/inspections/${item.incident_slug}?action=${item.slug}`);
    return;
  }

  router.push(`/reports/${item.incident_slug}?action=${item.slug}`);
}
</script>
