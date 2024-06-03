<template>
  <h1 class="text-h4">Report an Incident</h1>
  <p class="text-body-2">
    Personal information is collected under the Workers' Safety and Compensation Act, Section #, for the purposes of
    Incident investigation and corrective action. For further information, contant the Director of Health, Safety &
    Wellbeing at 867-332-5974
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
              value="noloss"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>No Loss Incident (near miss)</strong> <br />
              Something has happened. No damage or injury occurred, but could have
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
              value="refusal"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>Work Refusal</strong><br />
              Refusing unsafe work process was used. Work task stopped as it created a safety hazard
            </div>
          </v-col>
          <v-col class="d-flex flex-nowrap" cols="12" md="6">
            <v-checkbox
              v-model="report.eventType"
              value="dontknow"
              class="flex-grow-0 flex-shrink-0"
              style="width: 60px; height: 40px"
              hide-details />
            <div>
              <strong>Don't Know</strong><br />
              If it is unclear what the event type is
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
            <v-label class="mb-1" style="white-space: inherit">Date and time event occurred</v-label>

            <DateSelector v-model="report.date"></DateSelector>
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit"
              >General location where the event occurred (such as stree address). Include building number if
              possible</v-label
            >
            <v-text-field v-model="report.generalLocation" hide-details />
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit"
              >Specific location where the event occurred (such as a spot in a building)</v-label
            >
            <v-text-field v-model="report.specificLocation" hide-details />
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
        <v-card-text>
          <v-label> Was Supervisor notified of this event?</v-label>

          <v-radio-group inline v-model="report.supervisorNotified">
            <v-radio value="Yes" label="Yes" class="mr-5" hide-details />
            <v-radio value="No" label="No" hide-details />
          </v-radio-group>

          <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Submit </v-btn>
        </v-card-text>
      </v-card>
    </section>
  </v-form>
</template>

<script setup>
import { router } from "@/routes";
import { useReportStore } from "@/store/ReportStore";
import DateSelector from "@/components/DateSelector.vue";
import { computed, ref } from "vue";

const reportStore = useReportStore();
const { addReport } = reportStore;

const report = ref({ eventType: null, date: new Date(), createDate: new Date(), supervisorNotified: null });

const canSave = computed(() => {
  return report.value.supervisorNotified != null && report.value.eventType;
});

async function saveReport() {
  report.value.createDate = new Date();

  await addReport(report.value).then(() => {
    router.push("/report-an-incident/complete");
  });
}
</script>
