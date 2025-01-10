import { defineStore, storeToRefs } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { DIRECTORY_URL } from "@/urls";
import { useRoleStore } from "./RoleStore";

export const useDirectoryStore = defineStore("directory", {
  state: () => ({
    isLoading: true,
  }),
  actions: {
    async searchDirectory({ terms }: { terms: string }) {
      const api = useApiStore();

      this.isLoading = true;
      return api.call("post", `${DIRECTORY_URL}/search-directory`, { terms }).then((resp) => {
        return resp.data;
      });
    },

    async searchActionDirectory({ terms, showRoles = true }: { terms: string; showRoles: boolean }) {
      const roleStore = useRoleStore();
      const { roles } = storeToRefs(roleStore);
      const { initialize } = roleStore;

      if (roles.value.length < 1) await initialize();

      const roleItems = new Array<any>();

      for (const role of roles.value) {
        if (role.name == "System Admin") continue;
        if (role.name == "Monitor") continue;

        roleItems.push({ long_name: role.description, actor_role_type_id: role.id });
      }

      if (!terms || terms.length < 2) {
        return roleItems;
      }

      const api = useApiStore();

      this.isLoading = true;
      return api.call("post", `${DIRECTORY_URL}/search-action-directory`, { terms }).then((resp) => {
        if (showRoles) return [...roleItems, ...resp.data];
        return resp.data;
      });
    },

    async searchActionDirectoryEmail({ terms, showRoles = true }: { terms: string; showRoles: boolean }) {
      const roleStore = useRoleStore();
      const { roles } = storeToRefs(roleStore);
      const { initialize } = roleStore;

      if (roles.value.length < 1) await initialize();

      const roleItems = new Array<any>();

      for (const role of roles.value) {
        if (role.name == "System Admin") continue;
        if (role.name == "Monitor") continue;

        roleItems.push({ long_name: role.description, actor_role_type_id: role.id });
      }

      if (!terms || terms.length < 2) {
        return roleItems;
      }

      const api = useApiStore();

      this.isLoading = true;
      return api.call("post", `${DIRECTORY_URL}/search-action-directory-email`, { terms }).then((resp) => {
        if (showRoles) return [...roleItems, ...resp.data];
        return resp.data;
      });
    },
  },
});
