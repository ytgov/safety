<template>
  <v-card v-if="mySupervisorReports && mySupervisorReports.length > 0" class="default mb-5">
    <v-card-text>
      <h4 class="text-h5">Supervisory Reports</h4>
      <p class="mb-3">Unresolved reports submitted by my direct reports</p>

      <v-list
        v-if="mySupervisorReports && mySupervisorReports.length > 0"
        bg-color="#fff"
        class="py-0 limit-card-height-400"
        style="border: 1px #aaa solid"
        rounded>
        <div v-for="(report, idx) of mySupervisorReports">
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
          <v-divider v-if="idx < mySupervisorReports.length - 1" />
        </div>
      </v-list>

      <div v-else>
        <v-divider class="mb-4" />

        You haven't submitted any reports
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import { useReportStore, Incident } from "@/store/ReportStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();

const reportStore = useReportStore();

const { mySupervisorReports } = storeToRefs(reportStore);

function makeDate(input: Incident) {
  return DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd");
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString()).toRelative()}, Status: ${input.status_name}`;
}

function openReportClick(input: Incident) {
  router.push(`/reports/${input.slug}`);
}
</script>
