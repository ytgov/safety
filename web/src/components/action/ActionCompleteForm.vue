<template>
  <div class="pa-4">
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
        <v-label>Hierarchy of Controls</v-label>
        <v-text-field :model-value="props.action.control" readonly hide-details append-inner-icon="mdi-lock" />
      </v-col>
      <v-col cols="12">
        <v-label>Hazard Categories</v-label>
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
        <v-label>Notes</v-label>
        <v-textarea v-model="props.action.notes" :readonly="!isNil(props.action.complete_date)" rows="3" hide-details />
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

    <div class="d-flex mt-5">
      <v-btn v-if="!isNil(props.action.complete_date)" color="info" @click="revertClick"
        ><v-icon class="mr-2">mdi-arrow-u-left-top-bold</v-icon> Revert</v-btn
      >
      <v-btn v-else :disabled="!canComplete" color="success" @click="completeClick"
        ><v-icon class="mr-2">mdi-check</v-icon> Mark Complete</v-btn
      >
      <v-spacer />

      <ActionAssignmentDialog :action="action" @do-close="closeClick" />

      <div v-if="isSystemAdmin">
        <div v-if="props.action.hazard_review == 0" class="ml-8">
          <v-label>Is this a Hazard?</v-label><br />
          <v-btn
            class="my-0 ml-2"
            color="success"
            size="x-small"
            title="Yes, create a Hazard"
            @click="hazardClick"
            icon="mdi-check"></v-btn>
          <v-btn
            class="my-0 float-right mr-4"
            color="warning"
            size="x-small"
            title="Don't create a Hazard"
            icon="mdi-close"
            @click="notHazardClick"></v-btn>
        </div>

        <v-spacer />
        <v-btn color="warning" @click="deleteClick"><v-icon class="mr-2">mdi-delete</v-icon>Delete</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { isNil } from "lodash";

import { useActionStore } from "@/store/ActionStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import ActionAssignmentDialog from "./ActionAssignmentDialog.vue";

const props = defineProps(["action"]);
const emit = defineEmits(["doClose"]);
const directorySelectorField = ref(null);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin } = storeToRefs(userStore);

const actionStore = useActionStore();
const { deleteAction, completeAction, revertAction, hazardAction } = actionStore;

onMounted(() => {
  loadCurrentStepUser();
});

const canComplete = computed(() => {
  return !isNil(props.action.control);
});

function closeClick() {
  emit("doClose");
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
