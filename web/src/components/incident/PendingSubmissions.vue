<template>
  <v-card v-if="pendingCount > 0" class="mb-4" color="warning" variant="outlined">
    <v-card-item class="py-3 px-5 bg-warning">
      <template #prepend>
        <v-icon>mdi-cloud-upload-outline</v-icon>
      </template>
      <v-card-title class="text-body-1 font-weight-bold">
        {{ pendingCount }} Pending Offline Report{{ pendingCount > 1 ? "s" : "" }}
      </v-card-title>
      <template #append>
        <v-btn
          variant="elevated"
          color="primary"
          size="small"
          :loading="isUploading"
          :disabled="isOffline"
          @click="uploadAll">
          <v-icon class="mr-1">mdi-upload</v-icon>
          Upload All Now
        </v-btn>
      </template>
    </v-card-item>

    <v-card-text v-if="isOffline" class="py-2 px-5">
      <v-alert type="info" density="compact" variant="tonal" class="mb-0">
        You are currently offline. Reports will be uploaded when connectivity is restored, or you can upload them manually
        from here.
      </v-alert>
    </v-card-text>

    <v-list density="compact" class="py-0">
      <v-list-item v-for="report in pendingReports" :key="report.id" class="px-5">
        <template #prepend>
          <v-icon size="small" color="warning">mdi-file-clock-outline</v-icon>
        </template>
        <v-list-item-title class="text-body-2">
          {{ report.eventType }} &mdash;
          {{ report.description?.length > 80 ? report.description.slice(0, 80) + "..." : report.description }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          Saved {{ formatDate(report.savedAt) }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            icon
            variant="text"
            size="x-small"
            color="error"
            @click="confirmRemove(report)"
            :disabled="isUploading">
            <v-icon>mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="top">Discard this report</v-tooltip>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="showConfirm" max-width="400">
      <v-card>
        <v-card-title>Discard Report?</v-card-title>
        <v-card-text> This report has not been uploaded and will be permanently removed. This cannot be undone. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showConfirm = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="doRemove">Discard</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useOfflineStore, type PendingReport } from "@/store/OfflineStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const offlineStore = useOfflineStore();
const { pendingReports, pendingCount, isUploading } = storeToRefs(offlineStore);

const interfaceStore = useInterfaceStore();
const { isOffline } = storeToRefs(interfaceStore);

const showConfirm = ref(false);
const reportToRemove = ref<PendingReport | null>(null);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function uploadAll() {
  await offlineStore.uploadPendingReports();
}

function confirmRemove(report: PendingReport) {
  reportToRemove.value = report;
  showConfirm.value = true;
}

function doRemove() {
  if (reportToRemove.value) {
    offlineStore.removePendingReport(reportToRemove.value.id);
  }
  showConfirm.value = false;
  reportToRemove.value = null;
}
</script>
