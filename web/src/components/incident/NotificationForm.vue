<template>
  <v-dialog max-width="650px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title class="d-flex"> Employee Notification </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text>
        <h3>Notifications</h3>
        <p class="mb-5">
          You may decide to notify the linked users (if any) so they have the opportunity to review this information
          before notifying the reporting employee.
        </p>
        <p class="mb-5">Alternatively, you may elect to just Notify Reporting Employee and Complete Step.</p>

        <v-checkbox
          v-for="user in linkedUsers"
          :key="user.id"
          v-model="notificationEmails"
          :label="`${user.user_email} (${makeTitleCase(user.reason)})`"
          :value="user.user_email"
          hide-details
          density="compact"
          class="my-0 py-0" />

        <div class="d-flex mt-5">
          <v-btn :disabled="isEmpty(notificationEmails)" color="info" @click="notifyClick">Notify above</v-btn>

          <v-spacer />

          <v-btn color="primary" @click="save">Notify Employee and Complete Step</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { isEmpty } from "lodash";

import { useReportStore } from "@/store/ReportStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["incidentId", "incident_type_description"]);
const emits = defineEmits(["complete", "close"]);

const reportStore = useReportStore();
const { sendNotification, sendEmployeeNotification } = reportStore;
const { linkedUsers } = storeToRefs(reportStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const notificationEmails = ref([]);

function close() {
  emits("close");
}

async function notifyClick() {
  showOverlay("Sending Notifications");
  await sendNotification(notificationEmails.value.join(", "));
  hideOverlay();
}

async function save() {
  showOverlay("Sending Notification");

  await sendEmployeeNotification();

  emits("complete");
  close();
  hideOverlay();
}

function makeTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
</script>
