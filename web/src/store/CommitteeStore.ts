import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { COMMITTEE_URL } from "@/urls";

export const useCommitteeStore = defineStore("committee", {
  state: () => ({
    isLoading: false,
    committees: [] as Committee[],
    committee: {} as Committee,
  }),
  actions: {
    async initialize() {
      await this.loadCommittees();
    },

    async loadCommittees() {
      this.isLoading = true;
      let api = useApiStore();
      return api
        .secureCall("get", COMMITTEE_URL)
        .then((resp) => {
          this.committees = resp.data;
          return resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});

export interface Committee {
  code: string;
  name: string;
  description?: string;
}
