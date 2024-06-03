<template>
  <v-card class="default">
    <v-card-text>
      <h4 class="text-h5 mb-4">My Reports</h4>

      <v-list v-if="myReports && myReports.length > 0" bg-color="#ddd" style="border: 1px #aaa solid" rounded>
        <div v-for="(report, idx) of myReports" class="">
          <v-list-item :title="makeTitle(report)" :subtitle="makeSubtitle(report)"></v-list-item>
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
import { useReportStore, Report } from "@/store/ReportStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const reportStore = useReportStore();

const { myReports } = storeToRefs(reportStore);
const { initialize } = reportStore;

onMounted(async () => {
  await initialize();
});

function makeTitle(input: Report) {
  let title = "";

  switch (input.eventType) {
    case "incident":
      title += "Incident";
      break;
    case "noloss":
      title += "No Loss Incident (near miss)";
      break;
    case "hazard":
      title += "Hazard Identification";
      break;
    case "refusal":
      title += "Work Refusal";
      break;
    default:
      title += "Type TBD";
  }

  title += ` on ${DateTime.fromISO(input.date.toString()).toFormat("yyyy-MM-dd")}`;

  return title;
}

function makeSubtitle(input: Report) {
  return `Created: ${DateTime.fromISO(input.createDate.toString()).toRelative()}, Status: ${input.status}`;
}
</script>
