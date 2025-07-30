<template>
  <v-breadcrumbs
    :items="breadcrumbs"
    bg-color="#7A9A01"
    style="margin: -13px -16px 10px -16px"
    class="pl-4 mb-4"
    color="white"
    active-color="#fff"
  >
    <template v-slot:prepend>
      <v-icon
        color="white"
        icon="mdi-home"
      ></v-icon>
    </template>
    <template v-slot:divider>
      <v-icon
        color="white"
        icon="mdi-chevron-right"
      ></v-icon>
    </template>
  </v-breadcrumbs>

  <h1>Injest-Data</h1>

  <base-card
    showHeader="t"
    heading=""
    elevation="0"
  >
    <template v-slot:right>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        class="mr-5"
        @click="showEditor = true"
      >
        Add Data
      </v-btn>
    </template>

    <DataInjestionEditor v-model="showEditor" />
  </base-card>
</template>
<script lang="ts">
import DataInjestionEditor from "@/modules/administration/modules/injest-data/components/DataInjestionEditor.vue";

export default {
  components: { DataInjestionEditor },
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
