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

  <h1>Inspection Locations</h1>

  <base-card showHeader="t" heading="" elevation="0">
    <template v-slot:left>
      <v-text-field
        v-model="search"
        label="Search"
        single-line
        hide-details
        append-inner-icon="mdi-magnify"
        density="compact"
        class="ml-2"></v-text-field>
    </template>
    <template v-slot:right>
      <add-location :onComplete="loadItems"></add-location>
    </template>

    <v-data-table :search="search" :headers="headers" :items="items" :loading="isLoading" @click:row="rowClick">
    </v-data-table>

    <location-editor></location-editor>
  </base-card>
</template>
<script lang="ts">
import { mapActions, mapState } from "pinia";
import { clone } from "lodash";

import AddLocation from "@/modules/administration/modules/inspection-locations/components/AddLocation.vue";
import LocationEditor from "@/modules/administration/modules/inspection-locations/components/LocationEditor.vue";

import { useInspectionLocationAdminStore } from "../store";

export default {
  components: { AddLocation, LocationEditor },
  data: () => ({
    headers: [
      { title: "Name", key: "name" },
      { title: "Descripiton", key: "description" },
      { title: "Department", key: "department_code" },
    ],
    search: "",
  }),
  computed: {
    ...mapState(useInspectionLocationAdminStore, ["locations", "isLoading"]),
    items() {
      return this.locations;
    },
    totalItems() {
      return this.locations.length;
    },
    breadcrumbs() {
      return [
        {
          title: "Admin Dashboard",
          to: "/administration",
        },
        {
          title: "Inspection Locations",
        },
      ];
    },
  },
  beforeMount() {
    this.loadItems();
  },
  methods: {
    ...mapActions(useInspectionLocationAdminStore, ["getAllInspectionLocations", "selectLocation"]),

    async loadItems() {
      await this.getAllInspectionLocations();
    },
    rowClick(event: Event, thing: any) {
      this.selectLocation(clone(thing.item));
    },
  },
};
</script>
