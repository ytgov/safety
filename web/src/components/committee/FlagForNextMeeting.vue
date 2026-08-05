<template>
  <v-checkbox
    :model-value="!!modelValue"
    label="Flag for discussion in the next meeting"
    density="compact"
    hide-details
    class="flag-check ml-1"
    @update:model-value="(v) => emit('update:modelValue', !!v)" />
</template>

<script setup>
// A flagged row is copied into the Outstanding Items list when the committee's next
// meeting is set up (see the carry-forward endpoint on the committee meeting router).
defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
.flag-check :deep(.v-label) {
  font-size: 13px;
  opacity: 0.8;
}
</style>
