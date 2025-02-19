<template>
  <v-card class="default mb-5" v-if="mySupervisorReports && mySupervisorReports.length > 0">
    <v-card-text>
      <h4 class="text-h5 mb-4">Supervisory Reports</h4>

      <v-list
        v-if="mySupervisorReports && mySupervisorReports.length > 0"
        bg-color="#fff"
        class="py-0"
        style="border: 1px #aaa solid"
        rounded>
        <div v-for="(report, idx) of mySupervisorReports">
          <v-list-item
            :title="makeTitle(report)"
            :subtitle="makeSubtitle(report)"
            class="pt-1 pb-2"
            @click="openReportClick(report)">
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

function makeTitle(input: Incident) {
  let title = input.incident_type_description;
  title += ` on ${DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd")}`;
  return title;
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString()).toRelative()}, Status: ${input.status_name}`;
}

function openReportClick(input: Incident) {
  router.push(`/reports/${input.id}`);
}
</script>
