<template>
  <v-select :items="statusOptions" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
class IncidentStatuses {
  static OPEN = { code: "Open", name: "Open" };
  static IN_PROGRESS = { code: "In Progress", name: "In Progress" };
  static COMPLETE = { code: "Complete", name: "Complete" };
  static BLOCKED = { code: "Blocked", name: "Blocked" };
}

const statusOptions = [IncidentStatuses.OPEN, IncidentStatuses.IN_PROGRESS, IncidentStatuses.COMPLETE];
</script>
