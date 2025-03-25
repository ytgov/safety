<template>
  <v-dialog v-model="showDialog" persistent width="600px">
    <template #activator>
      <v-btn color="info" @click="showDialog = true">Reassign</v-btn>
    </template>

    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title class="text-white" style="">Reassign Task</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="closeClick"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <ActionUserSelector ref="directorySelectorField" label="Assigned to" @selected="handleReassign" />
        <v-btn class="mt-5" color="primary" @click="assignClick">Reassign</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ActionUserSelector from "./ActionUserSelector.vue";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { useActionStore } from "@/store/ActionStore";

const props = defineProps(["action"]);
const emit = defineEmits(["doClose"]);

const directorySelectorField = ref(null);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const actionStore = useActionStore();
const { saveAction } = actionStore;

const showDialog = ref(false);

onMounted(() => {
  loadCurrentStepUser();
});

function closeClick() {
  showDialog.value = false;
  emit("doClose");
}

async function assignClick() {
  showOverlay("Reassigning Action");
  await saveAction(props.action).then(() => {
    hideOverlay();
    closeClick();
  });
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
  } else props.action.actor_user_email = null;
}

async function loadCurrentStepUser() {
  if (directorySelectorField.value) {
    await directorySelectorField.value.setModel(props.action.actor_user_email, {
      long_name: props.action.actor_display_name,
      actor_role_type_id: props.action.actor_role_type_id,
    });
  }
}
</script>
