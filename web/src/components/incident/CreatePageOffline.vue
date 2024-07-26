<template>
  <h1 class="text-h4">Report an Incident - Offline</h1>
  <p class="text-body-2">
    Personal information is collected under the Workers' Safety and Compensation Act, Section #, for the purposes of
    Incident investigation and corrective action. For further information, contant the Director of Health, Safety &
    Wellbeing at 867-332-5974.
  </p>

  <v-form class="mt-6">
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
              Something has been observed that could potentially lead to an incident or injury<br />
              - Unsafe conditions, such as heavy item placed too close to an edge where it could fall; or<br />
              - Unsafe act, such as a worker modifying PPE for comfort while impacting its effectiveness
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
              <strong>Incident</strong> <br />
              Something has happened and caused an injury, equipment damage, property damage or environmental issue
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

        <v-row class="pa-5 pb-6">
          <v-col cols="12" md="12">
            <v-row>
              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Date and time event occurred</v-label>
                <DateTimeSelector v-model="report.date"></DateTimeSelector>
              </v-col>

              <v-col cols="12" sm="6">
                <v-label class="mb-1" style="white-space: inherit">Urgency level</v-label>
                <v-select
                  hide-details
                  v-model="report.urgency"
                  :items="urgencies"
                  item-title="name"
                  item-value="code"></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">General location where the event occurred</v-label>
            <v-autocomplete
              v-model="report.location_code"
              :items="locations"
              item-title="name"
              item-value="code"
              hide-details />
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit"
              >Specific location where the event occurred (such as a spot in a building)</v-label
            >
            <v-text-field v-model="report.location_detail" hide-details />
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit"
              >Describe the event in your own words. Please include any details or thoughts that may be helpful to know
              such as weather or time of day</v-label
            >
            <v-textarea v-model="report.description" hide-details />
          </v-col>
        </v-row>
      </v-card>
    </section>

    <v-divider class="my-3" />

    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">Submit Report</h4>
        </v-card-item>
        <v-card-text class="pt-5">
          <v-label>Supervisor's email</v-label>
          <v-text-field v-model="report.supervisor_email" />

          <v-alert type="warning">
            You are submitting this report offline. When your device reconnects to the internet, this report will be
            uploaded.
          </v-alert>

          <!-- <v-label>Are you submitting this report on behalf of another person?</v-label>
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
 -->
          <!--   <v-label>Attach supporting images</v-label>
          <v-file-input
            v-model="report.files"
            prepend-icon=""
            prepend-inner-icon="mdi-camera"
            chips
            multiple
            accept="image/*"></v-file-input> -->

          <div class="d-flex">
            <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Submit </v-btn>

            <div v-if="isAuthenticated == false" class="pt-6 ml-4 text-warning">
              * You must be authenticated to submit
            </div>
          </div>
        </v-card-text>
      </v-card>
    </section>
  </v-form>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { router } from "@/routes";
import { useReportStore } from "@/store/ReportStore";
import DateTimeSelector from "@/components/DateTimeSelector.vue";

const reportStore = useReportStore();
const { initialize, addReportOffline } = reportStore;
const { locations, urgencies } = storeToRefs(reportStore);

await initialize();

const report = ref({ eventType: null, date: new Date(), urgency: "Medium" });

const canSave = computed(() => {
  return report.value.eventType;
});

async function saveReport() {
  report.value.createDate = new Date();

  console.log("SAVING OFFLINE REPORT", report.value);

  await addReportOffline(report.value).then(() => {
    //router.push("/report-an-incident/complete");
  });
}
</script>
