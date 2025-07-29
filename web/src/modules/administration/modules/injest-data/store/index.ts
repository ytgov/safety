import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { DATA_INJECTION_URL, DATA_INJECTION_SOURCE_URL } from "@/urls";

interface AdminState {
  dataInjectionSources: Array<DataInjectionSource>;
  selectedDataInjectionSourceId: number | undefined;
  selectedDataInjectionFile: File |undefined;
  isLoading: boolean;
}

export const useDataInjectionSourceAdminStore = defineStore("dataInjectionSourceAdmin", {
  state: (): AdminState => ({
    dataInjectionSources: [],
    isLoading: false,
    selectedDataInjectionSourceId: undefined,
    selectedDataInjectionFile: undefined
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
    selectDataInjectionFile(dataInjectionFile: File) {
      this.selectedDataInjectionFile = dataInjectionFile;
    },
    unselectDataInjectionFile() {
      this.selectedDataInjectionFile = undefined;
    },
     async addDataInjection(userId: number) {
      const api    = useApiStore();
      const notify = useNotificationStore();

      // Guards
      if (!this.selectedDataInjectionSourceId) {
        return notify.notify({ text: "Please select a data injection source first", variant: "error" });
      }
      if (!this.selectedDataInjectionFile) {
        return notify.notify({ text: "Please choose a CSV file to upload", variant: "error" });
      }

      this.isLoading = true;
      try {
        const form = new FormData();
        form.append("csvFile", this.selectedDataInjectionFile);
        form.append("source_id", this.selectedDataInjectionSourceId.toString());
        form.append("user_id", userId.toString());

        const resp = await api.secureCall("post", DATA_INJECTION_URL, form);

        if (resp.data?.error) {
          notify.notify({ text: Array.isArray(resp.data.error) ? resp.data.error.map((e: any) => e.text).join(", ") : String(resp.data.error), variant: "error" });
        } else {
          notify.notify({ text: "Data Injection File added successfully", variant: "success" });
          this.unselectDataInjectionSourceId();
          this.unselectDataInjectionFile();
        }

        return resp.data;
      } catch (err) {
        console.error("Data injection failed", err);
        notify.notify({ text: "Upload failed. Please try again.", variant: "error" });
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export interface DataInjectionSource {
  id: number;
  source_name: string;
  description?: string;
  identifier_column_name: string;
  created_at: Date;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataInjectionSourceAdminStore, import.meta.hot));
}
