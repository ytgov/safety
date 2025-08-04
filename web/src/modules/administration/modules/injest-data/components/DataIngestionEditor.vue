<template>
  <v-dialog
    v-model="internalVisible"
    persistent
    max-width="700"
  >
    <v-card>
      <v-toolbar
        color="primary"
        variant="dark"
        title="Edit Location"
      >
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="handleClose"
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
          prepend-icon="mdi-upload"
          class="mb-2"
        />
      </v-card-text>

      <v-card-actions class="mx-4 mb-2">
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSave"
          >Save</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="yg_sun"
          variant="outlined"
          @click="handleClose"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import { isNil } from "lodash";

import { useUserStore } from "@/store/UserStore";
import { useDataIngestionSourceAdminStore } from "../store";
import { useNotificationStore } from "@/store/NotificationStore";
import { useRouter } from "vue-router";

const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{ 'update:modelValue': [boolean] }>()

const userStore = useUserStore()
const dataIngestionStore = useDataIngestionSourceAdminStore()
const notificationStore = useNotificationStore()

const { user } = storeToRefs(userStore)
const {
  dataIngestionSources,
  selectedDataIngestionSourceId,
  selectedDataIngestionFile,
} = storeToRefs(dataIngestionStore)

const internalVisible = computed<boolean>({
  get: () => props.modelValue,
  set: modelValue => emit('update:modelValue', modelValue),
})

const selectedId = computed<number|undefined>({
  get: ()  => selectedDataIngestionSourceId.value,
  set: source_id => {
    if (source_id != null) dataIngestionStore.selectDataIngestionSourceId(source_id)
  }
})

const selectedFile = computed<File|undefined>({
  get: () => selectedDataIngestionFile.value,
  set: f  => {
    if (f) dataIngestionStore.selectDataIngestionFile(f)
    else  dataIngestionStore.unselectDataIngestionFile()
  }
})

onMounted(() => {
  dataIngestionStore.getAllDataIngestionSources()
})

function handleClose() {
  dataIngestionStore.unselectDataIngestionSourceId()
  dataIngestionStore.unselectDataIngestionFile()
  internalVisible.value = false
}

async function handleSave() {
  try {
    await userStore.loadCurrentUser()

    if (isNil(user.value?.id)) {
      notificationStore.notify({         
        text: "You must be logged in to do this.",
        variant: "warning",
        icon: "mdi-alert-circle",
        status_code: 401, 
      })
      return
    }

    if (isNil(selectedId.value) || isNil(selectedFile.value)) {
      notificationStore.notify({
        text: "Please select a data source and upload a file.",
        variant: "warning",
        icon: "mdi-alert-circle",
        status_code: 400,
      })
      return
    }

    await dataIngestionStore.addDataIngestion(user.value.id)
  } catch (err) {
    console.error('save failed', err)
  }
}
</script>