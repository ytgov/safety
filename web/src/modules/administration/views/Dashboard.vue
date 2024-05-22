<template>
  <v-breadcrumbs
    :items="breadcrumbs"
    bg-color="#7A9A01"
    style="margin: -13px -16px 10px -16px"
    class="pl-4 mb-4"
    color="white"
    active-color="#fff">
    <template v-slot:prepend>
      <v-icon color="white" icon="mdi-home"></v-icon>
    </template>
    <template v-slot:divider>
      <v-icon color="white" icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>

  <h1>Survey Tool Dashboard</h1>

  <v-row class="mb-6">
    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/participants">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-account-group</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">&nbsp</div>
          <div>Participants</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/results">
        <v-card-text style="text-align: right" color="white">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-chart-bar</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">&nbsp;</div>
          <div>Survey Results</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/surveys">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-head-question</v-icon
          >
          <div style="font-size: 52px; line-height: 52px"></div>
          <div>Surveys</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" v-if="user.IS_ADMIN == 'Y'">
      <v-card elevation="3" color="#F2760C66" to="/administration/users">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-account-multiple</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">{{ userCount }}</div>
          <div>Users</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/emailer">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-email</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">&nbsp</div>
          <div>Emailer</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- <div v-if="mySurveys.length > 0">
    <h2 class="mb-3">My Questions</h2>
    <v-row>
      <v-col cols="12" md="6" v-for="question of mySurveys">
        <moderator-card :question="question"></moderator-card>
      </v-col>
    </v-row>
  </div> -->
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";

import { useUserAdminStore } from "../modules/users/store";
import { useUserStore } from "@/store/UserStore";

export default {
  name: "Dashboard",
  data: () => ({
    breadcrumbs: [{ title: "Home", disabled: false }],
  }),
  computed: {
    ...mapState(useUserAdminStore, ["userCount"]),
    ...mapState(useUserStore, ["user"]),
  },
  async mounted() {
    await this.getAllUsers();
  },
  methods: {
    ...mapActions(useUserAdminStore, ["getAllUsers"]),
  },
};
</script>
