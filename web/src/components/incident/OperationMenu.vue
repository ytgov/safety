<template>
  <v-menu transition="slide-y-transition">
    <template v-slot:activator="{ props }">
      <v-btn color="info" v-bind="props" class="my-0" variant="outlined">
        <v-icon class="mr-2">mdi-chevron-down</v-icon> Actions
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        title="Complete Next Step"
        :subtitle="currentStep.step_title"
        @click="completeClick(currentStep)"
        v-if="currentStep.id">
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
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { completeStep, revertStep } = reportStore;
const { currentStep, selectedReport } = storeToRefs(reportStore);

const previousStep = computed(() => {
  if (selectedReport.value) {
    for (let i = selectedReport.value.steps.length - 1; i > 0; i--) {
      const step = selectedReport.value.steps[i];
      if (step.complete_date) return step;
    }
  }
  return {};
});

async function completeClick(step) {
  await completeStep(step);
}
async function revertClick(step) {
  await revertStep(step);
}
</script>
