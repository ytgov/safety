<template>
  <div class="pa-4">
    <v-row>
      <v-col>
        <v-label>Due date</v-label>
        <v-text-field hide-details :value="formatDate(props.action.due_date)" />
      </v-col>

      <v-col>
        <ActionUserSelector ref="directorySelectorField" label="Assigned to" @selected="handleReassign" />
      </v-col>
      <v-col cols="12">
        <v-label>Hazard Categories</v-label>

        <div class="pt-1 mb-n2">
          <v-chip v-for="category in props.action.categories" :key="category" class="mr-2 mb-2">{{ category }}</v-chip>
        </div>
      </v-col>

      <v-col cols="12">
        <v-label>Hierarchy of Controls</v-label>
        <v-select
          v-model="props.action.control"
          :items="controlOptions"
          :readonly="!isNil(props.action.complete_date)"
          :item-props="true"
          hide-details />
      </v-col>

      <v-col cols="12">
        <v-label>Task</v-label>
        <v-text-field v-model="props.action.description" :readonly="!isNil(props.action.complete_date)" hide-details />
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
    </v-row>

    <div class="d-flex mt-5">
      <v-btn v-if="!isNil(props.action.complete_date)" color="info" @click="revertClick"
        ><v-icon class="mr-2">mdi-arrow-u-left-top-bold</v-icon> Revert</v-btn
      >
      <v-btn v-else :disabled="!canComplete" color="success" @click="completeClick"
        ><v-icon class="mr-2">mdi-check</v-icon> Mark Complete</v-btn
      >

      <div v-if="isSystemAdmin && props.action.hazard_review == 0" class="ml-8">
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
      <v-btn v-if="isSystemAdmin" color="warning" @click="deleteClick"
        ><v-icon class="mr-2">mdi-delete</v-icon>Delete</v-btn
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { isNil } from "lodash";

import ActionUserSelector from "./ActionUserSelector.vue";
import { useActionStore } from "@/store/ActionStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["action"]);
const emit = defineEmits(["doClose"]);
const directorySelectorField = ref(null);

const router = useRouter();

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin } = storeToRefs(userStore);

const actionStore = useActionStore();
const { saveAction, deleteAction, completeAction, revertAction, hazardAction } = actionStore;

onMounted(() => {
  loadCurrentStepUser();
});

const controlOptions = ref([
  { title: "Eliminate", value: "Eliminate", subtitle: "Remove hazard or redesign process so hazard does not exist" },
  {
    title: "Substitute",
    value: "Substitute",
    subtitle: "Substitute hazard with something of a lesser risk (replace ladder with scissor lift)",
  },
  { title: "Engineering", value: "Engineering", subtitle: "Control hazard through isolation (machine guarding)" },
  {
    title: "Administration",
    value: "Administration",
    subtitle: "Control hazard by influencing people (saftety procedures, signs, training)",
  },
  {
    title: "Personal Protective Equipment",
    value: "Personal Protective Equipment",
    subtitle: "Control hazard by use of PPE (respirator, hard hat, hearing protection)",
  },
]);

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
    router.push("/actions");
    hideOverlay();
  });
}

async function notHazardClick() {
  showOverlay("Setting Review");
  props.action.hazard_review = -1;
  hazardAction(props.action).then(() => {
    router.push("/actions");
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
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");
}

function actionUserSelected(actor) {
  if (actor.actor_role_type_id) {
    props.action.actor_role_type_id = actor.actor_role_type_id;
    props.action.actor_display_name = actor.long_name;
    props.action.actor_user_id = null;
    props.action.actor_user_email = null;
  } else if (actor.user_id) {
    props.action.actor_role_type_id = null;
    props.action.actor_user_id = actor.user_id;
    props.action.actor_user_email = actor.email;
  } else if (actor.email) {
    props.action.actor_role_type_id = null;
    props.action.actor_user_id = null;
    props.action.actor_user_email = actor.email;
  }
}

async function handleReassign(value) {
  if (value) {
    actionUserSelected(value);

    showOverlay("Reassigning Action");
    await saveAction(props.action).then(() => {
      hideOverlay();
      closeClick();
    });
  } else props.action.actor_user_email = null;
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
