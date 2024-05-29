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

      <CreateIncidentButton />
    </v-col>
    <v-divider vertical />

    <v-col cols="12" sm="6">
      <RouterLink to="/sign-in">
        <v-alert type="success" prominent color="primary" title="Sign in" icon="mdi-login">
          to see your submissions and cases assigned to you
        </v-alert>
      </RouterLink>
    </v-col>
  </v-row>
</template>

<script setup>
import CreateIncidentButton from "@/components/incident/CreateButton.vue";
</script>
