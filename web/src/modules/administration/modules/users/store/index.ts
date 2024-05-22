import { defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { USERS_URL } from "@/urls";

let m = useNotificationStore();

interface AdminState {
  users: Array<AppUser>;
  selectedUser: AppUser | undefined;
  isLoading: boolean;
}

export const useUserAdminStore = defineStore("userAdmin", {
  state: (): AdminState => ({
    users: [],
    isLoading: false,
    selectedUser: undefined,
  }),
  getters: {
    userCount(state) {
      if (state && state.users) return state.users.length;
      return 0;
    },
    moderators(state) {
      if (state.users.length > 0) {
        return state.users.filter((u) => u.ROLE == "Moderator" || u.IS_ADMIN);
      }
      return new Array<AppUser>();
    },
  },
  actions: {
    async getAllUsers() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", USERS_URL)
        .then((resp) => {
          this.users = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectUser(user: any) {
      this.selectedUser = user;
    },
    unselectUser() {
      this.selectedUser = undefined;
    },
    async saveUser() {
      this.isLoading = true;
      let api = useApiStore();

      if (this.selectedUser) {
        await api
          .secureCall("put", `${USERS_URL}/${this.selectedUser.EMAIL}`, this.selectedUser)
          .then((resp) => {
            this.users = resp.data;
            this.unselectUser();
          })
          .finally(() => {
            this.isLoading = false;
          });

        m.notify({ text: "User saved", variant: "success" });
        this.getAllUsers();
      }
    },
    async addUser(user: any) {
      let api = useApiStore();

      return api.secureCall("post", USERS_URL, { user }).then(async (resp) => {
        await this.getAllUsers();
        return resp.data;
      });
    },
    async searchDirectory(terms: any) {
      let api = useApiStore();

      return api.secureCall("post", `${USERS_URL}/search-directory`, terms).then((resp) => {
        return resp.data;
      });
    },
  },
});

export interface AppUser {
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  display_name: string;
  IS_ADMIN: boolean;
  STATUS: string;
  ROLE: string;

  surveys?: number[];
}
