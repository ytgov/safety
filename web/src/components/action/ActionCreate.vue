<template>
  <v-dialog width="700px" persistent>
    <template #default>
      <v-card v-if="action">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title class="text-white" style="">Add Task to Action Plan</v-toolbar-title>
          <v-spacer> </v-spacer>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="closeClick"></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-row>
            <v-col cols="12">
              <v-label>Due date</v-label>
              <DateSelector ref="dp" v-model="action.due_date" :min="new Date()" />
              <a @click="setToday" class="cursor-pointer text-info">Today</a>,
              <a @click="setTomorrow" class="cursor-pointer text-info">Tomorrow</a>,
              <a @click="setWeek" class="cursor-pointer text-info">in 1 week</a>
            </v-col>
            <v-col>
              <ActionUserSelector
                label="Search and select the group or person"
                @selected="actionUserSelected"></ActionUserSelector>

              <!-- <a @click="setMe" class="cursor-pointer text-info">Me</a> -->
            </v-col>
            <v-col cols="12">
              <v-label>Task</v-label>
              <v-text-field v-model="action.description" hide-details />
            </v-col>
            <v-col cols="12">
              <v-label>Notes</v-label>
              <v-textarea v-model="action.notes" rows="3" />
            </v-col>

            <!--
        sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
        status_code: ActionStatuses.OPEN.code,
        actor_user_email: supervisor_email,
        actor_user_id: supervisorUser?.id ?? null,
          -->
          </v-row>
          <v-btn color="primary" :disabled="!canSave" @click="saveClick">Save</v-btn>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useUserStore } from "@/store/UserStore";
import { useReportStore } from "@/store/ReportStore";

const emit = defineEmits(["doClose"]);

import ActionUserSelector from "./ActionUserSelector.vue";
import DateSelector from "@/components/DateSelector.vue";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const reportStore = useReportStore();
const { saveAction } = reportStore;

const action = ref({});
const dp = ref(null);

const canSave = computed(() => {
  if (action.value.due_date && action.value.description) return true;

  return false;
});

function setToday() {
  if (dp.value) dp.value.setManual(DateTime.now().toJSDate());
}
function setTomorrow() {
  if (dp.value) dp.value.setManual(DateTime.now().plus({ days: 1 }).toJSDate());
}
function setWeek() {
  if (dp.value) dp.value.setManual(DateTime.now().plus({ weeks: 1 }).toJSDate());
}
function setMe() {
  if (user.value) action.value.action_user_id = user.value.id;
}

function closeClick() {
  emit("doClose");
  action.value = {};
}

async function saveClick() {
  await saveAction(action.value).then(() => {
    closeClick();
  });
}

function actionUserSelected(actor) {
  if (actor.actor_role_type_id) {
    action.value.actor_role_type_id = actor.actor_role_type_id;
    action.value.actor_user_id = null;
    action.value.actor_user_email = null;
  } else if (actor.user_id) {
    action.value.actor_role_type_id = null;
    action.value.actor_user_id = actor.user_id;
    action.value.actor_user_email = actor.email;
  } else if (actor.email) {
    action.value.actor_role_type_id = null;
    action.value.actor_user_id = null;
    action.value.actor_user_email = actor.email;
  }
}
</script>
