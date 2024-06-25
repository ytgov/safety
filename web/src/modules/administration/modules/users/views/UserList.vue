<template>
  <v-breadcrumbs
    :items="breadcrumbs"
    bg-color="#7A9A01"
    style="margin: -13px -16px 10px -16px"
    class="pl-4 mb-4"
    color="white"
    active-color="#fff">
    <template v-slot:prepend>
      <v-icon color="white" icon="mdi-home"></v-icon>
    </template>
    <template v-slot:divider>
      <v-icon color="white" icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>

  <h1>Users</h1>

  <base-card showHeader="t" heading="" elevation="0">
    <template v-slot:left>
      <v-text-field
        v-model="search"
        label="Search"
        single-line
        hide-details
        append-inner-icon="mdi-magnify"
        density="compact"
        class="ml-2"></v-text-field>
    </template>
    <template v-slot:right>
      <add-user :onComplete="loadItems"></add-user>
    </template>

    <v-data-table :search="search" :headers="headers" :items="items" :loading="isLoading" @click:row="rowClick">
      <template v-slot:item.is_active="{ item }">
        <span style="color: #7a9a01" v-if="item.is_active">Active</span>
        <span style="color: orangered" v-else>Inactive</span>
      </template>

      <template v-slot:item.roles="{ item }">
        {{ (item.roles ?? []).map((r) => r.name).join(", ") }}
      </template>
    </v-data-table>
  </base-card>

  <user-editor></user-editor>
</template>
<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useUserAdminStore } from "../store";
import { useDepartmentStore } from "@/store/DepartmentStore";
import { useRoleStore } from "@/store/RoleStore";
import UserEditor from "../components/UserEditor.vue";
import { clone } from "lodash";
import AddUser from "../components/AddUser.vue";

export default {
  components: { UserEditor, AddUser },
  data: () => ({
    headers: [
      { title: "Name", key: "display_name" },
      { title: "Email", key: "email" },
      { title: "Status", key: "is_active" },
      { title: "Roles", key: "roles" },
    ],
    search: "",
  }),
  computed: {
    ...mapState(useUserAdminStore, ["users", "isLoading"]),
    ...mapState(useDepartmentStore, ["departments"]),
    ...mapState(useRoleStore, ["roles"]),
    items() {
      return this.users;
    },
    totalItems() {
      return this.users.length;
    },
    breadcrumbs() {
      return [
        {
          title: "Admin Dashboard",
          to: "/administration",
        },
        {
          title: "Users",
        },
      ];
    },
  },
  beforeMount() {
    this.loadItems();

    this.initializeDepartments();
    this.initializeRoles();
  },
  methods: {
    ...mapActions(useUserAdminStore, ["getAllUsers", "selectUser"]),
    ...mapActions(useDepartmentStore, { initializeDepartments: "initialize" }),
    ...mapActions(useRoleStore, { initializeRoles: "initialize" }),

    async loadItems() {
      await this.getAllUsers();
    },
    rowClick(event: Event, thing: any) {
      this.selectUser(clone(thing.item));
    },
  },
};
</script>
