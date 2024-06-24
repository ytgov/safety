import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { DEPARTMENT_URL } from "@/urls";

export const useDepartmentStore = defineStore("department", {
  state: () => ({
    isLoading: false,
    departments: [],
  }),
  actions: {
    async initialize() {
      await this.loadDepartments();
    },

    async loadDepartments() {
      this.isLoading = true;
      let api = useApiStore();
      return api
        .secureCall("get", DEPARTMENT_URL)
        .then((resp) => {
          this.departments = resp.data;
          return resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
