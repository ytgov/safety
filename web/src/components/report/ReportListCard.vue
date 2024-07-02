<template>
  <v-card class="default mb-5">
    <v-card-text>
      <h4 class="text-h5 mb-4">My Reports</h4>

      <v-list v-if="myReports && myReports.length > 0" bg-color="#ddd" style="border: 1px #aaa solid" rounded>
        <div v-for="(report, idx) of myReports">
          <v-list-item
            :title="makeTitle(report)"
            :subtitle="makeSubtitle(report)"
            @click="openReportClick(report)"></v-list-item>
          <v-divider v-if="idx < myReports.length - 1" class="mt-2 mb-1" />
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

const reportStore = useReportStore();
const { myReports } = storeToRefs(reportStore);

const router = useRouter();

function makeTitle(input: Incident) {
  let title = input.incident_type_description;
  title += ` on ${DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd")}`;
  return title;
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString(), {
    zone: "America/Whitehorse",
  }).toRelative()}, Status: ${input.status_name}`;
}

function openReportClick(input: Incident) {
  router.push(`/reports/${input.id}`);
}
</script>
