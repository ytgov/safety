<template>
  <div v-if="selectedReport">
    <div v-if="selectedReport.actions && selectedReport.actions.length > 0">
      <v-list bg-color="#ffffff00" rounded class="py-0" style="border: 1px #00000066 solid">
        <div v-for="(action, idx) of selectedReport.actions">
          <v-list-item
            :title="makeTitle(action)"
            :subtitle="makeSubtitle(action)"
            style="background-color: #ffffff"
            class="pt-3 pb-3"
            @click="showEditClick(action)">
            <template #append>
              <v-btn
                v-if="action.complete_date"
                fab
                class="my-0"
                color="success"
                size="x-small"
                icon="mdi-check"></v-btn>
              <v-btn v-else fab class="my-0" color="warning" size="x-small" icon="mdi-alert-circle-outline"></v-btn>
            </template>
          </v-list-item>
          <v-divider v-if="idx < selectedReport.actions.length - 1" />
        </div>
      </v-list>
    </div>
    <div v-else>The Actions Plan is currently empty</div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { selectedReport } = storeToRefs(reportStore);

const emit = defineEmits(["showAction"]);

function showEditClick(action) {
  emit("showAction", action);
}

function makeTitle(action) {
  return `${action.description}: ${formatDate(action.due_date)}`;
}

function makeSubtitle(action) {
  return `Assigned to: ${action.actor_display_name}`;
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");
}
</script>
