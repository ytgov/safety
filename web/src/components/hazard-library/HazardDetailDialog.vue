<template>
  <v-dialog width="700px" persistent>
    <v-card v-if="hazard">
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title class="text-white" style="">Hazard Details</v-toolbar-title>
        <v-spacer> </v-spacer>
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="closeClick"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-5">
        <table class="info-table" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 150px">Current Status</td>
            <td>{{ hazard.status_code }}</td>
          </tr>
          <tr>
            <td>General Location</td>
            <td>{{ hazard.location_name }}</td>
          </tr>
          <tr>
            <td>Specific Location</td>
            <td>{{ hazard.location_detail }}</td>
          </tr>
          <tr>
            <td>Urgency</td>
            <td>{{ hazard.urgency_code }}</td>
          </tr>
          <tr>
            <td>Hazard Type</td>
            <td>{{ hazard.hazard_type_name }}</td>
          </tr>
          <tr>
            <td>First Reported</td>
            <td>{{ formatDate(hazard.reported_at) }}</td>
          </tr>
          <tr>
            <td>Description</td>
            <td>{{ hazard.description }}</td>
          </tr>
        </table>

        {{ selectedHazard }}
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { DateTime } from "luxon";
import { useHazardStore } from "@/store/HazardStore";
import { storeToRefs } from "pinia";

const emit = defineEmits(["update:modelValue"]);

const hazardStore = useHazardStore();
const { select } = hazardStore;
const { selectedHazard: hazard } = storeToRefs(hazardStore);

function closeClick() {
  select(null);
  emit("update:modelValue", false);
}

function formatDate(input) {
  return DateTime.fromISO(input).toFormat("yyyy-MM-dd");
}
</script>

<style>
table.info-table {
  width: 100%;
  border-top: 1px #ccc solid;
  border-left: 1px #ccc solid;
}
table.info-table td {
  border-bottom: 1px #ccc solid;
  border-right: 1px #ccc solid;
  padding: 4px 10px;
}
</style>
