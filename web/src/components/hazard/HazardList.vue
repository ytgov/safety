<template>
  <div v-if="selectedReport">


    <!-- {{ selectedReport.hazards }} -->


    <div v-if="selectedReport.hazards && selectedReport.hazards.length > 0">
      <v-list variant="" lines="2" bg-color="#ffffff00" rounded class="py-0" style="border: 1px #00000066 solid">
        <div v-for="(hazard, idx) of selectedReport.hazards">
          <v-list-item
            :title="hazard.hazard.description"
            :subtitle="`&nbsp; Urgency: ${hazard.hazard.urgency_code}, Status: ${hazard.hazard.status_code}`"
            style="background-color: #ffffff"
            class="pt-3 pb-3">
           <!--  <template #append>
              <v-btn fab class="my-0" color="success" size="x-small" icon="mdi-check"></v-btn>
            </template> -->
          </v-list-item>
          <v-divider v-if="idx < selectedReport.hazards.length - 1" />
        </div>
      </v-list>
    </div>
    <div v-else>The hazard list is currently empty</div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { selectedReport } = storeToRefs(reportStore);
</script>
