<template>
  <v-select :items="users" item-title="display_name">
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <v-list-item-subtitle v-if="showEmail">{{ item.raw.email }} </v-list-item-subtitle>
      </v-list-item>
    </template>


  </v-select>
</template>

<script setup>
import { storeToRefs } from "pinia";

import { useUserAdminStore } from "@/modules/administration/modules/users/store";

const props = defineProps({
  showEmail: {
    type: Boolean,
    default: false,
  },
})


const userStore = useUserAdminStore();
const { getAllUsers } = userStore;
const { users } = storeToRefs(userStore);
getAllUsers();
</script>
