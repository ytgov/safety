<template>
  <v-autocomplete :items="locations" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";

const reportStore = useReportStore();
const { locations } = storeToRefs(reportStore);

reportStore.loadLocations();
</script>
