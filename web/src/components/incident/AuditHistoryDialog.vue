<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title>Audit History</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table :headers="headers" :items="logs" :loading="loading" :items-per-page="25" density="comfortable"
          no-data-text="No audit history for this incident">
          <template #item="{ item }">
            <tr class="audit-meta-row">
              <td class="audit-nowrap">{{ formatDate(item.changed_date) }}</td>
              <td> {{ item.user_action }} </td>
              <td class="audit-nowrap">{{ changerName(item) }}</td>
            </tr>
            <tr class="audit-detail-row">
              <td colspan="3">
                <span style="font-weight: 500;">{{ item.log_title }}</span>
                <span v-if="item.log_comment" class="text-medium-emphasis"> &mdash; {{ item.log_comment }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { DateTime } from "luxon";
import { useReportStore } from "@/store/ReportStore";

const props = defineProps(["incidentId"]);

const dialog = defineModel({ type: Boolean });

const reportStore = useReportStore();

const logs = ref([]);
const loading = ref(false);

const headers = [
  { title: "Date", key: "changed_date", width: "200px" },
  { title: "Action", key: "user_action", width: "120px" },
  { title: "Changed by", key: "changer", sortable: false },
];

watch(dialog, async (val) => {
  if (val && props.incidentId) {
    loading.value = true;
    try {
      logs.value = (await reportStore.loadAuditLogs(props.incidentId)) || [];
    } finally {
      loading.value = false;
    }
  }
});

function changerName(item) {
  return item.changer_name || item.changer_email || "System";
}

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd @ h:mma");
}
</script>

<style scoped>
.audit-nowrap {
  white-space: nowrap;
}

/* Keep each log entry's two rows visually joined: only the detail row carries
   the separator that divides one entry from the next.
   v-table floors every cell at height: var(--v-table-row-height) (44px at
   comfortable), which a table treats as a minimum, so both rows must opt out of
   it before padding can control the spacing. */
.audit-meta-row>td,
.audit-detail-row>td {
  height: auto !important;
}

.audit-meta-row>td {
  border-bottom: none !important;
  padding-top: 8px !important;
  padding-bottom: 0 !important;
}

.audit-detail-row>td {
  padding-top: 0px !important;
  padding-bottom: 8px !important;
}
</style>
