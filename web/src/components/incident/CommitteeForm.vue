<template>
  <v-dialog max-width="650px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title class="d-flex"> Request Committee Review </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text>
        <h3>Committee Review</h3>
        <p class="mb-5">
          You may decide to request a review by a safety committee for your department. Please select the appropriate
          committee to continue.
        </p>

        <CommitteeSelect v-model="selectedCommittee" label="Safety Committee" />

        <div class="d-flex">
          <v-btn color="primary" :disabled="!selectedCommittee" @click="notifyClick">Request Review</v-btn>

          <v-spacer />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { isEmpty } from "lodash";

import CommitteeSelect from "@/components/incident/CommitteeSelect.vue";

import { useReportStore } from "@/store/ReportStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { useCommitteeStore } from "@/store/CommitteeStore";
import { storeToRefs } from "pinia";

const props = defineProps(["incidentId", "incident_type_description", "department"]);
const emits = defineEmits(["complete", "close"]);

const reportStore = useReportStore();
const { sendCommitteeRequest } = reportStore;

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const committeeStore = useCommitteeStore();
const { loadCommittees } = committeeStore;
const { committees } = storeToRefs(committeeStore);

const selectedCommittee = ref(null);
const notificationEmails = ref("");

watch(
  () => committees.value,
  (newValue) => {
    if (newValue.length > 0 && props.department) {
      const suggestion = newValue.find((committee) => {
        return committee.department_code == props.department;
      });

      if (suggestion) {
        selectedCommittee.value = suggestion.id;
      }
    }
  }
);

loadCommittees();

function close() {
  emits("close");
}

async function notifyClick() {
  showOverlay();
  await sendCommitteeRequest(selectedCommittee.value);
  close();
  hideOverlay();
}
</script>
