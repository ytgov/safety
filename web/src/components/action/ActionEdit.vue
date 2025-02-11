<template>
  <v-dialog width="700px" persistent>
    <template #default>
      <v-card v-if="props.action">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title class="text-white" style="">{{ action.description }}</v-toolbar-title>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="closeClick"></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div v-if="action.status_code == 'Open'" class="px-2">
          <v-window v-model="setupStep" style="max-height: 550px; overflow-y: scroll">
            <v-window-item :value="0" @vue:mounted="loadCurrentStepUser">
              <v-card-text>
                <h3>{{ currentStep.title }}</h3>

                <v-row>
                  <v-col>
                    <p class="mb-2">This task is currently assigned to {{ action.actor_display_name }}.</p>
                    <p class="mb-4">
                      If you would you like to reassign it before the categorization steps, use the box below then close
                      this dialog.
                    </p>

                    <ActionUserSelector
                      ref="directorySelectorField"
                      label="Current assigned to"
                      @selected="handleUserSelect" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>

            <v-window-item :value="1">
              <v-card-text>
                <h3>{{ currentStep.title }}</h3>

                <v-checkbox v-model="categories" value="Chemical" hide-details density="compact">
                  <template #label
                    >Chemical
                    <v-tooltip location="right" activator="parent" width="600">
                      Examples: Chemical Asbestos, chemical storage, chemicals, dust/smoke/fumes, lead paint, mists and
                      vapours, radon gas
                    </v-tooltip>
                  </template>
                </v-checkbox>
                <v-checkbox v-model="categories" value="Biological" hide-details density="compact">
                  <template #label
                    >Biological
                    <v-tooltip location="right" activator="parent" width="600">
                      Examples: Blood and bodily fluids, human waste, insect/animal bite, medical waste, mold,
                      viruses/bacteria
                    </v-tooltip>
                  </template>
                </v-checkbox>

                <v-checkbox v-model="categories" value="Ergonomic" hide-details density="compact">
                  <template #label
                    >Ergonomic
                    <v-tooltip location="right" activator="parent" width="600">
                      Examples: Improper lifting, improper workstations, repetitive activity, strenuous activity
                    </v-tooltip>
                  </template>
                </v-checkbox>
                <v-checkbox v-model="categories" value="Physical Conditions" hide-details density="compact">
                  <template #label
                    >Physical Conditions
                    <v-tooltip location="right" activator="parent" width="600">
                      Examples: Electrical, temperature, humidity, fire/explosion potential, housekeeping, lighting,
                      pressure systems, road conditions, slippery or uneven surface, vibration, wildlife, working alone
                    </v-tooltip>
                  </template>
                </v-checkbox>
                <v-checkbox v-model="categories" value="Safety" hide-details density="compact">
                  <template #label
                    >Safety
                    <v-tooltip location="right" activator="parent" width="600">
                      Examples: Blocked exit routes, confined space, falling from heights, falling items, faulty
                      equipment, machinery in motion, overhead hazard, pinch/nip points, sharp objects
                    </v-tooltip>
                  </template>
                </v-checkbox>
              </v-card-text>
            </v-window-item>

            <v-window-item :value="2">
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

            <v-window-item :value="3">
              <v-card-text>
                <h3>{{ currentStep.title }}</h3>

                <p class="text-subtitle-1 mb-5">
                  Since the risk priority is set to <strong>{{ riskPriority }}</strong
                  >, all controls must be implemented within <strong>{{ maxDays }}</strong> day{{
                    maxDays > 1 ? "s" : ""
                  }}
                  (before {{ maxDueDate }}). The Due Date for this task has been automatically set to this date, but you
                  may make it sooner.
                </p>

                <DateSelector v-model="action.due_date" ref="dater" label="Due date" :max="maxDueDate" :min="today" />
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

        <v-card-text v-else>
          <v-row>
            <v-col>
              <v-label>Due date</v-label>
              <v-text-field hide-details :value="formatDate(props.action.due_date)" />
              <!-- <a @click="setToday" class="cursor-pointer text-info">Today</a>,
              <a @click="setTomorrow" class="cursor-pointer text-info">Tomorrow</a>,
              <a @click="setWeek" class="cursor-pointer text-info">in 1 week</a> -->
            </v-col>
            <v-col>
              <v-label>Assigned to</v-label>
              <v-text-field hide-details :value="props.action.actor_display_name" />
              <!-- <a @click="setMe" class="cursor-pointer text-info">Me</a> -->
            </v-col>
            <v-col cols="12">
              <v-label>Hierarchy of Controls</v-label>
              <v-select
                v-model="props.action.control"
                :items="controlOptions"
                :readonly="!isNil(props.action.complete_date)"
                :item-props="true"
                hide-details />
            </v-col>

            <v-col cols="12">
              <v-label>Task</v-label>
              <v-text-field
                v-model="props.action.description"
                :readonly="!isNil(props.action.complete_date)"
                hide-details />
            </v-col>
            <v-col cols="12">
              <v-label>Notes</v-label>
              <v-textarea v-model="props.action.notes" :readonly="!isNil(props.action.complete_date)" rows="3" />
            </v-col>

            <!--
        sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
        status_code: ActionStatuses.OPEN.code,
        actor_user_email: supervisor_email,
        actor_user_id: supervisorUser?.id ?? null,
          -->
          </v-row>
          <!-- <v-btn color="primary" :disabled="!canSave" @click="saveClick">Save</v-btn> -->
          <div class="d-flex">
            <v-btn v-if="!isNil(props.action.complete_date)" color="info" @click="revertClick"
              ><v-icon class="mr-2">mdi-arrow-u-left-top-bold</v-icon> Revert</v-btn
            >
            <v-btn v-else :disabled="!canComplete" color="success" @click="completeClick"
              ><v-icon class="mr-2">mdi-check</v-icon> Mark Complete</v-btn
            >

            <v-spacer />
            <v-btn v-if="isSystemAdmin" color="warning" @click="deleteClick"
              ><v-icon class="mr-2">mdi-delete</v-icon>Delete</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, computed, defineProps, watch } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { isNil } from "lodash";
import { useUserStore } from "@/store/UserStore";
import { useReportStore } from "@/store/ReportStore";

const props = defineProps(["action"]);

const emit = defineEmits(["doClose"]);

import ActionUserSelector from "./ActionUserSelector.vue";
import DateSelector from "../DateSelector.vue";

const directorySelectorField = ref(null);
const dater = ref(null);

const userStore = useUserStore();
const { user, isSystemAdmin } = storeToRefs(userStore);

const reportStore = useReportStore();
const { saveAction, deleteAction, completeAction, revertAction } = reportStore;

const setupStep = ref(0);
const setupStepOptions = ref([
  { title: "Task Assignment", step: 0 },
  { title: "Hazard Categories", step: 1 },
  { title: "Risk Priority", step: 2 },
  { title: "Summary", step: 3 },
]);
watch(
  () => setupStep.value,
  (val) => {
    if (val == 3 && dater.value) {
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
  if (setupStep.value == 1) return categories.value.length > 0;
  if (setupStep.value == 2) return !isNil(riskPriority.value);
  return currentStep.value.step < setupStepOptions.value.length - 1;
});

const isDone = computed(() => {
  return setupStep.value == setupStepOptions.value.length - 1;
});

const categories = ref([]);
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

const canComplete = computed(() => {
  return !isNil(props.action.control);
});

function closeClick() {
  categories.value = [];
  riskPriority.value = null;
  setupStep.value = 0;

  emit("doClose");
}

async function saveClick() {
  props.action.status_code = "Ready";
  props.action.urgency_code = riskPriority.value;

  await saveAction(props.action).then(() => {
    closeClick();
  });
}

async function deleteClick() {
  deleteAction(props.action).then(() => {
    closeClick();
  });
}

async function completeClick() {
  completeAction(props.action).then(() => {
    closeClick();
  });
}

async function revertClick() {
  revertAction(props.action).then(() => {
    closeClick();
  });
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");
}

function actionUserSelected(actor) {
  if (actor.actor_role_type_id) {
    props.action.actor_role_type_id = actor.actor_role_type_id;
    props.action.actor_display_name = actor.long_name;
    props.action.actor_user_id = null;
    props.action.actor_user_email = null;
  } else if (actor.user_id) {
    props.action.actor_role_type_id = null;
    props.action.actor_user_id = actor.user_id;
    props.action.actor_user_email = actor.email;
  } else if (actor.email) {
    props.action.actor_role_type_id = null;
    props.action.actor_user_id = null;
    props.action.actor_user_email = actor.email;
  }
}

async function handleUserSelect(value) {
  if (value) {
    actionUserSelected(value);
    await saveAction(props.action).then(() => {});
  } else props.action.actor_user_email = null;
}

async function loadCurrentStepUser() {
  if (directorySelectorField.value) {
    await directorySelectorField.value.setModel(props.action.actor_user_email, {
      long_name: props.action.actor_display_name,
      actor_role_type_id: props.action.actor_role_type_id,
    });
  }
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
