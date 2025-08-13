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

  <h1>Injest-Data</h1>

  <p>
    This process loads a CSV file into the system from external sources for reporting purposes. The uploaded data will
    not be available or visible within this application.
  </p>
  <div class="">
    <v-btn color="primary" variant="flat" size="large" class="mr-5" @click="showEditor = true">
      Upload Data File
    </v-btn>
  </div>

  <DataIngestionEditDialog v-model="showEditor" />
</template>
<script lang="ts">
import DataIngestionEditDialog from "@/modules/administration/modules/data-ingestions/components/DataIngestionEditDialog.vue";

export default {
  components: { DataIngestionEditDialog },
  data: () => ({
    showEditor: false,
    headers: [
      { title: "Code", key: "code" },
      { title: "Name", key: "name" },
      { title: "Descripiton", key: "description" },
    ],
    search: "",
  }),
  computed: {
    breadcrumbs() {
      return [
        {
          title: "Admin Dashboard",
          to: "/administration",
        },
        {
          title: "Injest-Data",
        },
      ];
    },
  },
};
</script>
