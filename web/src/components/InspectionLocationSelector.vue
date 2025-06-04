<template>
  <v-select :items="filteredLocations" item-title="title" item-value="id"></v-select>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";

import { useInspectionLocationStore } from "@/store/InspectionLocationStore";

const store = useInspectionLocationStore();
const { loadInspectionLocations } = store;

loadInspectionLocations();

const { inspectionlocations } = storeToRefs(store);

const props = defineProps({
  department: {
    type: String,
    default: null,
  },
});

const filteredLocations = computed(() => {
  if (inspectionlocations.value.length === 0) {
    return [];
  }

  if (!isNil(props.department)) {
    return inspectionlocations.value.filter((location) => location.department_code === props.department);
  }

  return inspectionlocations.value;
});
</script>
