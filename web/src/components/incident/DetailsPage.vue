<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Incident Details' }]" />

  <div v-if="selectedReport">
    <div v-if="canUseActions" class="float-right">
      <OperationMenu />
    </div>

    <h1 class="text-h4 mb-2">
      {{ selectedReport.incident_type_description }} Details

      <v-chip
        class="ml-3"
        size="large"
        style="margin-top: -8px"
        :color="selectedReport.status_name == 'Closed' ? 'success' : 'yg_sun'"
        variant="flat">
        <strong>Id:</strong> &nbsp; {{ selectedReport.identifier }}
      </v-chip>

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

    <div v-if="!isActionOnly" class="mb-5" style="background-color: #eee; border: 1px #aaa solid; border-radius: 5px">
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
            :subtitle="makeStepSubtitle(step)">
          </v-stepper-item>
        </v-stepper-header>
      </v-stepper>
    </div>

    <section class="mb-5">
      <v-row>
        <v-col cols="12" md="5">
          <v-card v-if="!isActionOnly" class="default mb-5">
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
              <div v-if="stepperValue < 3 && stepperValue != -1">
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

              <IncidentUserList :incident_id="selectedReport.id" :editable="isSupervisor || isSystemAdmin" />

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

          <v-card class="default mb-5" v-if="isSupervisor || isSystemAdmin || isAction || isCommittee || (isReporter && currentStep.order >= 3)">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Control Plan</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <ActionList @showAction="doShowActionEdit"></ActionList>

              <v-btn v-if="canAddTask" class="mb-0" size="small" color="info" @click="addTaskClick">Add Task</v-btn>

              <ActionDialog
                v-model="showActionEdit"
                :action="actionToEdit"
                :hazard-id="actionToEdit?.hazard_id"
                :readonly="isCommittee"
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

          <v-card class="default mb-5" v-if="hasCommitteeReview">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Committee Control Plan</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <CommitteeActionList @showAction="doShowActionEdit"></CommitteeActionList>

              <v-btn v-if="canAddReviewTask" class="mb-0" size="small" color="info" @click="addReviewTaskClick"
                >Add Task</v-btn
              >

              <CommitteeAssessmentForm
                v-model="showReviewDialog"
                :incident-id="selectedReport.id"
                :incident_type_description="selectedReport.incident_type_description"
                :hazard-report="selectedReport"
                @complete="actionReload"
                @close="showReviewDialog = false" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="!isActionOnly">
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <h4 class="text-h6">What Happened?</h4>
            </v-card-item>

            <v-row class="pa-5 pt-2 pb-6">
              <v-col cols="12" md="12">
                <div v-if="isSystemAdmin">
                  <v-label>Override event type</v-label>
                  <v-select v-model="selectedReport.incident_type_id" :items="incidentTypeOptions" />
                </div>

                <v-label class="mb-1" style="white-space: inherit">Urgency for supervisor attention</v-label>
                <v-btn-toggle
                  v-model="selectedReport.urgency_code"
                  mandatory
                  base-color="#eee"
                  class="mb-4"
                  :border="true"
                  style="width: 100%">
                  <v-btn :readonly="!canEdit" color="green" value="Low" style="width: 33%" class="my-0">Low</v-btn>
                  <v-btn :readonly="!canEdit" color="yellow" value="Medium" style="width: 34%" class="my-0"
                    >Medium</v-btn
                  >
                  <v-btn :readonly="!canEdit" color="#ff4500" value="High" style="width: 33%" class="my-0">High</v-btn>
                  <!-- <v-btn :readonly="!canEdit" color="red" value="Critical" style="width: 25%" class="my-0"
                    >Critical</v-btn
                  > -->
                </v-btn-toggle>

                <v-label class="mb-1" style="white-space: inherit">Description of event</v-label>
                <v-textarea v-model="selectedReport.description" readonly append-inner-icon="mdi-lock" hide-details />

                <div v-if="selectedReport.incident_type_description != 'Hazard'" class="mt-4">
                  <v-label class="mb-1" style="white-space: inherit">General comments</v-label>
                  <v-textarea
                    v-model="selectedReport.investigation_notes"
                    :readonly="!canEdit"
                    :append-inner-icon="canEdit ? '' : 'mdi-lock'"
                    :hint="canEdit ? 'Please do not include names or personal identifiers' : ''"
                    :persistent-hint="canEdit" />
                </div>

                <div
                  v-if="currentStep.step_title == 'Committee Review' || selectedReport.hs_recommendations"
                  class="mt-4">
                  <v-label class="mb-1" style="white-space: inherit"
                    >Health and Safety Committee Recommendations</v-label
                  >
                  <v-textarea
                    v-model="selectedReport.hs_recommendations"
                    :append-inner-icon="
                      (canEdit || isCommittee) && currentStep.step_title == 'Committee Review' ? '' : 'mdi-lock'
                    "
                    readonly
                    hint="Please do not include names or personal identifiers"
                    persistent-hint />
                </div>
              </v-col>

              <v-col v-if="canEdit || (isCommittee && currentStep.step_title == 'Committee Review')" cols="12" md="12">
                <v-btn color="primary" class="my-0" @click="saveClick">Save</v-btn>
              </v-col>
            </v-row>
          </v-card>

          <InvestigationCard
            v-if="selectedReport.investigation && (isSupervisor || isSystemAdmin || isCommittee || isReporter)"
            :investigation="selectedReport.investigation"></InvestigationCard>
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

import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

import OperationMenu from "@/components/incident/OperationMenu.vue";
import ActionList from "@/components/action/ActionList.vue";
import CommitteeActionList from "@/components/action/CommitteeActionList.vue";
import ActionDialog from "@/components/action/ActionDialog.vue";
import InvestigationCard from "./InvestigationCard.vue";
import HazardAssessmentForm from "./HazardAssessmentForm.vue";
import CommitteeAssessmentForm from "./CommitteeAssessmentForm.vue";

import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import IncidentUserList from "./IncidentUserList.vue";

const reportStore = useReportStore();
const { initialize, loadReport, updateReport, openAttachment } = reportStore;
const { selectedReport, currentStep } = storeToRefs(reportStore);

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

const incidentTypeOptions = [
  { title: "Incident", value: 1 },
  { title: "No Loss Incident (near miss)", value: 3 },
  { title: "Hazard", value: 2 },
];

await initialize();
await loadReport(reportId);

const showActionEdit = ref(false);
const showHazardDialog = ref(false);
const showReviewDialog = ref(false);
const actionToEdit = ref(null);

const userStore = useUserStore();
const { isSystemAdmin, user } = storeToRefs(userStore);

const isReporter = computed(() => {
  return selectedReport.value.access.filter((a) => a.reason == "reporter").length > 0;
});

const isCommittee = computed(() => {
  const relevantReasons = ["committee"];
  return selectedReport.value.access.filter((a) => relevantReasons.includes(a.reason)).length > 0;
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

const hasCommitteeReview = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;

  const reviewStep = selectedReport.value.steps.find((step) => {
    return step.step_title.includes("Committee Review");
  });

  return !isNil(reviewStep);
});

const isReview = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;

  const reviewStep = selectedReport.value.steps.find((step) => {
    return step.step_title.includes("Committee Review");
  });

  return !isNil(reviewStep);
});

const canAddTask = computed(() => {
  if (isNil(selectedReport.value) || isNil(currentStep.value)) return false;
  if (!(isSupervisor.value || isSystemAdmin.value)) return false;
  if (selectedReport.value.incident_type_description != "Hazard") return false;

  return currentStep.value.step_title == "Control the Hazard";
});

const canAddReviewTask = computed(() => {
  if (isNil(selectedReport.value) || isNil(currentStep.value)) return false;
  if (selectedReport.value.incident_type_description == "Hazard") return false;
  if (!(isCommittee.value || isSystemAdmin.value)) return false;

  return currentStep.value.step_title == "Committee Review";
});

onMounted(() => {
  if (selectedAction.value) {
    doShowActionEdit(selectedAction.value);
  }
});

function makeStepSubtitle(step) {
  let subtitle = "";
  if (step.complete_date) {
    subtitle = `${formatDate(step.complete_date)} by `;

    if (step.order == 1) {
      if (isSupervisor.value || isReporter.value || isSystemAdmin.value) {
        subtitle += `${step.complete_name}`;
      } else {
        subtitle += `Employee`;
      }
    } else {
      subtitle += `${step.complete_name} `;
    }
    return subtitle;
  }
  return "";
}

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
    for (let i = 1; i < selectedReport.value.steps.length + 1; i++) {
      const step = selectedReport.value.steps[i - 1];

      if (step.complete_date) continue;

      return i;
    }
  }
  return -1;
});

const canEdit = computed(() => {
  return isSupervisor.value || isSystemAdmin.value;
});

const canUseActions = computed(() => {
  return (
    isSupervisor.value ||
    isSystemAdmin.value ||
    (isCommittee.value && currentStep.value.step_title == "Committee Review")
  );
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
  if (isSupervisor.value || isSystemAdmin.value || isCommittee.value) {
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

function addReviewTaskClick() {
  showReviewDialog.value = true;
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
