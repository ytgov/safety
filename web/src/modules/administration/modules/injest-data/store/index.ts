import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { DATA_INJECTION_SOURCE_URL } from "@/urls";

let m = useNotificationStore();

interface AdminState {
  dataInjectionSources: Array<DataInjectionSource>;
  selectedDataInjectionSourceId: number | undefined;
  isLoading: boolean;
}

export const useDataInjectionSourceAdminStore = defineStore("dataInjectionSourceAdmin", {
  state: (): AdminState => ({
    dataInjectionSources: [],
    isLoading: false,
    selectedDataInjectionSourceId: undefined,
  }),
  getters: {
    dataInjectionSourceCount(state) {
      if (state && state.dataInjectionSources) return state.dataInjectionSources.length;
      return 0;
    },
  },
  actions: {
    async getAllDataInjectionSources() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", DATA_INJECTION_SOURCE_URL)
        .then((resp) => {
          this.dataInjectionSources = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectDataInjectionSourceId(dataInjectionSourceId: number) {
      this.selectedDataInjectionSourceId = dataInjectionSourceId;
    },
    unselectDataInjectionSourceId() {
      this.selectedDataInjectionSourceId = undefined;
    },
  },
});

export interface DataInjectionSource {
  id: number;
  source_name: string;
  description?: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataInjectionSourceAdminStore, import.meta.hot));
}
