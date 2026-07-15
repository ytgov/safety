<template>
  <div class="text-right">
    <v-menu transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn color="info" v-bind="props" class="my-0" variant="outlined">
          <v-icon class="mr-2">mdi-chevron-down</v-icon> Actions
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-if="isInvestigation" title="Report Investigation" :subtitle="currentStep.step_title"
          @click="showInvestigationDialog = true">
          <template #prepend>
            <v-icon color="green">mdi-eye-check-outline</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="isHazardAssessment" title="Begin Hazard Assessment" :subtitle="currentStep.step_title"
          @click="showHazardDialog = true">
          <template #prepend>
            <v-icon color="green">mdi-eye-check-outline</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="isCommittee" title="Request Committee Review" subtitle="Co-Chair Notification"
          @click="showCommitteeDialog = true">
          <template #prepend>
            <v-icon color="warning">mdi-account-group</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="isNotification" title="Send Notifications" :subtitle="currentStep.step_title"
          @click="showNotificationDialog = true">
          <template #prepend>
            <v-icon color="green">mdi-email</v-icon>
          </template>
        </v-list-item>

        <!-- 
      <v-list-item
        title="Complete Next Step"
        :subtitle="currentStep.step_title"
        @click="completeClick(currentStep)"
        v-else-if="currentStep.id">
        <template #prepend>
          <v-icon color="green">mdi-check-bold</v-icon>
        </template>
      </v-list-item> -->

        <v-list-item v-if="isReview" title="Complete Committee Review" @click="completeReviewClick">
          <template #prepend>
            <v-icon color="green">mdi-check-bold</v-icon>
          </template>
        </v-list-item>

        <v-list-item v-if="canRevert && previousStep.id" title="Revert Previous Step"
          :subtitle="previousStep.step_title" @click="revertClick(previousStep)">
          <template #prepend>
            <v-icon color="error">mdi-arrow-u-left-top-bold</v-icon>
          </template>
        </v-list-item>

        <v-divider v-if="isSystemAdmin" class="mt-1" />
        <v-list-item v-if="isSystemAdmin" title="View Audit History" subtitle="Admin only"
          @click="showAuditHistoryDialog = true">
          <template #prepend>
            <v-icon color="info">mdi-history</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="isSystemAdmin" title="Edit Details" subtitle="Admin only"
          @click="showAdminEditDialog = true">
          <template #prepend>
            <v-icon color="info">mdi-pencil</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="isSystemAdmin" title="Delete" subtitle="This cannot be undone" @click="deleteClick">
          <template #prepend>
            <v-icon color="error">mdi-delete</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>

    <div v-if="selectedReport.status_code != 'Closed'" class="my-3">
      <span class="text-subtitle-2">
        Waiting on:</span>
      <v-btn v-if="isInvestigation" variant="tonal" color="primary" class="ml-3 my-1"
        @click="showInvestigationDialog = true">

        <template #prepend>
          <v-icon class="mt-1">mdi-eye-check-outline</v-icon>
        </template>
        Report Investigation</v-btn>

      <v-btn v-else-if="isNotification" variant="tonal" color="primary" class="ml-3 my-1"
        @click="showNotificationDialog = true">
        <template #prepend>
          <v-icon class="mt-1">mdi-email</v-icon>
        </template>
        Send Notifications</v-btn>

      <v-btn v-else-if="isHazardAssessment" variant="tonal" color="primary" class="ml-3 my-1"
        @click="showHazardDialog = true">
        <template #prepend>
          <v-icon class="mt-1">mdi-eye-check-outline</v-icon>
        </template>
        Begin Hazard Assessment</v-btn>
      <span v-else class="text-subtitle-2"> Completion of {{ currentStep.step_title }}</span>
    </div>

  </div>

  <ConfirmDialog ref="confirm" />

  <InvestigationForm v-model="showInvestigationDialog" :incident="selectedReport" :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description" @complete="completeInvestigation"
    @close="showInvestigationDialog = false" />

  <HazardAssessmentForm v-model="showHazardDialog" :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description" :hazard-report="selectedReport"
    @complete="completeInvestigation" @close="showHazardDialog = false" />

  <NotificationForm v-model="showNotificationDialog" :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description" @complete="completeNotification"
    @close="showNotificationDialog = false" />

  <CommitteeForm v-model="showCommitteeDialog" :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description" :department="selectedReport.department_code"
    @complete="sendToCommittee" @close="showCommitteeDialog = false" />

  <AdminEditForm v-model="showAdminEditDialog" :incident-id="selectedReport.id" @complete="showAdminEditDialog = false"
    @close="showAdminEditDialog = false" />

  <AuditHistoryDialog v-model="showAuditHistoryDialog" :incident-id="selectedReport.id" />
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";
import { router } from "@/routes";

import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";

import ConfirmDialog from "@/components/ConfirmDialog";
import InvestigationForm from "./InvestigationForm.vue";
import NotificationForm from "./NotificationForm.vue";
import CommitteeForm from "./CommitteeForm.vue";
import HazardAssessmentForm from "./HazardAssessmentForm.vue";
import AdminEditForm from "./AdminEditForm.vue";
import AuditHistoryDialog from "./AuditHistoryDialog.vue";

const reportStore = useReportStore();
const { completeStep, revertStep, deleteIncident, completeCommitteeReview } = reportStore;
const { currentStep, selectedReport } = storeToRefs(reportStore);
const userStore = useUserStore();

const { isSystemAdmin } = userStore;
const confirm = ref(null);

const showInvestigationDialog = ref(false);
const showHazardDialog = ref(false);
const showNotificationDialog = ref(false);
const showCommitteeDialog = ref(false);
const showAdminEditDialog = ref(false);
const showAuditHistoryDialog = ref(false);

const previousStep = computed(() => {
  if (selectedReport.value) {
    for (let i = selectedReport.value.steps.length - 1; i > 0; i--) {
      const step = selectedReport.value.steps[i];
      if (step.complete_date) return step;
    }
  }
  return {};
});

const isCommittee = computed(() => {
  if (!selectedReport.value || !selectedReport.value.steps) return false;
  if (selectedReport.value.committee_review_request_date) return false;
  if (selectedReport.value.status_code === "Closed") return false;

  // Committee review can be requested once the investigation step (order 2) is complete
  const investigationStep = selectedReport.value.steps.find((s) => s.order === 2);
  return investigationStep && !!investigationStep.complete_date;
});
const isInvestigation = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;
  return currentStep.value.step_title === "Investigation";
});
const isHazardAssessment = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;
  return currentStep.value.step_title === "Assessment of Hazard";
});
const isNotification = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;
  if (selectedReport.value.committee_review_request_date && !selectedReport.value.committee_review_complete_date) return false;
  // If committee review happened, supervisor must have responded before notification
  if (selectedReport.value.committee_review_complete_date && !selectedReport.value.committee_supervisor_response) return false;
  return currentStep.value.step_title.includes("Notification");
});
const isReview = computed(() => {
  return selectedReport.value.committee_review_request_date && !selectedReport.value.committee_review_complete_date;
});

const isSupervisorUser = computed(() => {
  const relevantReasons = ["supervisor", "Safety Practitioner", "Safety Authority"];
  return selectedReport.value.access.filter((a) => relevantReasons.includes(a.reason)).length > 0;
});

const canRevert = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title) || isNil(previousStep.value)) return false;

  const nonRevertableSteps = ["Control the Hazard", "Controls Implemented", "Control Plan"];
  if (nonRevertableSteps.includes(previousStep.value.step_title)) return false;

  if (isSystemAdmin) return true; // System admins can revert any step
  if (isSupervisorUser.value) return true; // Supervisors can revert steps
  if (isCommittee.value) return false; // Committee steps cannot be reverted

  return false;
});

async function completeClick(step) {
  await completeStep(step);
}
async function completeReviewClick() {
  await completeCommitteeReview();
}
async function revertClick(step) {
  await revertStep(step);
}

async function deleteClick(step) {
  confirm.value.show(
    "Delete Incident",
    "Are you sure you want to delete this incident?",
    async () => {
      await deleteIncident();
      router.push("/");
    },
    () => { }
  );
}

async function completeInvestigation() {
  await completeStep(currentStep.value);
}

async function completeNotification() {
  await completeStep(currentStep.value);
}

async function sendToCommittee() {
  // Committee request only sets the request date; it does not advance the workflow step
}
</script>
