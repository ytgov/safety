<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Committee Meetings' }]" />

  <div class="d-flex align-center mb-4">
    <h1 class="text-h4">Committee Meetings</h1>
  </div>

  <v-row>
    <v-col cols="12" md="5">
      <v-card class="default">
        <v-card-item class="py-3 px-5 bg-sun">
          <h4 class="text-h6">Start a Meeting</h4>
        </v-card-item>
        <v-card-text class="pt-5">
          <p class="text-body-2 mb-4">
            Start a new committee meeting by choosing the committee, meeting date, and co-chairs. After it's created,
            you can record minutes directly or attach a minutes document.
          </p>
          <v-btn color="primary" prepend-icon="mdi-play" to="/committee-meetings/new">Start Meeting</v-btn>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="7">
      <v-card class="default">
        <v-card-item class="py-3 px-5 bg-sun">
          <h4 class="text-h6">Previous Meetings</h4>
        </v-card-item>
        <v-card-text class="pt-5">
          <v-select v-model="committeeFilter" :items="committeeOptions" item-title="name" item-value="id"
            label="Filter by committee" clearable density="compact" class="mb-2" />

          <v-data-table :headers="headers" :items="filteredMeetings" :loading="isLoading" density="compact"
            @click:row="rowClick">
            <template #item.meeting_date="{ item }">{{ formatDate(item.meeting_date) }}</template>
            <template #item.cochairs="{ item }">{{ formatCochairs(item.cochairs) }}</template>
            <template #item.has_minutes="{ item }">
              <v-icon v-if="item.minutes || item.has_minutes_file" color="success">mdi-check</v-icon>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import { useCommitteeMeetingStore } from "@/store/CommitteeMeetingStore";
import { useCommitteeStore } from "@/store/CommitteeStore";

const router = useRouter();
const meetingStore = useCommitteeMeetingStore();
const committeeStore = useCommitteeStore();
const { meetings, isLoading } = storeToRefs(meetingStore);
const { committees } = storeToRefs(committeeStore);

const committeeFilter = ref(null);

const committeeOptions = computed(() => committees.value || []);

const headers = [
  { title: "Date", key: "meeting_date" },
  { title: "Committee", key: "committee_name" },
  { title: "Co-Chairs", key: "cochairs", sortable: false },
  { title: "Minutes", key: "has_minutes", sortable: false },
];

const filteredMeetings = computed(() => {
  if (!committeeFilter.value) return meetings.value;
  return meetings.value.filter((m) => m.committee_id === committeeFilter.value);
});

onMounted(() => {
  meetingStore.loadAll();
  committeeStore.loadCommittees();
});

function formatDate(d) {
  if (!d) return "";
  return DateTime.fromISO(d).toFormat("yyyy-LL-dd");
}

function formatCochairs(list) {
  if (!list || list.length === 0) return "";
  return list.map((c) => c.display_name || c.email).join(", ");
}

function rowClick(_event, row) {
  router.push(`/committee-meetings/${row.item.id}`);
}
</script>
