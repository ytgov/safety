<template>
  <h1 class="text-h4">YG Safety Portal</h1>

  <p class="text-h6 mb-8">
    This portal is managed by PSC and used by all YG staff to submit and track Health, Safety and Wellbeing hazards,
    near misses and incidents.
  </p>

  <v-divider class="my-5" />

  <v-row>
    <v-col cols="12" sm="6">
      <p class="text-subtitle-1">
        All employees can use this application to submit reports while online or offline. To begin that process, click
        the button below.
      </p>

      <CreateIncidentButton block />
    </v-col>
    <!-- <v-divider vertical /> -->

    <v-col cols="12" sm="6">
      <div v-if="isAuthenticated == true">
        <ReportListCard></ReportListCard>
        <SMTListCard v-if="hasRole('SMT')"></SMTListCard>
        <SupervisorCard></SupervisorCard>
      </div>

      <div v-else @click="loginClick" class="ma-0 cursor-pointer">
        <v-alert type="success" prominent color="primary" title="Sign in" icon="mdi-login">
          to see your submissions and cases assigned to you
        </v-alert>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import CreateIncidentButton from "@/components/incident/CreateButton.vue";
import ReportListCard from "@/components/report/ReportListCard.vue";
import SMTListCard from "@/components/report/SMTListCard.vue";
import SupervisorCard from "@/components/report/SupervisorCard.vue";

import { AuthHelper } from "@/plugins/auth";
import { useAuth0 } from "@auth0/auth0-vue";
import { useUserStore } from "@/store/UserStore";
import { useReportStore } from "@/store/ReportStore";

const { isAuthenticated } = useAuth0();

const userStore = useUserStore();
const { hasRole } = userStore;

const reportStore = useReportStore();
const { initialize } = reportStore;

//onMounted(async () => {
await initialize();
//});
/* const user = computed(() => {
  return AuthHelper.user;
}); */

/* const isAuthenticated = computed(() => {
  return AuthHelper.isAuthenticated;
}); */

function loginClick() {
  AuthHelper.loginWithRedirect({
    appState: { target: window.location.pathname },
  });
}
</script>
