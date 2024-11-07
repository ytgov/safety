<template>
  <v-dialog max-width="600px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title class="d-flex"> Investigation </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>
      <v-window v-model="step" style="max-height: 550px; overflow-y: scroll">
        <v-window-item :value="0">
          <v-card-text>
            <p>How did the natural conditions affect the event? Only check those that apply, if any.</p>
            <v-row>
              <v-col cols="4"><v-checkbox label="Congestion" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Weather" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Temperature" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Visibility" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Ventilation" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="1">
          <v-card-text>
            <p>How did external energy sources affect the event? Only check those that apply, if any.</p>
            <v-row>
              <v-col cols="4"><v-checkbox label="Noise / Sound" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Lighting" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Vibration" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Radiation" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Other (please explain)" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="2">
          <v-card-text>
            <p>How did the worker's circumstance affect the event? Only check those that apply, if any.</p>
            <v-row>
              <v-col cols="4"><v-checkbox label="Not Physically Capable" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Lack of Knowledge" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Lack of Skill" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Improper Motivation" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Other (please explain)" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="3">
          <v-card-text>
            <p>
              What processes are missing or not sufficient enough and how did they contribute to the event? Only check
              those that apply, if any.
            </p>
            <v-row>
              <v-col cols="4"><v-checkbox label="Leadership" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Supervision" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Engineering" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Purchasing" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Maintenance" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Tools / Equip / Material" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Work Standards" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Wear & Tear" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Abuse or Misuse" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-checkbox label="Other (please explain)" hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="4">
          <v-card-text>
            <p>
              Root causes are essential system failures that are responsible for starting the series of unsafe acts or
              conditions that lead to the event. Examples of a root cause are that a training program or safe work
              practice doesn't exist to help the worker complete the activity, or there is no preventative maintenance
              program to keep equipment operating properly. There can be more than one root cause.
            </p>
            <v-divider />
            <v-row class="mt-2">
              <v-col cols="4">Root Cause</v-col>
              <v-col>Describe the inadequate process or program that lead to the event</v-col>
            </v-row>
            <v-row class="">
              <v-col cols="4"><v-text-field hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-text-field hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-text-field hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
            <v-row>
              <v-col cols="4"><v-text-field hide-details /></v-col>
              <v-col><v-textarea rows="2" hide-details /></v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-card-text class="d-flex">
        <v-btn :disabled="!isPrev" color="primary" @click="step--">Prev</v-btn>
        <v-spacer />
        <div class="pt-1">Step {{ step + 1 }}: {{ stepName }}</div>
        <v-spacer />
        <v-btn v-if="!isDone" :disabled="!isNext" color="primary" @click="step++">Next</v-btn>
        <v-btn v-else color="success" @click="save">Save</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue";

const emits = defineEmits(["complete", "close"]);

const step = ref(0);
const stepName = computed(() => {
  return steps.value[step.value].name;
});

const steps = ref([
  { name: "Environmental Causes" },
  { name: "Physical Causes" },
  { name: "Personal Causes" },
  { name: "Job or System" },
  { name: "Root Causes" },
  /*   { name: "Corrective Actions" },
  { name: "Substitution" },
  { name: "Engineering" },
  { name: "Administration" },
  { name: "Personal Protective Equipment (PPE)" }, */
]);

const isPrev = computed(() => {
  return step.value > 0;
});
const isNext = computed(() => {
  return step.value < steps.value.length - 1;
});
const isDone = computed(() => {
  return step.value == steps.value.length - 1;
});

function close() {
  emits("close");
  step.value = 0;
}
function save() {
  emits("complete");
  step.value = 0;
}
</script>
