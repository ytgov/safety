<template>
  <h1 class="text-h4">Inspection</h1>
  <p class="text-body-2">After you conduct an inspection in the workplace, report the details here.</p>

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
              <DateTimeSelector v-model="report.date" hide-details :readonly="!isNil(selectedReport)">
              </DateTimeSelector>
            </v-col>

            <v-col cols="12" sm="8">
              <v-label class="mb-1" style="white-space: inherit">Department responsible</v-label>

              <v-autocomplete v-model="report.department_code" :items="departments" item-title="name" item-value="code"
                hide-details :readonly="!isNil(selectedReport)" :rules="[requiredRule]"
                @update:model-value="report.inspection_location_id = null" />
            </v-col>

            <v-col cols="12" sm="4">
              <v-label class="mb-1" style="white-space: inherit">Area (optional)</v-label>
              <v-select v-model="selectedBranch" :items="branchOptions" :disabled="isNil(report.department_code)"
                :readonly="!isNil(selectedReport)" clearable
                @update:model-value="report.inspection_location_id = null" />
            </v-col>
            <v-col cols="12" sm="8">
              <v-label class="mb-1" style="white-space: inherit">Location</v-label>
              <InspectionLocationSelector v-model="report.inspection_location_id"
                :disabled="isNil(report.department_code)" :department="report.department_code"
                :branch="selectedBranch"
                :readonly="!isNil(selectedReport)" :rules="[requiredRule]" />
            </v-col>
          </v-row>

          <v-label>Attachments</v-label>
          <v-file-input v-model="pendingFiles" prepend-icon="" prepend-inner-icon="mdi-paperclip"
            :readonly="!isNil(selectedReport)" :clearable="false" multiple
            hide-details></v-file-input>

          <div v-if="attachedFiles.length > 0" class="mt-3 mb-2">
            <v-chip v-for="(file, idx) in attachedFiles" :key="`${file.name}-${idx}`" class="mr-2 mb-2" color="info"
              :closable="isNil(selectedReport)" @click:close="removeAttachedFile(idx)">
              {{ file.name }}
            </v-chip>
          </div>

          <p>
            If you have attachments associated with this Inspection, they need to be uploaded before you click "Report
            Inspection".
          </p>

          <div v-if="!selectedReport || !selectedReport.slug" class="d-flex">
            <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Report Inspection</v-btn>
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

            <v-list v-if="actions.length > 0" bg-color="#fff" class="py-0" style="border: 1px #aaa solid" rounded>
              <div v-for="(action, idx) of actions">
                <v-list-item class="pt-2 pb-2" :title="makeTitle(action)" :subtitle="makeSubtitle(action)"
                  @click="openOtherActionDialog(action)">
                  <template #prepend>
                    <v-avatar size="small" class="mx-n2">
                      <v-icon v-if="action.urgency_code == 'Critical'" color="#D90000"
                        size="26">mdi-alpha-c-circle</v-icon>
                      <v-icon v-else-if="action.urgency_code == 'High'" color="#FF8000"
                        size="26">mdi-alpha-h-circle</v-icon>
                      <v-icon v-else-if="action.urgency_code == 'Medium'" color="#f3b228"
                        size="26">mdi-alpha-m-circle</v-icon>
                      <v-icon v-else color="green" size="26">mdi-alpha-l-circle</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-divider v-if="idx < actions.length - 1" />
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

          <v-btn class="mb-0" color="warning" @click="openConfirmationDialogAndGoToInspectionsPage">Complete
            Inspection</v-btn>
        </div>
        <InspectionActionList class="mt-5" @showAction="doShowActionEdit"></InspectionActionList>

        <ActionDialog v-model="showActionEdit" :action="actionToEdit" @doClose="actionReload"></ActionDialog>

        <HazardAssessmentForm v-model="showHazardDialog" :incident-id="selectedReport.id"
          incident_type_description="Inspection: " :hazard-report="selectedReport" @complete="actionReload"
          @close="showHazardDialog = false" />
      </v-col>
    </v-row>
  </v-form>
  <ConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";

import { useInspectionStore } from "@/store/InspectionStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { useDepartmentStore } from "@/store/DepartmentStore";
import { useHazardStore } from "@/store/HazardStore";
import { useApiStore } from "@/store/ApiStore";
import { INSPECTION_LOCATION_URL } from "@/urls";

import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { requiredRule } from "@/utils/validation";
import ActionDialog from "../action/ActionDialog.vue";
import DateTimeSelector from "@/components/DateTimeSelector.vue";
import InspectionLocationSelector from "../InspectionLocationSelector.vue";
import InspectionActionList from "@/components/action/InspectionActionList.vue";
import HazardAssessmentForm from "@/components/incident/HazardAssessmentForm.vue";
import { useActionStore } from "@/store/ActionStore";

const inspectionStore = useInspectionStore();
const { initialize, addInspection, loadReport } = inspectionStore;
const { selectedReport } = storeToRefs(inspectionStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const departmentStore = useDepartmentStore();
const { initialize: initDepartments } = departmentStore;
const { departments } = storeToRefs(departmentStore);

const actionStore = useActionStore()
const { loadActions, clear } = actionStore;
const { actions } = storeToRefs(actionStore);

const apiStore = useApiStore();
const isValid = ref(false);
const selectedBranch = ref(null);
const branchOptions = ref([]);

const confirmDialog = ref(null);
const router = useRouter();

const showActionEdit = ref(false);
const actionToEdit = ref(null);
const showHazardDialog = ref(false);

await initialize();
await initDepartments();
await clear();

async function reload() {
  await loadActions({
    page: 1,
    perPage: 100,
    inspection_location_id: report.value.inspection_location_id,
    status: ["Open", "In Progress"],
  })
}

const report = ref({ eventType: null, date: new Date(), urgency: "Medium", location_code: "WHI" });
const pendingFiles = ref([]);
const attachedFiles = ref([]);

watch(pendingFiles, (newFiles) => {
  if (!newFiles || newFiles.length === 0) return;
  const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
  attachedFiles.value = [...attachedFiles.value, ...filesArray];
  pendingFiles.value = [];
});

function removeAttachedFile(idx) {
  attachedFiles.value = attachedFiles.value.filter((_, i) => i !== idx);
}

watch(
  () => report.value.department_code,
  async (newValue) => {
    selectedBranch.value = null;
    branchOptions.value = [];
    if (newValue) {
      const resp = await apiStore.secureCall("get", `${INSPECTION_LOCATION_URL}/branches/${newValue}`);
      if (resp && resp.data) {
        branchOptions.value = resp.data;
      }
    }
  }
);

watch(
  () => report.value.location_code,
  (newValue) => {
    if (newValue) reload();
  }
);

watch(
  () => report.value.inspection_location_id,
  (newValue) => {
    if (newValue) reload();
  }
);

const canSave = computed(() => {
  if (
    isNil(report.value) ||
    isNil(report.value.date) ||
    isNil(report.value.location_code) ||
    isNil(report.value.department_code) ||
    isNil(report.value.inspection_location_id)
  )
    return false;

  return true;
});

async function saveReport() {
  report.value.createDate = new Date();
  report.value.files = attachedFiles.value;
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

function openConfirmationDialogAndGoToInspectionsPage() {
  confirmDialog.value.show(
    "Complete Inspection",
    `Please click 'Confirm' only if you have added all relevant Hazards. You cannot add additional Hazards after the Inspection has been completed.`,
    () => {
      router.push("/inspections");
    },
    () => { }
  );
}

function openOtherActionDialog(action) {
  const hazardAction = action.actions[0];

  doShowActionEdit(hazardAction);
}
</script>
