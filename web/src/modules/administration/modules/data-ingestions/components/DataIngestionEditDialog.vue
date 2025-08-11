<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="700"
  >
    <v-card>
      <v-toolbar
        color="primary"
        variant="dark"
        title="Upload Data File"
      >
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="resetAndClose"
          color="white"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-select
          v-model="selectedId"
          :items="dataIngestionSources"
          item-title="source_name"
          item-value="id"
          label="Data Source"
          dense
          outlined
        />
        <v-file-input
          v-model="selectedFile"
          label="Upload File"
          dense
          outlined
          accept=".csv"
          show-size
          hide-details
          prepend-icon=""
          prepend-inner-icon="mdi-upload"
          class="mb-2"
        />
      </v-card-text>

      <v-card-actions class="mx-4 mb-2">
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSave"
          >Upload</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="yg_sun"
          variant="outlined"
          @click="resetAndClose"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";

import { useUserStore } from "@/store/UserStore";
import { useDataIngestionSourceAdminStore } from "../store";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [boolean] }>();

const userStore = useUserStore();
const dataIngestionStore = useDataIngestionSourceAdminStore();

const { user } = storeToRefs(userStore);
const { dataIngestionSources, selectedDataIngestionSourceId, selectedDataIngestionFile } =
  storeToRefs(dataIngestionStore);

const modelValue = computed<boolean>({
  get: () => props.modelValue,
  set: (modelValue) => emit("update:modelValue", modelValue),
});

const selectedId = computed<number | undefined>({
  get: () => selectedDataIngestionSourceId.value,
  set: (source_id) => {
    if (source_id != null) {
      dataIngestionStore.selectDataIngestionSourceId(source_id);
    }
  },
});

const selectedFile = computed<File | undefined>({
  get: () => selectedDataIngestionFile.value,
  set: (f) => {
    if (f) dataIngestionStore.selectDataIngestionFile(f);
    else dataIngestionStore.unselectDataIngestionFile();
  },
});

onMounted(() => {
  dataIngestionStore.getAllDataIngestionSources();
});

function resetAndClose() {
  dataIngestionStore.unselectDataIngestionSourceId();
  dataIngestionStore.unselectDataIngestionFile();
  modelValue.value = false;
}

async function handleSave() {
  try {
    await userStore.loadCurrentUser();
    await dataIngestionStore.addDataIngestion(user.value?.id);
  } catch (err) {
    console.error("save failed", err);
  }
}
</script>
