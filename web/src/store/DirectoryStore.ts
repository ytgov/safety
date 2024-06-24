import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { DIRECTORY_URL } from "@/urls";

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
  },
});
