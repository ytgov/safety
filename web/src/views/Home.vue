<template>
  <h1 class="text-h4">STICH</h1>

  <v-row>
    <v-col cols="12" md="6">
      <p class="text-h6 mb-2">
        This portal is managed by PSC and used by all YG staff to submit and track Health, Safety and Wellbeing hazards,
        near misses and incidents.
      </p>
      <v-divider class="mb-2" />
      <p style="font-size: 0.75rem; color: #000000bb !important">
        All personal information is collected under the authority of section 15 (c) (i) of the Access to Information and
        Protection of Privacy Act. It is collected and used for the purposes of hazard and incident management related
        to the <em>Workers' Safety and Compensation Act</em>.
      </p>
    </v-col>
    <v-col cols="12" md="6">
      <p class="text-subtitle-1">
        All employees can use this application to submit reports whether online or offline. To begin that process, click
        the button below.
      </p>

      <CreateIncidentButton block />

      <v-btn v-if="hasRole('Inspector')" color="info" to="/inspection" size="large" block>
        <v-icon class="mr-4">mdi-magnify-scan</v-icon>
        Start Inspection
      </v-btn>

      <div v-if="!isAuthenticated && !isOffline" @click="loginClick" class="my-4 cursor-pointer">
        <v-alert type="success" prominent color="primary" title="Sign in" icon="mdi-login">
          to see your submissions and cases assigned to you
        </v-alert>
      </div>
    </v-col>
  </v-row>

  <v-divider class="mb-5" />

  <v-row v-if="!isOffline && isAuthenticated">
    <!-- the first tow card show whether they have items or not, others are conditional -->
    <v-col cols="12" md="6"> <ReportListCard /><SupervisorCard /> </v-col>
    <v-col cols="12" md="6"> <ActionCard /> <SafetyAuthorityListCard /> </v-col>
  </v-row>
</template>

<script setup>
import { storeToRefs } from "pinia";
import CreateIncidentButton from "@/components/incident/CreateButton.vue";
import ReportListCard from "@/components/report/ReportListCard.vue";
import SafetyAuthorityListCard from "@/components/report/SafetyAuthorityListCard.vue";
import SupervisorCard from "@/components/report/SupervisorCard.vue";

import { useAuth0 } from "@auth0/auth0-vue";
import { useUserStore } from "@/store/UserStore";
import { useReportStore } from "@/store/ReportStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import ActionCard from "@/components/report/ActionCard.vue";

const interfaceStore = useInterfaceStore();
const { isOffline } = storeToRefs(interfaceStore);

const { isAuthenticated, loginWithRedirect } = useAuth0();

const userStore = useUserStore();
const { hasRole } = userStore;
const { user } = storeToRefs(userStore);

const reportStore = useReportStore();
const { initialize, getStoredReports } = reportStore;

await initialize();

function loginClick() {
  loginWithRedirect({
    appState: { target: window.location.pathname },
  });
}
</script>
