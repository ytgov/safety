<template>
  <v-autocomplete :items="categoryOptions" />
</template>

<script setup lang="ts">
const categoryOptions = [
  { title: "Chemical", value: "Chemical" },
  { title: "Biological", value: "Biological" },
  { title: "Ergonomic", value: "Ergonomic" },
  { title: "Physical Conditions", value: "Physical Conditions" },
  { title: "Safety", value: "Safety" },
];
</script>
