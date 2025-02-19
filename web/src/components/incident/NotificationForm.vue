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
          Depending on circumstances of the {{ incident_type_description }}, you may decide to notify other people or
          committees so they have the opportunity to review this information before notifying the employee this their
          submission has been completed.
        </p>
        <p class="mb-5">You may do that by entering email addresses into the box below and hitting "Send".</p>

        <v-textarea v-model="notificationEmails" label="Email addresses" rows="3" />

        <div class="d-flex">
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
import { isEmpty } from "lodash";

import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["incidentId", "incident_type_description"]);
const emits = defineEmits(["complete", "close"]);

const reportStore = useReportStore();
const { sendNotification, sendEmployeeNotification } = reportStore;

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { user } = userStore;

const notificationEmails = ref("");

function close() {
  emits("close");
}

async function notifyClick() {
  showOverlay();
  await sendNotification(notificationEmails.value);
  hideOverlay();
}

async function save() {
  showOverlay();

  await sendEmployeeNotification();

  emits("complete");
  close();
  hideOverlay();
}
</script>
