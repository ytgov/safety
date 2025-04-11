import { acceptHMRUpdate, defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { PROFILE_URL, USERS_URL } from "@/urls";
import { User } from "@/modules/administration/modules/users/store";
import { sortBy } from "lodash";

const SYSTEM_ADMIN_ROLE_NAME = "System Admin";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoading: true,
    user: null as User | null,
  }),
  getters: {
    isSystemAdmin(state) {
      if (!state.user) return false;
      if (state.user.roles) {
        const admin = state.user.roles.find((r) => r.name == SYSTEM_ADMIN_ROLE_NAME);
        if (admin) return true;
      }
      return false;
    },
    managedDepartments(state) {
      if (!state.user) return [];
      const deptCodes = sortBy(state.user.roles.map((r) => r.department_code).filter((d) => d));

      return deptCodes;
    },
  },
  actions: {
    async initialize() {
      if (this.user && this.user.auth_subject) return;

      await this.loadCurrentUser();
      console.log("Initialized user store");
    },

    async loadCurrentUser() {
      this.isLoading = true;
      let api = useApiStore();

      await api
        .secureCall("get", PROFILE_URL)
        .then((resp) => {
          this.user = resp.data;
        })
        .catch((resp) => {
          console.log("ERROR LOADING CURRENT USER", resp);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    async getHelpers(incidentId: number) {
      this.isLoading = true;
      let api = useApiStore();

      return await api
        .secureCall("get", `${USERS_URL}/helpers/${incidentId}`)
        .then((resp) => {
          return resp.data;
        })
        .catch((resp) => {
          console.log("ERROR LOADING CURRENT USER", resp);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    hasRole(roleName: string): boolean {
      if (!this.user) return false;
      if (this.user.roles) {
        const role = this.user.roles.find((r) => r.name == roleName);
        if (role) return true;
      }
      return false;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
