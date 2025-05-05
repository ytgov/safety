<template>
  <v-select :items="users" item-title="display_name"></v-select>
</template>

<script setup>
import { storeToRefs } from "pinia";

import { useUserAdminStore } from "@/modules/administration/modules/users/store";

const userStore = useUserAdminStore();
const { getAllUsers } = userStore;
const { users } = storeToRefs(userStore);
getAllUsers();
</script>
