import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { PROFILE_URL } from "@/urls";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoading: true,
    user: {
      display_name: "",
      first_name: "",
      last_name: "",
      email: "",
      EMAIL: "",
      ynet_id: "",
      sub: "",
      STATUS: "",
      ROLE: "",
      IS_ADMIN: "",
    },
  }),
  getters: {
    isAdmin(state) {
      return true;
    },
  },
  actions: {
    async initialize() {
      if (!this.user.sub) {
        await this.loadCurrentUser();
        console.log("Initialized user store");
      }
    },

    async loadCurrentUser() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", PROFILE_URL)
        .then((resp) => {
          this.user = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
