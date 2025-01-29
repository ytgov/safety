<template>
  <v-select :items="urgencies" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useHazardStore } from "@/store/HazardStore";

const hazardStore = useHazardStore();
hazardStore.loadUrgency();
const { urgencies } = storeToRefs(hazardStore);
</script>
