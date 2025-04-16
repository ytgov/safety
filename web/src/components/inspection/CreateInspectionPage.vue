<template>
  <h1 class="text-h4">Inspection</h1>
  <p class="text-body-2">
    When you perform an inspection, enter the Inspection Details, then click "Start Inspection". Once the inpection is
    created, you can add identified Hazards to this inspection, upload a document or just mark it complete.
  </p>

  <v-form class="mt-6" v-model="isValid">
    <v-card class="default mb-5">
      <v-card-item class="py-4 px-6 mb-2 bg-sun">
        <h4 class="text-h6">Inspection Details</h4>
      </v-card-item>

      <v-row class="pa-5 pb-6">
        <v-col cols="12" md="12" class="pb-1">
          <v-row>
            <v-col cols="12" sm="4">
              <v-label class="mb-1" style="white-space: inherit">Date and time of inspection</v-label>
              <DateTimeSelector
                v-model="report.date"
                hide-details
                :readonly="!isNil(selectedReport)"></DateTimeSelector>
            </v-col>

            <v-col cols="12" sm="4">
              <v-label class="mb-1" style="white-space: inherit">General location of inspection</v-label>
              <v-autocomplete
                v-model="report.location_code"
                :items="locations"
                item-title="name"
                item-value="code"
                hide-details
                :readonly="!isNil(selectedReport)"
                :rules="[requiredRule]" />
            </v-col>

            <v-col cols="12" sm="4">
              <v-label class="mb-1" style="white-space: inherit">Department responsible</v-label>

              <v-autocomplete
                v-model="report.department_code"
                :items="departments"
                item-title="name"
                item-value="code"
                :readonly="!isNil(selectedReport)"
                :rules="[requiredRule]" />
            </v-col>
          </v-row>

          <v-label>Attachments</v-label>
          <v-file-input
            v-model="report.files"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            chips
            :readonly="!isNil(selectedReport)"
            :clearable="isNil(selectedReport)"
            multiple></v-file-input>

          <div v-if="!selectedReport || !selectedReport.slug" class="d-flex">
            <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Start Inspection</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col cols="6">
        <v-card class="default mb-5">
          <v-card-text>
            <h4 class="text-h5 mb-0">Non-Remediated Hazards</h4>
            <p class="mb-3">Identified in this location</p>

            <v-list v-if="hazards.length > 0" bg-color="#fff" class="py-0" style="border: 1px #aaa solid" rounded>
              <div v-for="(hazard, idx) of hazards">
                <v-list-item class="pt-2 pb-2" :title="makeTitle(hazard)" :subtitle="makeSubtitle(hazard)">
                  <template #prepend>
                    <v-avatar size="small" class="mx-n2">
                      <v-icon v-if="hazard.urgency_code == 'Critical'" color="#D90000" size="26"
                        >mdi-alpha-c-circle</v-icon
                      >
                      <v-icon v-else-if="hazard.urgency_code == 'High'" color="#FF8000" size="26"
                        >mdi-alpha-h-circle</v-icon
                      >
                      <v-icon v-else-if="hazard.urgency_code == 'Medium'" color="#f3b228" size="26"
                        >mdi-alpha-m-circle</v-icon
                      >
                      <v-icon v-else color="green" size="26">mdi-alpha-l-circle</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-divider v-if="idx < hazards.length - 1" />
              </div>
            </v-list>
            <div v-else>No non-remediated hazards found in this location</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="selectedReport && selectedReport.slug" cols="6">
        <div class="d-flex">
          <v-btn class="mb-0" color="info" @click="addTaskClick">Add Hazard</v-btn>
          <v-spacer />

          <v-btn class="mb-0" color="warning" to="/inspections">Complete Inspection</v-btn>
        </div>
        <InspectionActionList class="mt-5" @showAction="doShowActionEdit"></InspectionActionList>

        <ActionDialog v-model="showActionEdit" :action="actionToEdit" @doClose="actionReload"></ActionDialog>

        <HazardAssessmentForm
          v-model="showHazardDialog"
          :incident-id="selectedReport.id"
          incident_type_description="Inspection: "
          :hazard-report="selectedReport"
          @complete="actionReload"
          @close="showHazardDialog = false" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";
import { DateTime } from "luxon";

import { useInspectionStore } from "@/store/InspectionStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { useDepartmentStore } from "@/store/DepartmentStore";
import { useHazardStore } from "@/store/HazardStore";

import DateTimeSelector from "@/components/DateTimeSelector.vue";
import { requiredRule } from "@/utils/validation";
import HazardAssessmentForm from "@/components/incident/HazardAssessmentForm.vue";
import InspectionActionList from "@/components/action/InspectionActionList.vue";
import ActionDialog from "../action/ActionDialog.vue";

const inspectionStore = useInspectionStore();
const { initialize, addInspection, loadReport } = inspectionStore;
const { locations, selectedReport } = storeToRefs(inspectionStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const departmentStore = useDepartmentStore();
const { initialize: initDepartments } = departmentStore;
const { departments } = storeToRefs(departmentStore);

const hazardStore = useHazardStore();
const { loadHazards } = hazardStore;
const { hazards } = storeToRefs(hazardStore);

const isValid = ref(false);

const showActionEdit = ref(false);
const actionToEdit = ref(null);
const showHazardDialog = ref(false);

await initialize();
await initDepartments();

async function reload() {
  await loadHazards({
    page: 1,
    perPage: 100,
    location: report.value.location_code,
    status: ["Open", "InPro"],
  });
}

const report = ref({ eventType: null, date: new Date(), urgency: "Medium" });

watch(
  () => report.value.location_code,
  (newValue) => {
    if (newValue) reload();
  }
);

const canSave = computed(() => {
  if (
    isNil(report.value) ||
    isNil(report.value.date) ||
    isNil(report.value.location_code) ||
    isNil(report.value.department_code)
  )
    return false;

  return true;
});

async function saveReport() {
  report.value.createDate = new Date();
  showOverlay();

  await addInspection(report.value).then(async (resp) => {
    await loadReport(resp.data.slug);
    hideOverlay();
  });
}

function makeTitle(input) {
  let title = input.description;
  title += ` on ${DateTime.fromISO(input.created_at.toString()).toFormat("yyyy-MM-dd")}`;
  return title;
}

function makeSubtitle(input) {
  return `Created: ${DateTime.fromISO(input.created_at.toString(), {
    zone: "UTC",
  }).toRelative()}, Status: ${input.status.name}`;
}
function addTaskClick() {
  showHazardDialog.value = true;
}

async function actionReload() {
  if (selectedReport.value && selectedReport.value.slug) await loadReport(selectedReport.value.slug);

  showActionEdit.value = false;
}

function doShowActionEdit(action) {
  actionToEdit.value = action;
  showActionEdit.value = true;
}
</script>
