import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { ROLE_URL } from "@/urls";

export const useRoleStore = defineStore("role", {
  state: () => ({
    isLoading: false,
    roles: [] as any[],
  }),
  actions: {
    async initialize() {
      await this.loadRoles();
    },

    async loadRoles() {
      this.isLoading = true;
      let api = useApiStore();
      return api
        .secureCall("get", ROLE_URL)
        .then((resp) => {
          this.roles = resp.data;
          return resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
