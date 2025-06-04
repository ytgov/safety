<template>
  <v-breadcrumbs
    :items="[
      { title: 'Home', to: '/' },
      { title: 'Inspections', to: '/inspections' },
      { title: 'Inspection Details' },
    ]" />

  <div v-if="selectedReport">
    <h1 class="text-h4 mb-2">{{ selectedReport.incident_type_description }} Details</h1>
    <div class="my-3" style="clear: both"></div>

    <section class="mb-5">
      <v-row>
        <v-col cols="12" md="12">
          <v-card v-if="!isActionOnly" class="default">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">{{ selectedReport.incident_type_description }} Information</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <v-row>
                <v-col>
                  <v-label>Department</v-label>
                  <v-text-field
                    :value="selectedReport.department_name"
                    append-inner-icon="mdi-lock"
                    readonly></v-text-field>
                </v-col>
                <v-col>
                  <v-label>Reported by</v-label>
                  <v-text-field
                    :value="selectedReport.reporting_person_email"
                    append-inner-icon="mdi-lock"
                    readonly></v-text-field>
                </v-col>
                <v-col>
                  <v-label class="mb-1" style="white-space: inherit">Area</v-label>
                  <v-text-field v-model="selectedReport.location_name" readonly append-inner-icon="mdi-lock" />
                </v-col>
                <v-col>
                  <v-label class="mb-1" style="white-space: inherit">Location</v-label>
                  <v-text-field
                    :model-value="selectedReport.inspection_location_name"
                    readonly
                    append-inner-icon="mdi-lock" />
                </v-col>
              </v-row>

              <div v-if="selectedReport.attachments && selectedReport.attachments.length > 0">
                <v-label>Attachments</v-label>

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
        </v-col>
        <v-col cols="5">
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Identified Hazards</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <InspectionActionList @showAction="doShowActionEdit"></InspectionActionList>

              <v-btn v-if="canAddTask" class="mb-0" size="small" color="info" @click="addTaskClick">Add Hazard</v-btn>

              <ActionDialog
                v-model="showActionEdit"
                :action="actionToEdit"
                :hazard-id="actionToEdit?.hazard_id"
                @doClose="actionReload"></ActionDialog>

              <HazardAssessmentForm
                v-model="showHazardDialog"
                :incident-id="selectedReport.id"
                :incident_type_description="selectedReport.incident_type_description"
                :hazard-report="selectedReport"
                @complete="actionReload"
                @close="showHazardDialog = false" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import { isNil, uniq } from "lodash";

import InspectionActionList from "@/components/action/InspectionActionList.vue";
import ActionDialog from "@/components/action/ActionDialog.vue";
import HazardAssessmentForm from "@/components/incident/HazardAssessmentForm.vue";

import { useInspectionStore } from "@/store/InspectionStore";
import { useUserStore } from "@/store/UserStore";

const inspectionStore = useInspectionStore();
const { initialize, loadReport, updateReport, openAttachment } = inspectionStore;
const { selectedReport } = storeToRefs(inspectionStore);

const route = useRoute();
const reportId = route.params.id;

const actionId = computed(() => {
  return route.query?.action;
});

const selectedAction = computed(() => {
  if (actionId.value && selectedReport.value) {
    return selectedReport.value.actions.filter((a) => a.slug == actionId.value)[0];
  }
});

await initialize();
await loadReport(reportId);

const showActionEdit = ref(false);
const showHazardDialog = ref(false);
const actionToEdit = ref(null);

const userStore = useUserStore();
const { isSystemAdmin, user } = storeToRefs(userStore);

const isReporter = computed(() => {
  return selectedReport.value.access.filter((a) => a.reason == "reporter").length > 0;
});

const isSupervisor = computed(() => {
  const relevantReasons = ["supervisor", "Safety Practitioner", "Safety Authority"];
  return selectedReport.value.access.filter((a) => relevantReasons.includes(a.reason)).length > 0;
});

const isAction = computed(() => {
  return selectedReport.value.access.filter((a) => a.reason == "action").length > 0;
});

const isActionOnly = computed(() => {
  const reasons = uniq(selectedReport.value.access.map((a) => a.reason));
  return reasons.length == 1 && reasons[0] == "action";
});

const canAddTask = computed(() => {
  return false;
  if (isReporter.value || isSystemAdmin.value) return true;

  return false;
});

onMounted(() => {
  if (selectedAction.value) {
    doShowActionEdit(selectedAction.value);
  }
});

const canEdit = computed(() => {
  return isSupervisor.value || isSystemAdmin.value;
});

const canUseActions = computed(() => {
  return isSupervisor.value || isSystemAdmin.value;
});

function actionReload() {
  showActionEdit.value = null;
  showActionEdit.value = false;
  loadReport(reportId);
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd @ h:mma");
}

function doShowActionEdit(action) {
  if (isSupervisor.value || isSystemAdmin.value || isReporter.value) {
    actionToEdit.value = action;
    showActionEdit.value = true;
    return;
  }

  if (action.actor_user_email == user.value.email) {
    actionToEdit.value = action;
    showActionEdit.value = true;
    return;
  }

  alert("You do not have permission to edit this action");
}

async function saveClick() {
  await updateReport().then(() => {
    loadReport(reportId);
  });
}

function openAttachmentClick(attachment) {
  openAttachment(attachment);
}

function addTaskClick() {
  showHazardDialog.value = true;
}
</script>
