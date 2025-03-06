<template>
  <v-select :items="statusOptions" item-title="name" item-value="code" />
</template>

<script setup lang="ts">
class IncidentStatuses {
  static OPEN = { code: "Open", name: "Open" };
  static READY = { code: "Ready", name: "Ready" };
  static COMPLETE = { code: "Complete", name: "Complete" };
  static BLOCKED = { code: "Blocked", name: "Blocked" };
}

const statusOptions = [IncidentStatuses.OPEN, IncidentStatuses.READY, IncidentStatuses.COMPLETE];
</script>
