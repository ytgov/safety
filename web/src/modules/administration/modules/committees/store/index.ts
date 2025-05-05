import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { COMMITTEE_URL } from "@/urls";
import { User } from "@/modules/administration/modules/users/store";

let m = useNotificationStore();

interface AdminState {
  committees: Array<Committee>;
  selectedCommittee: Committee | undefined;
  isLoading: boolean;
}

export const useCommitteeAdminStore = defineStore("committeeAdmin", {
  state: (): AdminState => ({
    committees: [],
    isLoading: false,
    selectedCommittee: undefined,
  }),
  getters: {
    committeeCount(state) {
      if (state && state.committees) return state.committees.length;
      return 0;
    },
  },
  actions: {
    async getAllCommittees() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", COMMITTEE_URL)
        .then((resp) => {
          this.committees = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async loadCommittee(id: string) {
      this.isLoading = true;
      let api = useApiStore();
      return api
        .secureCall("get", `${COMMITTEE_URL}/${id}`)
        .then((resp) => {
          this.selectedCommittee = resp.data;
          return resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectCommittee(committee: any) {
      this.selectedCommittee = committee;
    },
    unselectCommittee() {
      this.selectedCommittee = undefined;
    },
    async saveCommittee() {
      this.isLoading = true;
      let api = useApiStore();

      if (!this.selectedCommittee) return;

      await api
        .secureCall("put", `${COMMITTEE_URL}/${this.selectedCommittee.id}`, this.selectedCommittee)
        .then(async (resp) => {
          //this.committees = resp.data;

          this.unselectCommittee();
        })
        .finally(() => {
          this.isLoading = false;
        });

      m.notify({ text: "Committee saved", variant: "success" });
      this.getAllCommittees();
    },
    async addCommittee(committee: any) {
      let api = useApiStore();

      return api.secureCall("post", COMMITTEE_URL, committee).then(async (resp) => {
        if (resp && resp.data && resp.data.error) {
          m.notify({ text: resp.data.error[0].text, variant: "error" });
        }

        await this.getAllCommittees();
        return resp.data;
      });
    },
    async deleteCommittee() {
      if (!this.selectedCommittee) return;
      let api = useApiStore();

      return api.secureCall("delete", `${COMMITTEE_URL}/${this.selectedCommittee.id}`).then(async (resp) => {
        if (resp && resp.data && resp.data.error) {
          m.notify({ text: resp.data.error[0].text, variant: "error" });
        }
        return resp.data;
      });
    },
  },
});

export interface Committee {
  id: string;
  name: string;
  department_code: string;

  users?: Array<CommitteeUser>;
}

export interface CommitteeUser {
  id?: string;
  committee_id: string;
  user_id: string;

  display_name?: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCommitteeAdminStore, import.meta.hot));
}
