<template>
  <v-breadcrumbs :items="breadcrumbs" bg-color="#7A9A01" style="margin: -13px -16px 10px -16px" class="pl-4 mb-4"
    color="white" active-color="#fff">
    <template v-slot:prepend>
      <v-icon color="white" icon="mdi-home"></v-icon>
    </template>
    <template v-slot:divider>
      <v-icon color="white" icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>

  <h1>Committee Edit</h1>

  <base-card heading="" elevation="0">
    <v-row v-if="selectedCommittee">
      <v-col>
        <v-text-field v-model="selectedCommittee.name" label="Name"></v-text-field>
        <DepartmentSelector v-model="selectedCommittee.department_code" label="Department" hide-details>
        </DepartmentSelector>

        <div class="d-flex">
          <v-btn color="primary" @click="saveClick">Save</v-btn>
          <v-spacer />

          <v-btn color="error" @click="deleteClick">Delete</v-btn>
        </div>
      </v-col>
      <v-col>
        <div class="d-flex">
          <UserSelector v-model="addUser" :show-email="true" return-object />
          <v-btn class="my-1 ml-3" color="primary" icon="mdi-plus" size="small" @click="addUserClick"></v-btn>
        </div>

        <div v-if="selectedCommittee.users?.length == 0">No users in this committee.</div>
        <v-list v-else density="compact" class="border py-0">
          <div v-for="(user, idx) of selectedCommittee.users" :key="user.id">
            <v-list-item :title="`${user.display_name} - ${user.email}`" class="py-0">
              <template #append>
                <v-btn icon class="my-0" @click="removeUserClick(idx)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="idx < selectedCommittee.users.length - 1"></v-divider>
          </div>
        </v-list>
      </v-col>
    </v-row>

    <ConfirmDialog ref="confirm" />
  </base-card>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useCommitteeAdminStore } from "../store";
import DepartmentSelector from "@/components/DepartmentSelector.vue";
import UserSelector from "@/components/UserSelector.vue";
import { useNotificationStore } from "@/store/NotificationStore";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  components: { UserSelector, DepartmentSelector, ConfirmDialog },
  data: () => ({
    addUser: null,
  }),
  computed: {
    ...mapState(useCommitteeAdminStore, ["selectedCommittee"]),

    breadcrumbs() {
      return [
        {
          title: "Admin Dashboard",
          to: "/administration",
        },
        {
          title: "Committees",
          to: "/administration/committees",
        },
        {
          title: "Committee Edit",
        },
      ];
    },
  },
  async beforeMount() {
    const id = this.$route.params.id.toString();
    await this.loadCommittee(id);
  },
  methods: {
    ...mapActions(useCommitteeAdminStore, ["loadCommittee", "saveCommittee", "deleteCommittee"]),

    saveClick(event, thing) {
      this.saveCommittee().then(() => {
        this.$router.push("/administration/committees");
      });
    },

    addUserClick() {
      if (!this.selectedCommittee || !this.addUser) return;
      this.selectedCommittee.users = this.selectedCommittee.users || [];
      const userExists = this.selectedCommittee.users.find((user) => user.user_id === this.addUser.id);

      if (userExists) {
        const m = useNotificationStore();
        m.notify({
          variant: "error",
          text: "User already exists in this committee.",
        });
        return;
      }

      this.selectedCommittee.users.push({
        committee_id: this.selectedCommittee.id,
        user_id: this.addUser.id,
        display_name: this.addUser.display_name,
        email: this.addUser.email,
      });
    },
    removeUserClick(idx) {
      if (!this.selectedCommittee) return;

      this.selectedCommittee.users = this.selectedCommittee.users || [];
      this.selectedCommittee.users.splice(idx, 1);
    },
    deleteClick() {
      this.$refs.confirm.show(
        "Delete Committee?",
        "Are you sure you want to delete this committee?",
        async () => {
          await this.deleteCommittee(this.selectedCommittee.id);
          this.$router.push("/administration/committees");
        },
        () => { }
      );
    },
  },
};
</script>
