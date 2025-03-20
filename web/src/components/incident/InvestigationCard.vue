<template>
  <v-card class="default mb-5">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Investigation Details</h4>
    </v-card-item>
    <v-card-text>
      <p class="my-1 mt-3">
        Investigation Completed on {{ formatDate(investigation.investigation_data.completed_on) }} by
        {{ investigation.investigation_data.completed_by }}
      </p>
      <v-row class="mt-0 pb-0">
        <v-col cols="12" md="6" class="pb-0">
          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Data Collection</h4>
            <ul class="ml-4">
              <li v-for="collection in investigation.investigation_data.collections.map((d) => d.title)">
                {{ collection }}
              </li>
            </ul>

            <p v-if="investigation.investigation_data.collections_other" class="mt-1">
              {{ investigation.investigation_data.collections_other }}
            </p>
          </v-sheet>

          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Event Type</h4>
            <ul class="ml-4">
              <li v-for="collection in investigation.investigation_data.events.map((d) => d.title)">
                {{ collection }}
              </li>
            </ul>
          </v-sheet>

          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Incident Type</h4>
            <ul class="ml-4">
              <li>
                {{ investigation.investigation_data.incidents.title }}
              </li>
            </ul>

            <p v-if="investigation.investigation_data.incidents_other" class="mt-1">
              {{ investigation.investigation_data.incidents_other }}
            </p>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6" class="pb-0">
          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Immediate Cause</h4>

            <ul class="ml-4">
              <li>
                <strong>{{ investigation.investigation_data.acts.subtitle }}:&nbsp;</strong
                >{{ investigation.investigation_data.acts.title }}
              </li>
            </ul>
          </v-sheet>

          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Contributing Factors</h4>

            <ul class="ml-4">
              <li v-for="collection in investigation.investigation_data.factors.map((d) => d.title)">
                {{ collection }}
              </li>
            </ul>
          </v-sheet>

          <v-sheet border rounded class="pa-3 mb-4">
            <h4 class="mb-1">Root Cause</h4>

            <ul class="ml-4">
              <li v-for="collection in investigation.investigation_data.causes.map((d) => d.title)">
                {{ collection }}
              </li>
            </ul>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { DateTime } from "luxon";

defineProps(["investigation"]);

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("yyyy/MM/dd");
}
</script>
