<template>
  <v-select :items="statusOptions" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
class IncidentStatuses {
  static OPEN = { code: "Open", name: "Open" };
  static CLOSED = { code: "Closed", name: "Closed" };
  static IN_PROGRESS = { code: "InProg", name: "In Progress" };
  static DUPLICATE = { code: "Dup", name: "Duplicate" };
  static NO_ACTION = { code: "NoAct", name: "No Action" };
}

const statusOptions = [
  IncidentStatuses.OPEN,
  IncidentStatuses.CLOSED,
  IncidentStatuses.IN_PROGRESS,
  IncidentStatuses.DUPLICATE,
  IncidentStatuses.NO_ACTION,
];
</script>
