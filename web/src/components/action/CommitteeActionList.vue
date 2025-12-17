<template>
  <div v-if="selectedReport">
    <div v-if="selectedReport.committee_actions && selectedReport.committee_actions.length > 0">
      <v-list bg-color="#ffffff00" rounded class="py-0" style="border: 1px #00000066 solid">
        <div v-for="(action, idx) of selectedReport.committee_actions">
          <v-list-item
            :title="makeTitle(action)"
            :subtitle="makeSubtitle(action)"
            style="background-color: #ffffff"
            class="pt-3 pb-3"
            @click="showEditClick(action)">
            <template #prepend>
              <v-avatar size="small" class="mx-n2">
                <v-icon v-if="action.complete_date" color="success" size="26">mdi-check-circle</v-icon>
                <v-icon v-else-if="action.status_code == 'Open'" color="warning" size="26"
                  >mdi-alert-circle-outline</v-icon
                >
                <v-icon v-else color="info" size="26">mdi-circle-outline</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
          <v-divider v-if="idx < selectedReport.committee_actions.length - 1" />
        </div>
      </v-list>
    </div>
    <div v-else>The Committee Control Plan is currently empty</div>
  </div>
</template>

<script setup>
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
