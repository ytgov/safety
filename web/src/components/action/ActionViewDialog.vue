<template>
  <v-dialog width="700px" persistent @keydown.esc="closeClick">
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title class="text-white" style="">{{ action.description }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="closeClick"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text v-if="action.status_code == 'Open'">
        <p class="mb-4">Before an Action can be completed, it must first be classified.</p>
        <div class="border">Hazards should be classified before being added to the Hazard Library</div>
      </v-card-text>

      <v-card-text v-else>
        <div class="bg-white" style="border: 1px #ddd solid; border-radius: 4px">
          <ActionViewForm :action="action" @do-close="closeClick" />
        </div>

        <div v-if="hazardId" class="mt-5">
          <v-label>Attachments</v-label>
          <div class="d-flex">
            <v-file-input
              v-model="upload"
              density="compact"
              class="mr-5"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              chips
              multiple />
            <v-btn color="primary" style="height: 40px" :disabled="upload.length == 0" @click="uploadClick"
              >Upload</v-btn
            >
          </div>

          <div v-if="attachments && attachments.length > 0" class="d-flex flex-wrap">
            <v-chip
              v-for="attachment in attachments"
              :key="attachment.id"
              class="mr-2 mb-2"
              @click="openAttachmentClick(attachment)">
              <v-icon class="mr-3">mdi-camera</v-icon>
              {{ attachment.file_name }}
            </v-chip>
          </div>
          <div v-else>No attachments found</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, watch } from "vue";
import { storeToRefs } from "pinia";
import { isNil, isNumber } from "lodash";

const props = defineProps(["action", "hazardId"]);

const emit = defineEmits(["doClose"]);

import { useHazardStore } from "@/store/HazardStore";
import ActionViewForm from "./ActionViewForm.vue";

const hazardStore = useHazardStore();
const { attachments } = storeToRefs(hazardStore);
const { openAttachment } = hazardStore;
const upload = ref([]);

watch(
  () => props.hazardId,
  (val) => {
    if (!isNil(val) && isNumber(val)) hazardStore.loadAttachments(val);
  }
);

function closeClick() {
  emit("doClose");
}

async function uploadClick() {
  if (isNil(props.hazardId) || upload.value.length == 0) return;

  await hazardStore.upload(props.hazardId, upload.value).then(() => {
    upload.value = [];
    hazardStore.loadAttachments(props.hazardId);
  });
}

function openAttachmentClick(attachment) {
  openAttachment(attachment);
}
</script>
