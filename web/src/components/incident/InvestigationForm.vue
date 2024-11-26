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
            <h3>Contributing Factors</h3>
            <p class="mb-5">
              At times, there is additional information left out of the original report or not precisely identified. The
              field below contains factors that may have had an impact. Please select any that apply or type your own
              and hit 'Enter'.
            </p>

            <v-combobox
              v-model="factors"
              :items="[
                'Weather',
                'Temperature',
                'Ventilation',
                'Visibility',
                'Lighting',
                'Noise/Sound',
                'Vibration',
                'Lack of Knowledge',
                'Supervision',
                'Lack of Maintenance',
              ]"
              label="Select or add all that apply"
              multiple
              chips />

            <p class="mb-5">
              Please describe how these affected the situation or list others that you believe to be relevant.
            </p>

            <v-textarea label="Additional details" rows="4" />
          </v-card-text>
        </v-window-item>
        <v-window-item :value="1">
          <v-card-text>
            <h3>Cause Analysis</h3>
            <p class="mb-5">
              The list below contains the factors you identified on the previous screen. For each one, please estimate
              how much of an impact it had.
            </p>

            <div v-for="factor of factors">
              <v-select :label="factor" :items="['Minimal', 'Moderate', 'Maximum']" />
            </div>
            <p>
              If you can think of any other impacts, please go to the previous screen and add them before proceeding.
            </p>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="2">
          <v-card-text>
            <h3>Additional Information</h3>
            <p class="mb-5">
              If there are any details about this incident missed in the previous screen, you can add them here.
            </p>

            <v-textarea label="Additional details" rows="3" />

            <p>
              Once you click 'Save', the Investigation will be completed and this information will be reviewed by a
              Health and Safety Coordinator in your department.
            </p>
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

const steps = ref([{ name: "Contributing Factors" }, { name: "Cause Analysis" }, { name: "Additional Information" }]);

const factors = ref([]);

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
