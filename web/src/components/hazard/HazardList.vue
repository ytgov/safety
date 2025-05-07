<template>
  <div v-if="selectedReport">
    <!-- {{ selectedReport.hazards }} -->

    <div v-if="selectedReport.hazards && selectedReport.hazards.length > 0">
      <v-list bg-color="#ffffff00" rounded class="py-0" style="border: 1px #00000066 solid">
        <div v-for="(hazard, idx) of selectedReport.hazards">
          <v-list-item style="background-color: #ffffff" class="pt-3 pb-3">
            <!--  <template #append>
              <v-btn fab class="my-0" color="success" size="x-small" icon="mdi-check"></v-btn>
            </template> -->
            <h6 class="text-body-1 mt-0 mb-2">Hazard {{ idx + 1 }} ({{ hazard.incident_hazard_type_name }})</h6>

            <table class="info-table" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 150px">Current Status</td>
                <td>{{ hazard.hazard.status_code }}</td>
              </tr>
              <tr>
                <td>General Location</td>
                <td>{{ hazard.hazard.location_name }}</td>
              </tr>
              <tr>
                <td>Specific Location</td>
                <td>{{ hazard.hazard.location_detail }}</td>
              </tr>
              <tr>
                <td>Urgency</td>
                <td>{{ hazard.hazard.urgency_code }}</td>
              </tr>
              <tr>
                <td>Hazard Type</td>
                <td>{{ hazard.hazard.hazard_type_name }}</td>
              </tr>
              <tr>
                <td>First Reported</td>
                <td>{{ formatDate(hazard.hazard.reported_at) }}</td>
              </tr>
              <tr>
                <td>Description</td>
                <td>{{ hazard.hazard.description }}</td>
              </tr>
            </table>
          </v-list-item>
          <v-divider v-if="idx < selectedReport.hazards.length - 1" />
        </div>
      </v-list>
    </div>
    <div v-else>The hazard list is currently empty</div>
  </div>
</template>

<script setup>
import { DateTime } from "luxon";
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { selectedReport } = storeToRefs(reportStore);

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd @ h:mma");
}
</script>

<style>
table.info-table {
  width: 100%;
  border-top: 1px #ccc solid;
  border-left: 1px #ccc solid;
}
table.info-table td {
  border-bottom: 1px #ccc solid;
  border-right: 1px #ccc solid;
  padding: 4px 10px;
}
</style>
