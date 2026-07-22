<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-select v-model="quorum" :items="['Yes', 'No']" label="Did you meet quorum?" :readonly="readonly" />
    </v-col>

    <v-col v-if="quorum == 'No'" cols="12" md="6">
      <v-select v-model="meet_anyway" :items="['Yes', 'No']"
        label="Did you meet anyway for informational purposes?" :readonly="readonly" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field v-model="no_loss_incidents_reviewed" type="number" min="0" :readonly="readonly"
        label="Number of no loss (near miss) incidents reviewed by the committee" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field v-model="loss_incidents_reviewed" type="number" min="0" :readonly="readonly"
        label="Number of loss incidents reviewed by the committee" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field v-model="new_hazards_reviewed" type="number" min="0" :readonly="readonly"
        label="Number of new hazards reviewed by the committee" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select v-model="worker_vacancies" :items="['Yes', 'No']" :readonly="readonly"
        label="Do you currently have any worker member vacancies, as defined by your committee's Rules Of Procedure (ROP)?" />
    </v-col>

    <v-col v-if="worker_vacancies == 'Yes'" cols="12" md="6">
      <v-text-field v-model="worker_vacancy_count" type="number" min="0"
        :readonly="readonly" label="How many worker vacancies do you have?" />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

function patch(changes) {
  emit("update:modelValue", { ...props.modelValue, ...changes });
}

// v-model on a number input hands back a string; the API rejects anything that
// isn't a non-negative integer, so normalize here rather than storing "" or "3".
function field(name, isCount = false) {
  return computed({
    get: () => props.modelValue[name] ?? null,
    set: (value) => {
      if (!isCount) return patch({ [name]: value });
      const trimmed = typeof value === "string" ? value.trim() : value;
      patch({ [name]: trimmed === "" || trimmed === null ? null : Number(trimmed) });
    },
  });
}

const quorum = field("quorum");
const meet_anyway = field("meet_anyway");
const worker_vacancies = field("worker_vacancies");
const no_loss_incidents_reviewed = field("no_loss_incidents_reviewed", true);
const loss_incidents_reviewed = field("loss_incidents_reviewed", true);
const new_hazards_reviewed = field("new_hazards_reviewed", true);
const worker_vacancy_count = field("worker_vacancy_count", true);
</script>
