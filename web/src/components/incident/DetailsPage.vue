<template>
  <div v-if="selectedReport">
    <div class="float-right" v-if="selectedReport.status_name == 'Initial Report'">
      <v-btn color="primary" class="my-0 mt-1" @click="supervisorClick">
        <v-icon class="mr-3">mdi-check</v-icon> Supervisor Signature</v-btn
      >
    </div>

    <h1 class="text-h4 mb-2">
      {{ selectedReport.incident_type_description }} Details <small>({{ selectedReport.status_name }})</small>
    </h1>
    <!-- <h2 class="text-h6">
      Reported on {{ formatDate(selectedReport.created_at) }} by {{ selectedReport.reporting_person_email }}
    </h2> -->

    <v-stepper
      v-model="stepperValue"
      flat
      class="mb-5"
      style="margin-top: -15px; clear: both"
      alt-labels
      hide-actions
      :mobile="false">
      <v-stepper-header>
        <v-stepper-item
          value="1"
          :complete="stepperValue > 0"
          title="Incident Reported"
          :color="stepperValue > 0 ? 'success' : ''"
          :subtitle="formatDate(selectedReport.created_at)">
        </v-stepper-item>
        <v-divider />

        <v-stepper-item
          value="2"
          :complete="stepperValue > 1"
          :color="stepperValue > 1 ? 'success' : ''"
          title="Supervisor Signature">
          <small class="mt-1">{{ lockDate }}</small>
        </v-stepper-item>
        <v-divider />

        <v-stepper-item
          value="3"
          :complete="stepperValue > 2"
          :color="stepperValue > 2 ? 'success' : ''"
          title="HSC Notified">
          <small class="mt-1">{{ uploadDate }}</small>
        </v-stepper-item>
        <v-divider />

        <v-stepper-item
          value="4"
          :complete="stepperValue > 3"
          :color="stepperValue > 3 ? 'success' : ''"
          title="Recommendations">
          <small class="mt-1">{{ financeApproveDate }}</small>
          <small>{{ financeApproveName }}</small>
        </v-stepper-item>
        <v-divider />

        <v-stepper-item
          value="5"
          :complete="stepperValue > 4"
          :color="stepperValue > 4 ? 'success' : ''"
          title="Corrective Actions">
          <small class="mt-1" v-if="stepperValue > 4">Ready to be activated</small>
        </v-stepper-item>
        <v-divider />

        <v-stepper-item
          value="6"
          :complete="stepperValue > 5"
          :color="stepperValue > 5 ? 'success' : ''"
          title="All Parties Notified">
          <small class="mt-1" v-if="stepperValue > 5">Ready to be activated</small>
        </v-stepper-item>
      </v-stepper-header>
    </v-stepper>

    <section class="mb-5">
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">What Happened?</h4>
        </v-card-item>

        <v-row class="pa-5 pb-6">
          <!--  <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">General location where the event occurred</v-label>
            <v-text-field :value="selectedReport.location_code" hide-details />
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">Specific location where the event occurred</v-label>
            <v-text-field v-model="selectedReport.location_detail" hide-details />
          </v-col> -->
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">Description of event</v-label>
            <v-textarea v-model="selectedReport.description" hide-details />
          </v-col>

          <v-col cols="12">
            <v-label>Supervisor</v-label>
            <v-text-field :value="selectedReport.supervisor_email" />

            <div v-if="selectedReport.attachments && selectedReport.attachments.length > 0">
              <v-label>Supporting images</v-label>

              <div class="d-flex pt-2">
                <v-chip color="info" variant="flat" v-for="attach of selectedReport.attachments" class="mr-3">{{
                  attach.file_name
                }}</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </section>

    <v-row class="mb-5">
      <v-col cols="12" md="6">
        <v-card class="default">
          <v-card-item class="py-4 px-6 mb-2 bg-sun">
            <h4 class="text-h6">History</h4>
          </v-card-item>
          <v-card-text class="pt-5"> List if actions </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="default">
          <v-card-item class="py-4 px-6 mb-2 bg-sun">
            <h4 class="text-h6">Audit History</h4>
          </v-card-item>
          <v-card-text class="pt-5"> List of changes </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="default">
      <v-card-item class="py-4 px-6 mb-2 bg-sun">
        <h4 class="text-h6">Urgency</h4>
      </v-card-item>
      <v-card-text class="pt-5"> </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";

import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { initialize, loadReport } = reportStore;
const { locations, urgencies, selectedReport } = storeToRefs(reportStore);

const router = useRoute();
const reportId = router.params.id;

await initialize();
await loadReport(reportId);

const stepperValue = computed(() => {
  if (!selectedReport.value) return 0;

  if (selectedReport.value.status_name == "Initial Report") return 1;
  if (selectedReport.value.status_name == "Supervisor Review") return 2;

  return 0;
});

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("MMMM dd, yyyy");
}

function supervisorClick() {
  selectedReport.value.status_code = "SUP";
  selectedReport.value.status_name = "Supervisor Review";
}
</script>
