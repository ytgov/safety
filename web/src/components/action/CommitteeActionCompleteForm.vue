<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-label>Title</v-label>
        <v-text-field :model-value="props.action.description" readonly hide-details append-inner-icon="mdi-lock" />
      </v-col>
      <v-col>
        <v-label>Due date</v-label>
        <v-text-field hide-details :model-value="formatDate(action.due_date)" readonly append-inner-icon="mdi-lock" />
      </v-col>
      <v-col>
        <v-label>Hierarchy of controls</v-label>
        <v-text-field :model-value="props.action.control" readonly hide-details append-inner-icon="mdi-lock" />
      </v-col>
      <v-col cols="12">
        <v-label>Hazard categories</v-label>
        <div class="pt-1 mb-n2">
          <v-select
            :model-value="action.categories"
            chips
            readonly
            multiple
            hide-details
            append-inner-icon="mdi-lock" />
        </div>
      </v-col>
      <v-col cols="12">
        <v-label>Task description</v-label>
        <v-text-field :model-value="action.title" readonly hide-details append-inner-icon="mdi-lock" />
      </v-col>

      <v-col cols="12">
        <v-label>Supervisor review</v-label>
        <v-select
          v-model="action.committee_supervisor_response"
          :readonly="!isSupervisor"
          :append-inner-icon="isSupervisor ? '' : 'mdi-lock'"
          :items="[
            'Supervisor accepts HSC recommendation as is',
            'Supervisor provides and alternative recommendation',
            'Supervisor rejects HSC recommendation. (If so, provide rationale below)',
          ]"
          hide-details />
        <div
          v-if="
            action.committee_supervisor_response ==
            'Supervisor rejects HSC recommendation. (If so, provide rationale below)'
          "
          class="mt-5">
          <v-label>Rationale</v-label>
          <v-textarea
            v-model="action.committee_task_rationale"
            :readonly="!isSupervisor"
            :append-inner-icon="isSupervisor ? '' : 'mdi-lock'"
            hide-details />
        </div>
      </v-col>

      <v-col cols="12">
        <v-label>Control plan progress</v-label>
        <div class="d-flex">
          <v-textarea
            v-model="props.action.notes"
            :readonly="!isNil(props.action.complete_date) || isReadonly"
            rows="3"
            hide-details />
          <v-btn v-if="!isReadonly" class="ml-3 mt-auto" size="small" color="primary" @click="saveNotes"> Save</v-btn>
        </div>
      </v-col>
      <v-col v-if="!isNil(props.action.complete_name)" cols="12">
        <v-label>Completed</v-label>
        <v-text-field
          :model-value="`By: ${props.action.complete_name} On: ${formatDate(props.action.complete_date)}`"
          readonly
          hide-details />
      </v-col>
      <v-col v-else>
        <v-label>Assigned to</v-label>
        <v-text-field
          :model-value="props.action.actor_display_name"
          readonly
          hide-details
          append-inner-icon="mdi-lock" />
      </v-col>
    </v-row>

    <div v-if="!isReadonly" class="d-flex mt-5">
      <v-btn v-if="!isNil(props.action.complete_date) && canAct" color="info" @click="revertClick"
        ><v-icon class="mr-2">mdi-arrow-u-left-top-bold</v-icon> Revert</v-btn
      >
      <v-btn v-else :disabled="!canComplete || !canAct" color="success" @click="completeClick"
        ><v-icon class="mr-2">mdi-check</v-icon> Control in place</v-btn
      >
      <v-spacer />

      <ActionAssignmentDialog :action="action" @do-close="closeClick" />
    </div>

    <v-spacer />
    <v-btn
      v-if="(props.action.is_committee_task && isCommittee) || isSystemAdmin"
      color="warning"
      @click="deleteClick"
      class="mt-3"
      ><v-icon class="mr-2">mdi-delete</v-icon>Delete</v-btn
    >
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { isNil } from "lodash";

import { useActionStore } from "@/store/ActionStore";
import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import ActionAssignmentDialog from "./ActionAssignmentDialog.vue";

const props = defineProps(["action", "readonly"]);
const emit = defineEmits(["doClose"]);
const directorySelectorField = ref(null);

const reportStore = useReportStore();
const { selectedReport, currentStep } = storeToRefs(reportStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin } = storeToRefs(userStore);

const actionStore = useActionStore();
const { deleteAction, completeAction, revertAction, hazardAction, saveAction } = actionStore;

onMounted(() => {
  loadCurrentStepUser();
});

const canComplete = computed(() => {
  return !isNil(props.action.control);
});

const isReadonly = computed(() => {
  return props.readonly == true;
});

const isCommittee = computed(() => {
  const relevantReasons = ["committee"];
  return selectedReport.value.access.filter((a) => relevantReasons.includes(a.reason)).length > 0;
});

const isSupervisor = computed(() => {
  const relevantReasons = ["supervisor"];
  return selectedReport.value.access.filter((a) => relevantReasons.includes(a.reason)).length > 0;
});

const canAct = computed(() => {
  return currentStep.value?.step_title == "Committee Review" ? false : true;
});

function closeClick() {
  emit("doClose");
}

async function saveNotes() {
  showOverlay("Saving Notes");
  props.action.notes = props.action.notes.trim();
  if (!props.action.notes) {
    hideOverlay();
    return;
  }
  await saveAction(props.action);
  hideOverlay();
}

async function deleteClick() {
  showOverlay("Delete Action");
  deleteAction(props.action).then(() => {
    closeClick();
    hideOverlay();
  });
}

async function hazardClick() {
  showOverlay("Setting Review");

  props.action.hazard_review = 1;
  hazardAction(props.action).then(() => {
    //router.push("/actions");
    hideOverlay();
  });
}

async function notHazardClick() {
  showOverlay("Setting Review");
  props.action.hazard_review = -1;
  hazardAction(props.action).then(() => {
    //router.push("/actions");
    hideOverlay();
  });
}

async function completeClick() {
  showOverlay("Completing Action");
  completeAction(props.action).then(() => {
    closeClick();
    hideOverlay();
  });
}

async function revertClick() {
  showOverlay("Reverting Action");
  revertAction(props.action).then(() => {
    closeClick();
    hideOverlay();
  });
}

function formatDate(input) {
  if (!input) return "";

  if (DateTime.fromISO(input.toString()).isValid) return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");

  return input;
}

async function loadCurrentStepUser() {
  if (directorySelectorField.value) {
    console.log("Loading current step user", props.action.actor_user_email);

    await directorySelectorField.value.setModel(props.action.actor_user_email, {
      long_name: props.action.actor_display_name,
      actor_role_type_id: props.action.actor_role_type_id,
    });
  }
}
</script>
