<template>
  <v-select :items="committees" item-title="name" item-value="id" />
</template>

<script setup>
import { useCommitteeStore } from "@/store/CommitteeStore";
import { storeToRefs } from "pinia";

const store = useCommitteeStore();
const { loadCommittees } = store;

loadCommittees();
const { committees } = storeToRefs(store);
</script>
