<template>
  <v-card class="default mb-5">
    <v-card-text>
      <v-btn
        to="/reports"
        class="my-0 float-right text-subtitle-2"
        color="primary"
        size="small"
        variant="text"
        >All Reports</v-btn
      >
      <h4 class="text-h5 mb-0">My Open Reports</h4>
      <p class="mb-3">Unresolved reports submitted by me</p>

      <v-list
        v-if="myReports && myReports.length > 0"
        bg-color="#fff"
        class="py-0 report‐list"
        style="border: 1px #aaa solid"
        rounded
      >
        <div v-for="(report, idx) of myReports">
          <v-list-item
            :subtitle="makeSubtitle(report)"
            class="pt-1 pb-2"
            @click="openReportClick(report)"
          >
            <template #prepend>
              <v-avatar
                size="small"
                class="mx-n2"
              >
                <v-icon
                  v-if="report.urgency_code === UrgencyCodes.CRITICAL"
                  color="#D90000"
                  size="26"
                  >mdi-alpha-c-circle</v-icon
                >
                <v-icon
                  v-else-if="report.urgency_code === UrgencyCodes.HIGH"
                  color="#FF8000"
                  size="26"
                  >mdi-alpha-h-circle</v-icon
                >
                <v-icon
                  v-else-if="report.urgency_code === UrgencyCodes.MEDIUM"
                  color="#f3b228"
                  size="26"
                  >mdi-alpha-m-circle</v-icon
                >
                <v-icon
                  v-else
                  color="green"
                  size="26"
                  >mdi-alpha-l-circle</v-icon
                >
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

      <div v-else>
        <v-divider class="mb-4" />

        You haven't submitted any reports
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import { useReportStore, Incident, UrgencyCodes } from "@/store/ReportStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const reportStore = useReportStore();
const { myReports } = storeToRefs(reportStore);

const router = useRouter();

function makeDate(input: Incident) {
  return DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd");
}

function makeSubtitle(input: Incident) {
  return `Created: ${DateTime.fromISO(input.created_at.toString(), {
    zone: "UTC",
  }).toRelative()}, Status: ${input.status_name}`;
}

function openReportClick(input: Incident) {
  router.push(`/reports/${input.slug}`);
}
</script>

<style scoped>
.report‐list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
