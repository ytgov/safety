<template>
  <v-card v-if="myReports && myReports.length > 0" class="default mb-5">
    <v-card-text>
      <h4 class="text-h5">
        Reports Requiring Attention <small>({{ managedDepartments.join(", ") }})</small>
      </h4>
      <p class="mb-3">Urgent or delayed reports from my department</p>

      <v-list bg-color="#fff" class="py-0" style="border: 1px #aaa solid" rounded>
        <div v-for="(report, idx) of myReports">
          <v-list-item :subtitle="makeSubtitle(report)" class="pt-1 pb-2" @click="openReportClick(report)">
            <template #prepend>
              <v-avatar size="small" class="mx-n2">
                <v-icon v-if="report.urgency_code == 'Critical'" color="#D90000" size="26">mdi-alpha-c-circle</v-icon>
                <v-icon v-else-if="report.urgency_code == 'High'" color="#FF8000" size="26">mdi-alpha-h-circle</v-icon>
                <v-icon v-else-if="report.urgency_code == 'Medium'" color="#f3b228" size="26"
                  >mdi-alpha-m-circle</v-icon
                >
                <v-icon v-else color="green" size="26">mdi-alpha-l-circle</v-icon>
              </v-avatar>
            </template>
            <template #title>
              <strong>{{ report.identifier }}</strong> : {{ report.incident_type_description }} on
              {{ makeDate(report) }}
            </template>
          </v-list-item>
          <v-divider v-if="idx < myReports.length - 1" />
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import { useReportStore, Incident } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";

const router = useRouter();

const userStore = useUserStore();
const { managedDepartments } = storeToRefs(userStore);

const reportStore = useReportStore();
const { loadReportsForRole } = reportStore;

const myReports = ref([] as any[]);

await loadReports();

function makeDate(input: Incident) {
  return DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd");
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString()).toRelative()}, Status: ${input.status_name}`;
}

function openReportClick(input: Incident) {
  router.push(`/reports/${input.slug}`);
}

async function loadReports() {
  myReports.value = await loadReportsForRole(["Safety Authority", "Safety Practitioner"]);
}
</script>
