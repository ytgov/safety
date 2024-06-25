<template>
  <v-dialog v-model="visible" persistent max-width="700">
    <v-card v-if="selectedUser">
      <v-toolbar color="primary" variant="dark" title="Edit User">
        <v-spacer></v-spacer>
        <v-btn icon @click="close" color="white"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              label="Name"
              v-model="selectedUser.display_name"
              readonly
              variant="outlined"
              density="comfortable"
              append-inner-icon="mdi-lock" />
            <v-text-field
              label="Email"
              v-model="selectedUser.email"
              readonly
              variant="outlined"
              density="comfortable"
              append-inner-icon="mdi-lock" />

            <v-select
              label="Status"
              v-model="selectedUser.is_active"
              :items="[
                { value: 1, title: 'Active' },
                { value: 0, title: 'Inactive' },
              ]"
              variant="outlined"
              density="comfortable" />
          </v-col>
          <v-col>
            <div v-for="(role, idx) of selectedUser.roles">
              <div class="d-flex">
                <v-select
                  label="Role"
                  v-model="role.role_type_id"
                  :items="roles"
                  item-title="name"
                  item-value="id"
                  hide-details />

                <v-btn
                  class="ml-2"
                  icon="mdi-delete"
                  size="small"
                  color="warning"
                  @click="removeRoleClick(idx)"></v-btn>
              </div>
              <v-autocomplete
                v-if="departmentRelevantList.includes(role.role_type_id)"
                class="mt-5"
                label="Department"
                v-model="role.department_code"
                :items="departments"
                item-title="name"
                hide-details
                item-value="code" />

              <v-divider v-if="idx < selectedUser.roles.length - 1" class="my-4" color="black" :opacity="0.4" />
            </div>
            <v-btn @click="addRoleClick" color="info" class="float-right mt-4">Add role</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="mx-4 mb-2">
        <v-btn color="primary" variant="flat" @click="saveUser()">Save</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="yg_sun" variant="outlined" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useUserAdminStore } from "../store";
import { useDepartmentStore } from "@/store/DepartmentStore";
import { useRoleStore } from "@/store/RoleStore";

export default {
  name: "UserEditor",
  data: () => ({
    departmentRelevantList: [3, 4],
  }),
  computed: {
    ...mapState(useUserAdminStore, ["selectedUser"]),
    ...mapState(useDepartmentStore, ["departments"]),
    ...mapState(useRoleStore, ["roles"]),

    visible() {
      return this.selectedUser ? true : false;
    },
  },
  methods: {
    ...mapActions(useUserAdminStore, ["unselectUser", "saveUser"]),
    close() {
      this.unselectUser();
    },

    addRoleClick() {
      if (!this.selectedUser) return;
      this.selectedUser.roles = this.selectedUser.roles || [];

      (this.selectedUser.roles || []).push({
        role_type_id: 1,
        user_id: this.selectedUser.id,
        start_date: new Date(),
        department_code: undefined, 
      });
    },
    removeRoleClick(idx: number) {
      if (this.selectedUser) (this.selectedUser.roles || []).splice(idx, 1);
    },
  },
};
</script>
