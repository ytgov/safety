<template>
  <div v-for="(row, idx) in rows" :key="idx" class="mb-2">
    <v-row dense align="center">
      <v-col cols="12" md="5">
        <v-text-field v-model="row.concern" label="Problem or concern" hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="row.action" label="Action taken or proposed" hide-details />
      </v-col>
      <v-col cols="10" md="2">
        <DateSelector v-model="row.target_date" label="Target date" :teleport="true" />
      </v-col>
      <v-col cols="2" md="1" class="text-right">
        <v-btn icon="mdi-close" size="small" variant="tonal" color="error" @click="remove(idx)" />
      </v-col>
    </v-row>
  </div>

  <v-btn size="small" variant="flat" color="info" prepend-icon="mdi-plus" @click="add">Add item</v-btn>
</template>

<script setup>
import { computed } from "vue";
import DateSelector from "@/components/DateSelector.vue";

const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emit = defineEmits(["update:modelValue"]);

const rows = computed(() => props.modelValue);

function add() {
  emit("update:modelValue", [...props.modelValue, { concern: "", action: "", target_date: null }]);
}

function remove(idx) {
  const next = props.modelValue.slice();
  next.splice(idx, 1);
  emit("update:modelValue", next);
}
</script>
