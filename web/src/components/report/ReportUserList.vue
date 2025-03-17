<template>
  <v-label v-if="modelValue.length > 0">Additional linked users</v-label>

  <v-list
    v-if="modelValue.length > 0"
    density="compact"
    class="py-0"
    style="border: 1px #999 solid; border-radius: 4px">
    <v-list-item
      v-for="(user, idx) in modelValue"
      :key="user.id"
      :style="{ borderBottom: idx < modelValue.length - 1 ? '1px #999 solid' : 'none' }"
      :title="user"
      class="py-3">
      <template #append>
        <v-btn color="error" class="my-0" size="x-small" variant="text" @click="removeLinkedUserClick(idx)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-list-item>
  </v-list>

  <DirectorySelector
    ref="directorySelector"
    label="Add additional people (optional)"
    @selected="addLinkedUserClick"
    :class="{ 'mt-4': modelValue.length > 0 }" />
</template>

<script setup>
import { ref } from "vue";

import DirectorySelector from "../DirectorySelector.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps(["modelValue", "editable"]);

const directorySelector = ref(null);

function addLinkedUserClick(user) {
  if (user) {
    props.modelValue.push(user.email);
    emit("update:modelValue", props.modelValue);

    directorySelector.value.clear();
  }
}

function removeLinkedUserClick(index) {
  props.modelValue.splice(index, 1);
  emit("update:modelValue", props.modelValue);
}
</script>
