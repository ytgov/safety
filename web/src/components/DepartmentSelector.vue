<template>
  <v-select :items="departments" item-title="code" item-value="code"></v-select>
</template>

<script setup lang="ts">
import { useDepartmentStore } from "@/store/DepartmentStore";
import { storeToRefs } from "pinia";

const store = useDepartmentStore();
const { loadDepartments } = store;

loadDepartments();

const { departments } = storeToRefs(store);
</script>
