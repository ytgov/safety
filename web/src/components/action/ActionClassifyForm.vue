<template>
  <div class="px-2">
    <v-window v-model="setupStep" style="max-height: 550px; overflow-y: auto">
      <v-window-item :value="0">
        <v-card-text>
          <h3>{{ currentStep.title }}</h3>

          <div class="d-flex">
            <v-checkbox v-model="action.categories" value="Chemical" hide-details density="compact" label="Chemical" />
            <v-tooltip location="bottom right" width="600" open-delay="250">
              <template #activator="{ props }">
                <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" v-bind="props">mdi-information</v-icon>
              </template>
              Examples: Chemical Asbestos, chemical storage, chemicals, dust/smoke/fumes, lead paint, mists and vapours,
              radon gas
            </v-tooltip>
          </div>

          <div class="d-flex">
            <v-checkbox
              v-model="action.categories"
              value="Biological"
              hide-details
              density="compact"
              label="Biological" />
            <v-tooltip location="bottom right" width="600" open-delay="250">
              <template #activator="{ props }">
                <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" v-bind="props">mdi-information</v-icon>
              </template>
              Examples: Blood and bodily fluids, human waste, insect/animal bite, medical waste, mold, viruses/bacteria
            </v-tooltip>
          </div>

          <div class="d-flex">
            <v-checkbox
              v-model="action.categories"
              value="Ergonomic"
              hide-details
              density="compact"
              label="Ergonomic" />
            <v-tooltip location="bottom right" width="600" open-delay="250">
              <template #activator="{ props }">
                <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" v-bind="props">mdi-information</v-icon>
              </template>
              Examples: Improper lifting, improper workstations, repetitive activity, strenuous activity
            </v-tooltip>
          </div>

          <div class="d-flex">
            <v-checkbox
              v-model="action.categories"
              value="Physical Conditions"
              hide-details
              density="compact"
              label="Physical Conditions" />

            <v-tooltip location="bottom right" width="600" open-delay="250">
              <template #activator="{ props }">
                <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" v-bind="props">mdi-information</v-icon>
              </template>
              Examples: Electrical, temperature, humidity, fire/explosion potential, housekeeping, lighting, pressure
              systems, road conditions, slippery or uneven surface, vibration, wildlife, working alone
            </v-tooltip>
          </div>

          <div class="d-flex">
            <v-checkbox v-model="action.categories" value="Safety" hide-details density="compact" label="Safety" />
            <v-tooltip location="bottom right" width="600" open-delay="250">
              <template #activator="{ props }">
                <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" style="opacity: 1" v-bind="props"
                  >mdi-information</v-icon
                >
              </template>
              Examples: Blocked exit routes, confined space, falling from heights, falling items, faulty equipment,
              machinery in motion, overhead hazard, pinch/nip points, sharp objects
            </v-tooltip>
          </div>
        </v-card-text>
      </v-window-item>

      <v-window-item :value="1">
        <v-card-text>
          <h3>{{ currentStep.title }}</h3>

          <p class="mb-4">
            Use the matrix below and select the cell that best fits this risk's likelihood and consequence.
          </p>
          <table class="score-table">
            <tr>
              <td rowspan="2" style="text-align: left; font-weight: bold; font-size: 1rem">Likelihood</td>
              <td colspan="5" style="font-weight: bold; font-size: 1rem">Consequence</td>
            </tr>
            <tr>
              <td>Insignificant</td>
              <td>Minor</td>
              <td>Moderate</td>
              <td>Major</td>
              <td>Catastrophic</td>
            </tr>
            <tr>
              <td style="width: 125px; text-align: left">Almost Certain</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="orange" @click="selectPriority('High')">H</td>
              <td class="orange" @click="selectPriority('High')">H</td>
              <td class="red" @click="selectPriority('Critical')">C</td>
              <td class="red" @click="selectPriority('Critical')">C</td>
            </tr>
            <tr>
              <td style="text-align: left">Likely</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="orange" @click="selectPriority('High')">H</td>
              <td class="orange" @click="selectPriority('High')">H</td>
              <td class="red" @click="selectPriority('Critical')">C</td>
            </tr>
            <tr>
              <td style="text-align: left">Possible</td>
              <td class="green" @click="selectPriority('Low')">L</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="orange" @click="selectPriority('High')">H</td>
              <td class="red" @click="selectPriority('Critical')">C</td>
            </tr>
            <tr>
              <td style="text-align: left">Unlikely</td>
              <td class="green" @click="selectPriority('Low')">L</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="orange" @click="selectPriority('High')">H</td>
            </tr>
            <tr>
              <td style="text-align: left">Rare</td>
              <td class="green" @click="selectPriority('Low')">L</td>
              <td class="green" @click="selectPriority('Low')">L</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="yellow" @click="selectPriority('Medium')">M</td>
              <td class="orange" @click="selectPriority('High')">H</td>
            </tr>
          </table>

          <p v-if="riskPriority" class="mt-4">
            You have selected: <strong>{{ riskPriority }}</strong>
          </p>
        </v-card-text>
      </v-window-item>

      <v-window-item :value="2">
        <v-card-text>
          <h3>{{ currentStep.title }}</h3>

          <p class="text-subtitle-1 mb-5">
            Since the risk priority is set to <strong>{{ riskPriority }}</strong
            >, all controls must be implemented within <strong>{{ maxDays }}</strong> day{{
              maxDays > 1 ? "s" : ""
            }}
            (before {{ maxDueDate }}). The Due Date for this task has been automatically set to this date, but you may
            make it sooner.
          </p>

          <DateSelector v-model="action.due_date" ref="dater" label="Due date" :max="maxDueDate" :min="today" />

          <v-label class="mt-5">Hierarchy of controls</v-label>
          <v-select v-model="action.control" :items="controlOptions" :item-props="true" />

          <v-label>Task description</v-label>
          <v-text-field v-model="action.title" hide-details />
        </v-card-text>
      </v-window-item>
    </v-window>

    <v-card-text class="d-flex">
      <v-btn :disabled="!isPrev" color="primary" @click="setupStep--">Prev</v-btn>
      <v-spacer />
      <div class="pt-1">Step {{ setupStep + 1 }}: {{ currentStep.title }}</div>
      <v-spacer />
      <v-btn v-if="!isDone" :disabled="!isNext" color="primary" @click="setupStep++">Next</v-btn>
      <v-btn v-else :disabled="isNext" color="success" @click="saveClick">Save</v-btn>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from "vue";
import { DateTime } from "luxon";
import { isEmpty, isNil } from "lodash";

import DateSelector from "../DateSelector.vue";
import { useActionStore } from "@/store/ActionStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["action", "hazardId"]);
const emit = defineEmits(["doClose"]);

const dater = ref(null);

const actionStore = useActionStore();
const { saveAction } = actionStore;

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const controlOptions = ref([
  { title: "Eliminate", value: "Eliminate", subtitle: "Remove hazard or redesign process so hazard does not exist" },
  {
    title: "Substitute",
    value: "Substitute",
    subtitle: "Substitute hazard with something of a lesser risk (replace ladder with scissor lift)",
  },
  { title: "Engineering", value: "Engineering", subtitle: "Control hazard through isolation (machine guarding)" },
  {
    title: "Administration",
    value: "Administration",
    subtitle: "Control hazard by influencing people (saftety procedures, signs, training)",
  },
  {
    title: "Personal Protective Equipment",
    value: "Personal Protective Equipment",
    subtitle: "Control hazard by use of PPE (respirator, hard hat, hearing protection)",
  },
]);

const setupStep = ref(0);
const setupStepOptions = ref([
  { title: "Hazard Categories", step: 0 },
  { title: "Risk Priority", step: 1 },
  { title: "Summary", step: 2 },
]);

watch(
  () => setupStep.value,
  (val) => {
    if (val == 2 && dater.value) {
      dater.value.setManual(maxDueDate.value);
    }
  }
);

const currentStep = computed(() => {
  return setupStepOptions.value[setupStep.value];
});

const isPrev = computed(() => {
  return currentStep.value.step > 0;
});
const isNext = computed(() => {
  if (setupStep.value == 0) return props.action.categories.length > 0;
  if (setupStep.value == 1) return !isNil(riskPriority.value);
  if (setupStep.value == 2) return isNil(props.action.control) || isEmpty(props.action.title);

  return currentStep.value.step < setupStepOptions.value.length - 1;
});

const isDone = computed(() => {
  return setupStep.value == setupStepOptions.value.length - 1;
});

const riskPriority = ref(null);
const maxDays = computed(() => {
  let daysToComplete = 30;

  if (riskPriority.value == "Medium") daysToComplete = 14;
  if (riskPriority.value == "High") daysToComplete = 7;
  if (riskPriority.value == "Critical") daysToComplete = 1;

  return daysToComplete;
});

const maxDueDate = computed(() => {
  return formatDate(DateTime.now().plus({ days: maxDays.value }).toISODate());
});
const today = computed(() => {
  return formatDate(DateTime.now().toISODate());
});

function closeClick() {
  riskPriority.value = null;
  setupStep.value = 0;

  emit("doClose");
}

async function saveClick() {
  showOverlay("Saving Action");
  props.action.status_code = "Ready";
  props.action.urgency_code = riskPriority.value;

  await saveAction(props.action).then(() => {
    closeClick();
    hideOverlay();
  });
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");
}

function selectPriority(riskLevel) {
  riskPriority.value = riskLevel;
  props.action.due_date = maxDueDate.value;
}
</script>

<style scoped>
.score-table {
  border-collapse: collapse;
  border-bottom: 1px black solid;
  border-right: 1px black solid;
}
.score-table td {
  width: 99px;
  padding: 5px;
  border-top: 1px black solid;
  border-left: 1px black solid;
  text-align: center;
  background-color: #ccc;
}
.score-table td.green {
  background-color: green;
  cursor: pointer;
}
.score-table td.yellow {
  background-color: yellow;
  cursor: pointer;
}
.score-table td.orange {
  background-color: orangered;
  cursor: pointer;
}
.score-table td.red {
  background-color: red;
  cursor: pointer;
}
</style>
