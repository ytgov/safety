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

  <h1>Committees</h1>

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
      <add-committee :onComplete="loadItems"></add-committee>
    </template>

    <v-data-table :search="search" :headers="headers" :items="items" :loading="isLoading" @click:row="rowClick">
    </v-data-table>
  </base-card>
</template>
<script lang="ts">
import { mapActions, mapState } from "pinia";

import AddCommittee from "@/modules/administration/modules/committees/components/AddCommittee.vue";

import { useCommitteeAdminStore } from "../store";

export default {
  components: { AddCommittee },
  data: () => ({
    headers: [
      { title: "Department", key: "department_code" },
      { title: "Name", key: "name" },
      { title: "Users", key: "users.length" },
    ],
    search: "",
  }),
  computed: {
    ...mapState(useCommitteeAdminStore, ["committees", "isLoading"]),
    items() {
      return this.committees;
    },
    totalItems() {
      return this.committees.length;
    },
    breadcrumbs() {
      return [
        {
          title: "Admin Dashboard",
          to: "/administration",
        },
        {
          title: "Committees",
        },
      ];
    },
  },
  beforeMount() {
    this.loadItems();
  },
  methods: {
    ...mapActions(useCommitteeAdminStore, ["getAllCommittees", "selectCommittee"]),

    async loadItems() {
      await this.getAllCommittees();
    },
    rowClick(event: Event, thing: any) {
      this.$router.push(`/administration/committees/${thing.item.id}`);
    },
  },
};
</script>
