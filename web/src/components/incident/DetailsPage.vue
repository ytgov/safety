<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Incident Details' }]" />

  <div v-if="selectedReport">
    <div class="float-right">
      <OperationMenu />
    </div>

    <h1 class="text-h4 mb-2">
      {{ selectedReport.incident_type_description }} Details
      <v-chip
        class="ml-3"
        size="large"
        style="margin-top: -8px"
        :color="selectedReport.status_name == 'Closed' ? 'success' : 'yg_zinc'"
        variant="flat">
        <strong>Status:</strong> &nbsp; {{ selectedReport.status_name }}
      </v-chip>
    </h1>
    <div class="my-3" style="clear: both"></div>

    <!-- <h2 class="text-h6">
      Reported on {{ formatDate(selectedReport.created_at) }} by {{ selectedReport.reporting_person_email }}
    </h2> -->

    <div class="mb-5" style="background-color: #eee; border: 1px #aaa solid; border-radius: 5px">
      <!-- {{ selectedReport.steps }} -->

      <v-stepper-vertical v-if="smAndDown" hide-actions>
        <v-stepper-vertical-item
          v-for="(step, idx) of selectedReport.steps"
          :value="idx + 1"
          :complete="!isNil(step.complete_date)"
          :title="step.step_title"
          :color="step.complete_date ? 'success' : ''"
          :subtitle="step.complete_date ? `${formatDate(step.complete_date)} by ${step.complete_name}` : ''">
        </v-stepper-vertical-item>
      </v-stepper-vertical>

      <v-stepper
        v-else
        v-model="stepperValue"
        flat
        alt-labels
        style="clear: both"
        bg-color="#ffffff00"
        :class="{ unpadded: !smAndDown }">
        <v-stepper-header>
          <v-stepper-item
            v-for="(step, idx) of selectedReport.steps"
            :value="idx + 1"
            :complete="!isNil(step.complete_date)"
            :title="step.step_title"
            :color="step.complete_date ? 'success' : ''"
            :subtitle="step.complete_date ? `${formatDate(step.complete_date)} by ${step.complete_name}` : ''">
          </v-stepper-item>
        </v-stepper-header>
      </v-stepper>
    </div>

    <section class="mb-5">
      <v-row>
        <v-col cols="12" md="5">
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">{{ selectedReport.incident_type_description }} Information</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <v-label>Department</v-label>
              <v-text-field
                :value="selectedReport.department_name"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>

              <div v-if="stepperValue < 3">
                <v-label>Reported by</v-label>
                <v-text-field
                  :value="selectedReport.reporting_person_email"
                  append-inner-icon="mdi-lock"
                  readonly></v-text-field>
              </div>

              <v-label>Supervisor</v-label>
              <v-text-field
                :value="selectedReport.supervisor_email"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>

              <v-label>Alternate Supervisor</v-label>
              <v-text-field
                :value="selectedReport.supervisor_alt_email"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>

              <v-label class="mb-1" style="white-space: inherit">General location</v-label>
              <v-text-field v-model="selectedReport.location_name" readonly append-inner-icon="mdi-lock" />

              <v-label class="mb-1" style="white-space: inherit">Specific location</v-label>
              <v-text-field v-model="selectedReport.location_detail" readonly append-inner-icon="mdi-lock" />

              <div v-if="selectedReport.attachments && selectedReport.attachments.length > 0">
                <v-label>Supporting images</v-label>

                <div class="d-flex pt-2">
                  <v-chip
                    color="info"
                    variant="flat"
                    v-for="attach of selectedReport.attachments"
                    class="mr-3"
                    @click="openAttachmentClick(attach)">
                    <v-icon class="mr-3">mdi-camera</v-icon>
                    {{ attach.file_name }}</v-chip
                  >
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Control Plan</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <ActionList @showAction="doShowActionEdit"></ActionList>

              <ActionCreate v-model="showActionAdd" @doClose="showActionAdd = false"></ActionCreate>

              <ActionEdit
                v-model="showActionEdit"
                :action="actionToEdit"
                :hazard-id="actionToEdit?.hazard_id"
                @doClose="showActionEdit = false"></ActionEdit>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <h4 class="text-h6">What Happened?</h4>
            </v-card-item>

            <v-row class="pa-5 pt-2 pb-6">
              <v-col cols="12" md="12">
                <v-label class="mb-1" style="white-space: inherit">Description of event</v-label>
                <v-textarea v-model="selectedReport.description" readonly append-inner-icon="mdi-lock" />

                <!-- <v-label class="mb-1" style="white-space: inherit">Additional information (from employee)</v-label>
                <v-textarea v-model="selectedReport.additional_description" hide-details /> -->

                <div v-if="selectedReport.incident_type_description != 'Hazard'" class="mt-5">
                  <v-label class="mb-1" style="white-space: inherit">General comments</v-label>
                  <v-textarea v-model="selectedReport.investigation_notes" hide-details />
                </div>
              </v-col>

              <v-col cols="12" md="12">
                <v-btn color="primary" class="mb-0 mt-0" @click="saveClick">Save</v-btn>
              </v-col>
            </v-row>
          </v-card>

          <InvestigationCard
            v-if="selectedReport.investigation"
            :investigation="selectedReport.investigation"></InvestigationCard>
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import { isNil } from "lodash";

import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

import OperationMenu from "@/components/incident/OperationMenu.vue";
import ActionList from "@/components/action/ActionList.vue";
import ActionCreate from "@/components/action/ActionCreate.vue";
import ActionEdit from "@/components/action/ActionEdit.vue";
import InvestigationCard from "./InvestigationCard.vue";

import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { initialize, loadReport, updateReport, openAttachment, completeStep } = reportStore;
const { currentStep, selectedReport } = storeToRefs(reportStore);

const router = useRoute();
const reportId = router.params.id;

await initialize();
await loadReport(reportId);

const showInvestigationDialog = ref(false);

const showActionAdd = ref(false);
const showActionEdit = ref(false);
const actionToEdit = ref(null);

setTimeout(() => {
  let list = document.getElementsByClassName("v-stepper-item");

  for (let i = 0; i < list.length - 1; i++) {
    let item = list[i];
    let hr = document.createElement("hr");
    hr.classList.add("v-divider");
    hr.classList.add("v-theme--light");
    hr.setAttribute("area-orientation", "horizontal");
    hr.setAttribute("role", "separator");
    item.after(hr);
  }
}, 100);

const stepperValue = computed(() => {
  if (selectedReport.value) {
    for (let i = 1; i < selectedReport.value.steps.length; i++) {
      const step = selectedReport.value.steps[i - 1];

      if (step.complete_date) continue;

      return i;
    }
  }
  return 0;
});

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd @ h:ma");
}

function doShowActionEdit(action) {
  actionToEdit.value = action;
  showActionEdit.value = true;
}

async function saveClick() {
  await updateReport().then(() => {});
}
/* 
function investigationClick() {
  showInvestigationDialog.value = true;
}

async function completeInvestigation() {
  if (currentStep.value) {
    await completeStep(currentStep.value);
    showInvestigationDialog.value = false;
  }
} */

function openAttachmentClick(attachment) {
  openAttachment(attachment);
}
</script>

<style>
.v-stepper-item {
  opacity: 0.9 !important;
  padding-left: 5px !important;
  padding-right: 5px !important;
}
.unpadded .v-stepper-item:first-of-type {
  padding-left: 5px !important;
}
.unpadded .v-stepper-item:last-of-type {
  padding-right: 5px !important;
}
.v-expansion-panel .v-expansion-panel-text {
  display: none;
}
</style>
