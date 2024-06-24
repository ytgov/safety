<template>
  <v-card class="default mb-5">
    <v-card-text>
      <h4 class="text-h5 mb-4">Supervior Reports</h4>

      <v-list v-if="mySupervisorReports && mySupervisorReports.length > 0" bg-color="#ddd" style="border: 1px #aaa solid" rounded>
        <div v-for="(report, idx) of mySupervisorReports" class="">
          <v-list-item :title="makeTitle(report)" :subtitle="makeSubtitle(report)"></v-list-item>
          <v-divider v-if="idx < mySupervisorReports.length - 1" class="mt-2 mb-1" />
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
import { useReportStore, Report } from "@/store/ReportStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const reportStore = useReportStore();

const { mySupervisorReports } = storeToRefs(reportStore);

function makeTitle(input: Incident) {
  let title = input.incident_type_description;
  title += ` on ${DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd")}`;
  return title;
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString()).toRelative()}, Status: ${input.status_name}`;
}
</script>
