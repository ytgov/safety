<template>
  <v-breadcrumbs :items="[{ title: 'Home', to: '/' }, { title: 'Incident Details' }]" />

  <div v-if="selectedReport">
    <div class="float-right">
    <!--   <v-btn color="primary" class="my-0 mt-1" @click="supervisorClick">
        <v-icon class="mr-3">mdi-check</v-icon> Supervisor Signature</v-btn
      > -->
      <OperationMenu />
    </div>

    <h1 class="text-h4 mb-2">
      {{ selectedReport.incident_type_description }} Details
      <v-chip class="ml-3" style="margin-top :-8px" color="info" variant="flat">
        <strong>Status:</strong> &nbsp; {{ selectedReport.status_name }}
      </v-chip>
    </h1>
    <div class="my-3" style="clear: both"></div>

    <!-- <h2 class="text-h6">
      Reported on {{ formatDate(selectedReport.created_at) }} by {{ selectedReport.reporting_person_email }}
    </h2> -->

    <div class="mb-5" style="background-color: #eee; border: 1px #aaa solid; border-radius: 5px">
      <v-stepper
        v-model="stepperValue"
        flat
        style="clear: both"
        alt-labels
        bg-color="#ffffff00"
        hide-actions
        :mobile="false">
        <v-stepper-header>
          <v-stepper-item
            value="1"
            :complete="stepperValue > 0"
            title="Incident Reported"
            :color="stepperValue > 0 ? 'success' : ''"
            :subtitle="formatDate(selectedReport.created_at)">
          </v-stepper-item>
          <v-divider />

          <v-stepper-item
            value="2"
            :complete="stepperValue > 1"
            :color="stepperValue > 1 ? 'success' : ''"
            title="Investigation Completed">
            <small class="mt-1">{{ lockDate }}</small>
          </v-stepper-item>
          <v-divider />

          <v-stepper-item
            value="3"
            :complete="stepperValue > 2"
            :color="stepperValue > 2 ? 'success' : ''"
            title="Action Plan Created">
            <small class="mt-1">{{ uploadDate }}</small>
          </v-stepper-item>
          <v-divider />

          <v-stepper-item
            value="4"
            :complete="stepperValue > 3"
            :color="stepperValue > 3 ? 'success' : ''"
            title="Action Plan Approved">
            <small class="mt-1">{{ financeApproveDate }}</small>
            <small>{{ financeApproveName }}</small>
          </v-stepper-item>
          <v-divider />

          <v-stepper-item
            value="5"
            :complete="stepperValue > 4"
            :color="stepperValue > 4 ? 'success' : ''"
            title="Remediation Completed">
            <small class="mt-1" v-if="stepperValue > 4">Ready to be activated</small>
          </v-stepper-item>
          <v-divider />

          <v-stepper-item
            value="6"
            :complete="stepperValue > 5"
            :color="stepperValue > 5 ? 'success' : ''"
            title="Final Review">
            <small class="mt-1" v-if="stepperValue > 5">Ready to be activated</small>
          </v-stepper-item>
        </v-stepper-header>
      </v-stepper>
    </div>

    <section class="mb-5">
      <v-row>
        <v-col cols="12" md="5">
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Incident Basics</h4>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <v-label>Reported by:</v-label>
              <v-text-field
                :value="selectedReport.reporting_person_email"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>

              <v-label>Department:</v-label>
              <v-text-field
                :value="selectedReport.department_name"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>

              <v-label>Supervisor:</v-label>
              <v-text-field
                :value="selectedReport.supervisor_email"
                append-inner-icon="mdi-lock"
                readonly></v-text-field>
            </v-card-text>
          </v-card>

          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <div style="width: 100%" class="d-flex">
                <h4 class="text-h6">Action Plan</h4>
                <v-spacer />
                <v-btn size="x-small" icon="mdi-plus" color="primary" class="my-0" @click="addActionClick"></v-btn>
              </div>
            </v-card-item>
            <v-card-text class="pt-2">
              <ActionList></ActionList>
              <ActionCreate v-model="showActionAdd" @doClose="showActionAdd = false"></ActionCreate>
            </v-card-text>
          </v-card>

          <v-card class="default">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <h4 class="text-h6">Hazards</h4>
            </v-card-item>
            <v-card-text class="pt-5">
              <HazardList></HazardList>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-card class="default mb-5">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <h4 class="text-h6">What Happened?</h4>
            </v-card-item>

            <v-row class="pa-5 pt-2 pb-6">
              <!--  <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">General location where the event occurred</v-label>
            <v-text-field :value="selectedReport.location_code" hide-details />
          </v-col>
          <v-col cols="12" md="12">
            <v-label class="mb-1" style="white-space: inherit">Specific location where the event occurred</v-label>
            <v-text-field v-model="selectedReport.location_detail" hide-details />
          </v-col> -->
              <v-col cols="12" md="12">
                <v-label class="mb-1" style="white-space: inherit">Description of event</v-label>
                <v-textarea v-model="selectedReport.description" hide-details />
              </v-col>

              <v-col cols="12" v-if="selectedReport.attachments && selectedReport.attachments.length > 0">
                <div>
                  <v-label>Supporting images</v-label>

                  <div class="d-flex pt-2">
                    <v-chip color="info" variant="flat" v-for="attach of selectedReport.attachments" class="mr-3">{{
                      attach.file_name
                    }}</v-chip>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="12">
                <v-label>Investigation</v-label>
                <v-textarea hide-details />

                <v-btn color="primary" class="mb-0 mt-6">Save</v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-card class="default">
            <v-card-item class="py-4 px-6 mb-2 bg-sun">
              <h4 class="text-h6">Urgency</h4>
            </v-card-item>
            <v-card-text class="pt-5"> {{ selectedReport.urgency_code }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <v-row class="mb-5">
      <v-col cols="12" md="6"> </v-col>
      <v-col cols="12" md="6"> </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";

import OperationMenu from "@/components/incident/OperationMenu.vue";
import ActionList from "@/components/action/ActionList.vue";
import HazardList from "@/components/hazard/HazardList.vue";
import ActionCreate from "@/components/action/ActionCreate.vue";

import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { initialize, loadReport } = reportStore;
const { locations, urgencies, selectedReport } = storeToRefs(reportStore);

const router = useRoute();
const reportId = router.params.id;

await initialize();
await loadReport(reportId);

const showActionAdd = ref(false);

const stepperValue = computed(() => {
  if (!selectedReport.value) return 0;

  if (selectedReport.value.status_name == "Initial Report") return 1;
  if (selectedReport.value.status_name == "Supervisor Review") return 2;

  return 0;
});

function formatDate(input) {
  if (!input) return "";
  return DateTime.fromISO(input.toString()).toFormat("MMMM dd, yyyy");
}

function supervisorClick() {
  selectedReport.value.status_code = "SUP";
  selectedReport.value.status_name = "Investigation Completed";
}

function addActionClick() {
  showActionAdd.value = true;
}
</script>
