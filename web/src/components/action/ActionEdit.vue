<template>
  <v-dialog width="700px" persistent>
    <template #default>
      <v-card v-if="props.action">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title class="text-white" style="">Edit Task in Action Plan</v-toolbar-title>
          <v-spacer> </v-spacer>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="closeClick"></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-5">
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
              <v-label>Task</v-label>
              <v-text-field v-model="props.action.description" hide-details />
            </v-col>
            <v-col cols="12">
              <v-label>Notes</v-label>
              <v-textarea v-model="props.action.notes" rows="3" />
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
            <v-btn v-if="props.action.complete_date" color="info" @click="revertClick"
              ><v-icon class="mr-2">mdi-arrow-u-left-top-bold</v-icon> Revert</v-btn
            >
            <v-btn v-else color="success" @click="completeClick"
              ><v-icon class="mr-2">mdi-check</v-icon> Mark Complete</v-btn
            >

            <v-spacer />
            <v-btn color="warning" @click="deleteClick"><v-icon class="mr-2">mdi-delete</v-icon>Delete</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useUserStore } from "@/store/UserStore";
import { useReportStore } from "@/store/ReportStore";

const props = defineProps(["action"]);

const emit = defineEmits(["doClose"]);

import DateSelector from "@/components/DateSelector.vue";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const reportStore = useReportStore();
const { saveAction, deleteAction, completeAction, revertAction } = reportStore;

const dp = ref(null as any);

const canSave = computed(() => {
  if (props.action.due_date && props.action.description) return true;

  return false;
});

function closeClick() {
  emit("doClose");
}

async function saveClick() {
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
