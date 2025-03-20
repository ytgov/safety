<template>
  <div class="pa-4">
    <v-row>
      <v-col>
        <v-label>Due date</v-label>
        <v-text-field hide-details :value="formatDate(action.due_date)" />
      </v-col>

      <v-col>
        <v-label>Assigned to</v-label>
        <v-text-field :model-value="action.actor_display_name" readonly hide-details />
      </v-col>
      <v-col cols="12">
        <v-label>Hazard Categories</v-label>
        <div class="pt-1 mb-n2">
          <v-chip v-for="category in props.action.categories" :key="category" class="mr-2 mb-2">{{ category }}</v-chip>
        </div>
      </v-col>

      <v-col cols="12">
        <v-label>Hierarchy of Controls</v-label>
        <v-select v-model="props.action.control" :items="controlOptions" readonly :item-props="true" hide-details />
      </v-col>

      <v-col cols="12">
        <v-label>Task</v-label>
        <v-text-field v-model="props.action.description" readonly hide-details />
      </v-col>

      <v-col cols="12">
        <v-label>Notes</v-label>
        <v-textarea v-model="props.action.notes" readonly rows="3" hide-details />
      </v-col>

      <v-col v-if="!isNil(props.action.complete_name)" cols="12">
        <v-label>Completed</v-label>
        <v-text-field
          :model-value="`By: ${props.action.complete_name} On: ${formatDate(props.action.complete_date)}`"
          readonly
          hide-details />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { isNil } from "lodash";

import { useActionStore } from "@/store/ActionStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["action"]);
const emit = defineEmits(["doClose"]);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { isSystemAdmin } = storeToRefs(userStore);

const actionStore = useActionStore();
const { deleteAction } = actionStore;

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

function formatDate(input) {
  if (!input) return "";

  if (DateTime.fromISO(input.toString()).isValid) return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");

  return input;
}
</script>
