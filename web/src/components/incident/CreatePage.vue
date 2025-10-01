<template>
  <h1 class="text-h4">Report a Safety Concern</h1>
  <p class="text-body-2">
    All personal information is collected under the authority of section 15 (c) (i) of the Access to Information and
    Protection of Privacy Act. It is collected and used for the purposes of hazard and incident management related to
    the <em>Workers' Safety and Compensation Act</em>.
  </p>

  <v-alert type="warning" color="#fb8c0088" class="mt-3" style="font-size: 0.95rem">
    If the incident resulted in a fatality or serious incident as per WSCA you must report immediately to your
    supervisor and WSCB at their 24-hour phone line: 867-667-5450.
    <v-tooltip location="top" width="600" open-delay="250">
      <template #activator="{ props }">
        <v-icon color="primary" class="cursor-pointer" v-bind="props">mdi-information</v-icon>
      </template>
      <strong>This includes:</strong>
      <ul class="mx-5 my-3">
        <li>An incident that results in serious injury to or the death of a worker</li>
        <li>An incident or injury that results in a worker's admission to a hospital as an inpatient</li>
        <li>
          A major structural failure or collapse of a bridge, building, crane, excavation, hoist, mine, mining
          development, temporary construction support system, tower or any other like structure
        </li>
        <li>A major release of a hazardous substance</li>
        <li>
          An explosion or fire that has the potential to cause serious injury to or the death of a worker or other
          person
        </li>
        <li>
          An incident, injury or death that is required to be reported by the regulations or by order of the board
        </li>
      </ul>
    </v-tooltip>
  </v-alert>

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
              <strong>No Loss Incident (near miss)</strong><br />
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
                <v-label class="mb-1" style="white-space: inherit">Urgency for supervisor attention</v-label>
                <v-select v-model="report.urgency" :items="urgencies" item-title="name" item-value="code"></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="12" class="py-0">
            <v-label class="mb-1" style="white-space: inherit">General location where the event occurred</v-label>
            <v-autocomplete
              v-model="report.location_code"
              :items="locations"
              :item-title="makeLocationTitle"
              item-value="code"
              :rules="[requiredRule]">
              <template #item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.name"
                  :subtitle="`Community: ${item.raw.community}`"></v-list-item>
              </template>
              <template #selection="{ item }"> {{ makeLocationTitle(item.raw) }} </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="12" class="py-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Specific location where the event occurred (such as site or building details and area within)</v-label
            >
            <v-text-field v-model="report.location_detail" :rules="[requiredRule]" />
          </v-col>
          <v-col cols="12" md="12" class="pt-0">
            <v-label class="mb-1" style="white-space: inherit"
              >Describe the event in your own words. Please include any details of equipment, materials, environmental
              conditions (work area, temperature, noise, chemical, other person, etc.) that may have
              contributed</v-label
            >
            <v-textarea
              v-model="report.description"
              class="mb-3"
              :rules="[requiredRule]"
              hint="Please do not include names or personal identifiers"
              persistent-hint />
          </v-col>
        </v-row>

        <v-card-text class="pt-0">
          <v-label>Are you submitting this report on behalf of another person?</v-label>
          <v-radio-group v-model="report.on_behalf" inline>
            <v-radio label="No" value="No"></v-radio>
            <v-radio label="Yes" value="Yes"></v-radio>
          </v-radio-group>

          <v-label v-if="report.on_behalf == 'Yes'">Enter their name</v-label>
          <v-text-field v-if="report.on_behalf == 'Yes'" v-model="report.on_behalf_email" />

          <DirectorySelector
            :label="
              report.on_behalf == 'Yes' ? 'Search and select their supervisor' : 'Search and select your supervisor'
            "
            @selected="handleSupervisorSelect"></DirectorySelector>

          <ReportUserList v-model="report.additional_people" />

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
import { isEmpty } from "lodash";
import { router } from "@/routes";
import { useReportStore } from "@/store/ReportStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

import DateTimeSelector from "@/components/DateTimeSelector.vue";
import DirectorySelector from "@/components/DirectorySelector.vue";
import { requiredRule } from "@/utils/validation";
import ReportUserList from "@/components/report/ReportUserList.vue";

const reportStore = useReportStore();
const { initialize, addReport } = reportStore;
const { locations, urgencies } = storeToRefs(reportStore);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const isValid = ref(false);

await initialize();

const report = ref({ eventType: null, date: new Date(), urgency: "Medium", additional_people: [] });

const canSave = computed(() => {
  if (report.value.on_behalf == "Yes") {
    if (isEmpty(report.value.on_behalf_email)) return false;
  }

  return report.value.eventType && isValid.value && report.value.supervisor_email && report.value.on_behalf;
});

async function saveReport() {
  report.value.createDate = new Date();
  showOverlay("Saving Report");

  await addReport(report.value).then(() => {
    hideOverlay();
  });

  router.push("/report-an-incident/complete");
}

function handleSupervisorSelect(value) {
  if (value) report.value.supervisor_email = value.email;
  else report.value.supervisor_email = null;
}

function makeLocationTitle(item) {
  return `${item.name}: ${item.community}`;
}
</script>
