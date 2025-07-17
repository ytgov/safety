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

  <h1>Admin Dashboard</h1>

  <v-row class="mb-6">
    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/users">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-account-group</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">{{ userCount }}</div>
          <div>Users</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-map</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">{{ locationCount }}</div>
          <div>Locations</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/injest-data">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-import</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">&nbsp;</div>
          <div>Injest Data</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/committees">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-account-multiple</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">{{ committeeCount }}</div>
          <div>Committees</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" v-if="user">
      <v-card elevation="3" color="#F2760C66" to="/administration/inspection-locations">
        <v-card-text style="text-align: right">
          <v-icon
            class="float-left"
            style="font-size: 90px; opacity: 25%; position: absolute; left: 10px; margin-top: -12px"
            >mdi-map-search</v-icon
          >
          <div style="font-size: 52px; line-height: 52px">{{ inspectionLocationCount }}</div>
          <div>Inspection Locations</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";

import { useUserAdminStore } from "@/modules/administration/modules/users/store";
import { useLocationAdminStore } from "@/modules/administration/modules/locations/store";
import { useCommitteeAdminStore } from "@/modules/administration/modules/committees/store";
import { useInspectionLocationAdminStore } from "@/modules/administration/modules/inspection-locations/store";
import { useUserStore } from "@/store/UserStore";

export default {
  name: "Dashboard",
  data: () => ({
    breadcrumbs: [{ title: "Admin Dashboard", disabled: false }],
  }),
  computed: {
    ...mapState(useUserAdminStore, ["userCount"]),
    ...mapState(useLocationAdminStore, ["locationCount"]),
    ...mapState(useCommitteeAdminStore, ["committeeCount"]),
    ...mapState(useInspectionLocationAdminStore, ["inspectionLocationCount"]),
    ...mapState(useUserStore, ["user"]),
  },
  async mounted() {
    await this.getAllUsers();
    await this.getAllLocations();
    await this.getAllCommittees();
    await this.getAllInspectionLocations();
  },
  methods: {
    ...mapActions(useUserAdminStore, ["getAllUsers"]),
    ...mapActions(useLocationAdminStore, ["getAllLocations"]),
    ...mapActions(useCommitteeAdminStore, ["getAllCommittees"]),
    ...mapActions(useInspectionLocationAdminStore, ["getAllInspectionLocations"]),
  },
};
</script>
