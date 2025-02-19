<template>
  <v-menu transition="slide-y-transition">
    <template v-slot:activator="{ props }">
      <v-btn color="info" v-bind="props" class="my-0" variant="outlined">
        <v-icon class="mr-2">mdi-chevron-down</v-icon> Actions
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-if="isInvestigation"
        title="Begin Investigation"
        :subtitle="currentStep.step_title"
        @click="showInvestigationDialog = true">
        <template #prepend>
          <v-icon color="green">mdi-eye-check-outline</v-icon>
        </template>
      </v-list-item>
      <v-list-item
        v-if="isNotification"
        title="Send Notifications"
        :subtitle="currentStep.step_title"
        @click="showNotificationDialog = true">
        <template #prepend>
          <v-icon color="green">mdi-email</v-icon>
        </template>
      </v-list-item>

      <v-list-item
        title="Complete Next Step"
        :subtitle="currentStep.step_title"
        @click="completeClick(currentStep)"
        v-else-if="currentStep.id">
        <template #prepend>
          <v-icon color="green">mdi-check-bold</v-icon>
        </template>
      </v-list-item>

      <v-list-item
        title="Revert Previous Step"
        :subtitle="previousStep.step_title"
        @click="revertClick(previousStep)"
        v-if="previousStep.id">
        <template #prepend>
          <v-icon color="error">mdi-arrow-u-left-top-bold</v-icon>
        </template>
      </v-list-item>

      <v-divider v-if="isSystemAdmin" class="mt-1" />
      <v-list-item v-if="isSystemAdmin" title="Delete" subtitle="This cannot be undone" @click="deleteClick">
        <template #prepend>
          <v-icon color="error">mdi-delete</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
  <ConfirmDialog ref="confirm" />

  <InvestigationForm
    v-model="showInvestigationDialog"
    :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description"
    @complete="completeInvestigation"
    @close="showInvestigationDialog = false" />

  <NotificationForm
    v-model="showNotificationDialog"
    :incident-id="selectedReport.id"
    :incident_type_description="selectedReport.incident_type_description"
    @complete="completeNotification"
    @close="showNotificationDialog = false" />
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import ConfirmDialog from "@/components/ConfirmDialog";
import { router } from "@/routes";
import InvestigationForm from "./InvestigationForm.vue";
import NotificationForm from "./NotificationForm.vue";
import { isNil } from "lodash";

const reportStore = useReportStore();
const { completeStep, revertStep, deleteIncident } = reportStore;
const { currentStep, selectedReport } = storeToRefs(reportStore);
const userStore = useUserStore();

const { isSystemAdmin } = userStore;
const confirm = ref(null);

const showInvestigationDialog = ref(false);
const showNotificationDialog = ref(false);

const previousStep = computed(() => {
  if (selectedReport.value) {
    for (let i = selectedReport.value.steps.length - 1; i > 0; i--) {
      const step = selectedReport.value.steps[i];
      if (step.complete_date) return step;
    }
  }
  return {};
});

const isInvestigation = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;
  return currentStep.value.step_title === "Investigation";
});

const isNotification = computed(() => {
  if (isNil(currentStep.value) || isNil(currentStep.value.step_title)) return false;
  return currentStep.value.step_title.includes("Notification");
});

async function completeClick(step) {
  await completeStep(step);
}
async function revertClick(step) {
  await revertStep(step);
}
async function deleteClick(step) {
  confirm.value.show("Delete Incident", "Are you sure you want to delete this incident?", async () => {
    await deleteIncident();
    router.push("/");
  });
}

async function completeInvestigation() {
  await completeStep(currentStep.value);
}

async function completeNotification() {
  await completeStep(currentStep.value);
}
</script>
