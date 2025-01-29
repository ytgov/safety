<template>
  <v-select :items="statusOptions" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
class HazardStatuses {
  static OPEN = { code: "Open", name: "Open" };
  static IN_PROGRESS = { code: "InPro", name: "In Progress" };
  static DUPLICATE = { code: "Dup", name: "Duplicate" };
  static NO_ACTION = { code: "NoAct", name: "No Action" };
  static REMEDIATED = { code: "Remed", name: "Remediated" };
}

const statusOptions = [
  HazardStatuses.OPEN,
  HazardStatuses.IN_PROGRESS,
  HazardStatuses.DUPLICATE,
  HazardStatuses.NO_ACTION,
  HazardStatuses.REMEDIATED,
];
</script>
