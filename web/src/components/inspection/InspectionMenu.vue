<template>
  <v-menu transition="slide-y-transition">
    <template v-slot:activator="{ props }">
      <v-btn color="info" v-bind="props" class="my-0" variant="outlined">
        <v-icon class="mr-2">mdi-chevron-down</v-icon> Actions
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-if="isSystemAdmin" title="Delete" subtitle="This cannot be undone" @click="deleteClick">
        <template #prepend>
          <v-icon color="error">mdi-delete</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
  <ConfirmDialog ref="confirm" />
</template>

<script setup>
import { ref } from "vue";
import { router } from "@/routes";

import ConfirmDialog from "@/components/ConfirmDialog";

import { useUserStore } from "@/store/UserStore";
import { useApiStore } from "@/store/ApiStore";
import { REPORTS_URL } from "@/urls";

const props = defineProps(["inspectionId"]);

const userStore = useUserStore();

const { isSystemAdmin } = userStore;
const confirm = ref(null);

async function deleteClick() {
  confirm.value.show(
    "Delete Inspection",
    "Are you sure you want to delete this inspection?",
    async () => {
      const api = useApiStore();
      api.secureCall("delete", `${REPORTS_URL}/${props.inspectionId}`);

      router.push("/inspections");
    },
    () => {}
  );
}
</script>
