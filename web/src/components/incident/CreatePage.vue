<template>
  <h1 class="text-h4">Report a Safety Concern</h1>
  <p class="text-body-2">
    Personal information is collected under the Workers' Safety and Compensation Act, Section #, for the purposes of
    Incident investigation and corrective action. For further information, contant the Director of Health, Safety &
    Wellbeing at 867-332-5974
  </p>

  <v-form class="mt-6" v-model="isValid">
    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">Event Types</h4>
        </v-card-item>

        <v-row class="pa-2 pb-6">
          <v-col class="d-flex flex-nowrap" cols="12" md="6">
            <v-checkbox
              v-model="report.eventType"
              value="hazard"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>Hazard Identification</strong><br />
              Something has been observed that could potentially lead to an incident or injury
            </div>
          </v-col>
          <v-col class="d-flex flex-nowrap" cols="12" md="6">
            <v-checkbox
              v-model="report.eventType"
              value="incident"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>Incident Resulting in Loss</strong><br />
              Something has happened and caused an injury, equipment damage, property damage or environmental issue
            </div>
          </v-col>

          <v-col class="d-flex flex-nowrap" cols="12" md="6" offset-md="6">
            <v-checkbox
              v-model="report.eventType"
              value="noloss"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>No Loss Incident</strong><br />
              Something has happened. No damage or injury occurred, but could have
            </div>
          </v-col>
        </v-row>
      </v-card>
    </section>

    <v-divider class="my-3" />

    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">What Happened?</h4>
        </v-card-item>

        <v-row class="pa-5 pb-1">
          <v-col cols="12" md="12">
            <v-row>
              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Date and time event occurred</v-label>
                <DateTimeSelector v-model="report.date"></DateTimeSelector>
              </v-col>

              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Urgency level</v-label>
                <v-select v-model="report.urgency" :items="urgencies" item-title="name" item-value="code"></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="12" class="py-0">
            <v-label class="mb-1" style="white-space: inherit">General location where the event occurred</v-label>
            <v-autocomplete
              v-model="report.location_code"
              :items="locations"
              item-title="name"
              item-value="code"
              :rules="[requiredRule]" />
          </v-col>
          <v-col cols="12" md="12" class="py-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Specific location where the event occurred (such as a spot in a building)</v-label
            >
            <v-text-field v-model="report.location_detail" :rules="[requiredRule]" />
          </v-col>
          <v-col cols="12" md="12" class="pt-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Describe the event in your own words. Please include any details of equipment, materials, environmental
              conditions (work area, temperature, noise, chemical, other person, etc.) that may have
              contributed</v-label
            >
            <v-textarea v-model="report.description" :rules="[requiredRule]" />
          </v-col>
        </v-row>

        <v-card-text class="pt-0">
          <v-label>Are you submitting this report on behalf of another person?</v-label>
          <v-radio-group v-model="report.on_behalf" inline>
            <v-radio label="No" value="No"></v-radio>
            <v-radio label="Yes" value="Yes"></v-radio>
          </v-radio-group>

          <DirectorySelector
            v-if="report.on_behalf == 'Yes'"
            class=""
            label="Search and select the person you are submitting this for"
            @selected="handleBehalfSelect"></DirectorySelector>

          <DirectorySelector
            :label="
              report.on_behalf == 'Yes' ? 'Search and select their supervisor' : 'Search and select your supervisor'
            "
            @selected="handleSupervisorSelect"></DirectorySelector>

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
import DirectorySelector from "@/components/DirectorySelector.vue";
import { requiredRule } from "@/utils/validation";

const reportStore = useReportStore();
const { initialize, addReport } = reportStore;
const { locations, urgencies } = storeToRefs(reportStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const isValid = ref(false);

await initialize();

const report = ref({ eventType: null, date: new Date(), urgency: "Medium" });

const canSave = computed(() => {
  if (report.value.on_behalf == "Yes") {
    if (isNil(report.value.on_behalf_email)) return false;
  }

  return report.value.eventType && isValid.value && report.value.supervisor_email && report.value.on_behalf;
});

async function saveReport() {
  report.value.createDate = new Date();
  showOverlay();

  await addReport(report.value).then(() => {
    hideOverlay();
  });

  router.push("/report-an-incident/complete");
}

function handleSupervisorSelect(value) {
  if (value) report.value.supervisor_email = value.email;
  else report.value.supervisor_email = null;
}

function handleBehalfSelect(value) {
  if (value) report.value.on_behalf_email = value.email;
  else report.value.on_behalf_email = null;
}
</script>
