<template>
  <v-dialog width="700px">
    <template #default>
      <v-card v-if="action">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title class="text-white" style="">Add Action to Action Plan</v-toolbar-title>
          <v-spacer> </v-spacer>
          <v-toolbar-items>
            <v-btn icon="mdi-close" @click="closeClick"></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-row>
            <v-col>
              <v-label>Due date</v-label>
              <DateSelector ref="dp" v-model="action.due_date" :min="new Date()" />
              <a @click="setToday" class="cursor-pointer text-info">Today</a>,
              <a @click="setTomorrow" class="cursor-pointer text-info">Tomorrow</a>,
              <a @click="setWeek" class="cursor-pointer text-info">in 1 week</a>
            </v-col>
            <v-col>
              <v-label>Assigned to</v-label>
              <v-text-field hide-details v-model="action.action_user_id" />
              <a @click="setMe" class="cursor-pointer text-info">Me</a>
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

<script setup lang="ts">
import { ref, computed, emits } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useUserStore } from "@/store/UserStore";

const emit = defineEmits(["doClose"]);

import DateSelector from "@/components/DateSelector.vue";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const action = ref({});
const dp = ref(null);

const canSave = computed(() => {
  if (action.value.due_date && action.value.description) return true;

  return false;
});

function setToday() {
  dp.value.setManual(DateTime.now().toJSDate());
}
function setTomorrow() {
  dp.value.setManual(DateTime.now().plus({ days: 1 }).toJSDate());
}
function setWeek() {
  dp.value.setManual(DateTime.now().plus({ weeks: 1 }).toJSDate());
}
function setMe() {
  action.value.action_user_id = user.value.display_name;
}

function closeClick() {
  emit("doClose");
  action.value = {};
}

async function saveClick() {
  console.log("SAVING ACTION", action.value);
  alert("This doesn't work yet");
}
</script>
