<template>
  <v-select :items="departmentCommittees" item-title="name" item-value="id" />
</template>

<script setup>
import { computed } from "vue";
import { useCommitteeStore } from "@/store/CommitteeStore";
import { storeToRefs } from "pinia";
import { isNil } from "lodash";

const props = defineProps(["department"]);

const store = useCommitteeStore();
const { loadCommittees } = store;

loadCommittees();
const { committees } = storeToRefs(store);

const departmentCommittees = computed(() => {
  if (isNil(props.department)) return committees.value;
  return committees.value.filter((committee) => committee.department_code == props.department);
});
</script>
