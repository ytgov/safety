<template>
  <h1 class="text-h4">Report a Safety Concern - Offline</h1>
  <p class="text-body-2">
    Personal information is collected under the Workers' Safety and Compensation Act, Section #, for the purposes of
    Incident investigation and corrective action. For further information, contant the Director of Health, Safety &
    Wellbeing at 867-332-5974.
  </p>
  <v-overlay v-model="isLoading" class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate size="64" class="mb-5" color="#f3b228" width="6"></v-progress-circular>
    </div>
  </v-overlay>

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
              <strong>Incident</strong> <br />
              Something has happened and caused an injury, equipment damage, property damage or environmental issue
            </div>
          </v-col>
          <v-col class="d-flex flex-nowrap" cols="12" md="6" offset-md="6">
            <v-checkbox
              v-model="report.eventType"
              value="inspetion"
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

        <v-row class="pa-5 pb-0">
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
          <v-row>
            <v-col cols="12" sm="6" class="py-0">
              <v-label>Your email</v-label>
              <v-text-field v-model="report.on_behalf_email" :rules="[requiredRule, emailRule]" type="email" />
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-label>Supervisor's email</v-label>
              <v-text-field v-model="report.supervisor_email" :rules="[requiredRule, emailRule]" type="email" />
            </v-col>
          </v-row>

          <div class="d-flex">
            <v-btn color="primary" @click="saveReport" class="mb-0" :disabled="!canSave">Submit </v-btn>
          </div>
          <v-alert type="warning" class="mt-5 mb-1">
            You are submitting this report offline. When your device reconnects to the internet, this report will be
            uploaded.
          </v-alert>
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
import { requiredRule, emailRule } from "@/utils/validation";

const reportStore = useReportStore();
const { initialize, addReportOffline } = reportStore;
const { locations, urgencies, isLoading } = storeToRefs(reportStore);

const isValid = ref(false);

await initialize();

const report = ref({ eventType: null, date: new Date(), urgency: "Medium" });

const canSave = computed(() => {
  return report.value.eventType && isValid.value;
});

async function saveReport() {
  report.value.createDate = new Date();

  await addReportOffline(report.value).then(() => {
    router.push("/report-an-incident-offline/complete");
  });
}
</script>
