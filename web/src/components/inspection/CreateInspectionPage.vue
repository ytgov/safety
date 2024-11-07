<template>
  <h1 class="text-h4">Inspection</h1>
  <!-- <p class="text-body-2">
    Inspections are 
  </p> -->

  <v-form class="mt-6" v-model="isValid">
    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">Inspection Details</h4>
        </v-card-item>

        <v-row class="pa-5 pb-6">
          <v-col cols="12" md="12">
            <v-row>
              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Date and time of inspection</v-label>
                <DateTimeSelector v-model="report.date" hide-details></DateTimeSelector>
              </v-col>

              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">General location of inspection</v-label>
                <v-autocomplete
                  v-model="report.location_code"
                  :items="locations"
                  item-title="name"
                  item-value="code"
                  hide-details
                  :rules="[requiredRule]" />
              </v-col>

              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Department responsible</v-label>
                <v-autocomplete
                  v-model="report.location_code"
                  :items="locations"
                  item-title="name"
                  item-value="code"
                  hide-details
                  :rules="[requiredRule]" />
              </v-col>
              <!--  <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Urgency level</v-label>
                <v-select v-model="report.urgency" :items="urgencies" item-title="name" item-value="code"></v-select>
              </v-col> -->
            </v-row>
          </v-col>
          <!-- <v-col cols="12" md="12" class="py-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Specific location where the event occurred (such as a spot in a building)</v-label
            >
            <v-text-field v-model="report.location_detail" :rules="[requiredRule]" />
          </v-col>
          <v-col cols="12" md="12" class="pt-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Describe the event in your own words. Please include any details or thoughts that may be helpful to know
              such as weather or time of day</v-label
            >
            <v-textarea v-model="report.description" :rules="[requiredRule]" />
          </v-col> -->
        </v-row>
      </v-card>
    </section>

    <v-divider class="my-3" />

    <v-row>
      <v-col> Previously Identified Hazards for this location show here </v-col>
      <v-col>
        <div v-for="(hazard, index) of hazards">
          <section>
            <v-card class="default">
              <v-card-item class="py-4 px-6 mb-2 bg-sun">
                <h4 class="text-h6">Identified Hazard {{ index + 1 }}</h4>
              </v-card-item>
              <v-card-text class="pt-5 pb-6">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-label class="mb-1" style="white-space: inherit">Hazard type</v-label>
                    <v-select hide-details />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-label class="mb-1" style="white-space: inherit">Urgency</v-label>
                    <v-select hide-details></v-select>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-label class="mb-1" style="white-space: inherit">Description</v-label>
                    <v-text-field hide-details />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-label class="mb-1" style="white-space: inherit">Specific location</v-label>
                    <v-text-field hide-details />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </section>
          <v-divider class="my-3" />
        </div>
        <v-btn color="info" class="mt-0" @click="addHazard">Add Identified Hazard</v-btn>
      </v-col>
    </v-row>

    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">Submit Inspection</h4>
        </v-card-item>
        <v-card-text class="pt-5">
          <v-label>Attach supporting images</v-label>
          <v-file-input
            v-model="report.files"
            prepend-icon=""
            prepend-inner-icon="mdi-camera"
            chips
            multiple
            accept="image/*"></v-file-input>

          <div class="d-flex">
            <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Submit </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </section>
  </v-form>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";
import { router } from "@/routes";
import { useReportStore } from "@/store/ReportStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

import DateTimeSelector from "@/components/DateTimeSelector.vue";
import { requiredRule } from "@/utils/validation";

const reportStore = useReportStore();
const { initialize, addReport } = reportStore;
const { locations, urgencies } = storeToRefs(reportStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const isValid = ref(false);

const hazards = ref([]);

await initialize();

const report = ref({ eventType: null, date: new Date(), urgency: "Medium" });

const canSave = computed(() => {
  if (report.value.on_behalf == "Yes") {
    if (isNil(report.value.on_behalf_email)) return false;
  }

  return report.value.eventType && isValid.value && report.value.supervisor_email && report.value.on_behalf;
});

function addHazard() {
  hazards.value.push({});
}

async function saveReport() {
  report.value.createDate = new Date();
  showOverlay();

  await addReport(report.value).then(() => {
    hideOverlay();
    router.push("/report-an-incident/complete");
  });
}
</script>
