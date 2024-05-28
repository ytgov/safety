<template>
  <div class="hello">
    <!--  <h1>{{ title }}</h1> -->
    <p>The URL you used to reach this site appears to be incorrect</p>

    <CreateHazardButton class="mr-12"></CreateHazardButton>

    <CreateIncidentButton></CreateIncidentButton>
  </div>
</template>

<script setup>
import CreateHazardButton from "@/components/hazard/CreateButton.vue";
import CreateIncidentButton from "@/components/incident/CreateButton.vue";
</script>
