import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { DATA_INJESTION_URL, DATA_INJESTION_SOURCE_URL } from "@/urls";

interface AdminState {
  dataInjestionSources: Array<DataInjestionSource>;
  selectedDataInjestionSourceId: number | undefined;
  selectedDataInjestionFile: File | undefined;
  isLoading: boolean;
}

export const useDataInjestionSourceAdminStore = defineStore("dataInjestionSourceAdmin", {
  state: (): AdminState => ({
    dataInjestionSources: [],
    isLoading: false,
    selectedDataInjestionSourceId: undefined,
    selectedDataInjestionFile: undefined,
  }),
  getters: {
    dataInjestionSourceCount(state) {
      if (state && state.dataInjestionSources) return state.dataInjestionSources.length;
      return 0;
    },
  },
  actions: {
    async getAllDataInjestionSources() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", DATA_INJESTION_SOURCE_URL)
        .then((resp) => {
          this.dataInjestionSources = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectDataInjestionSourceId(dataInjestionSourceId: number) {
      this.selectedDataInjestionSourceId = dataInjestionSourceId;
    },
    unselectDataInjestionSourceId() {
      this.selectedDataInjestionSourceId = undefined;
    },
    selectDataInjestionFile(dataInjestionFile: File) {
      this.selectedDataInjestionFile = dataInjestionFile;
    },
    unselectDataInjestionFile() {
      this.selectedDataInjestionFile = undefined;
    },
    async addDataInjestion(userId: number) {
      const api = useApiStore();
      const notify = useNotificationStore();

      // Guards
      if (!this.selectedDataInjestionSourceId) {
        return notify.notify({
          text: "Please select a data injestion source first",
          variant: "error",
        });
      }
      if (!this.selectedDataInjestionFile) {
        return notify.notify({ text: "Please choose a CSV file to upload", variant: "error" });
      }

      this.isLoading = true;
      try {
        const form = new FormData();
        form.append("csvFile", this.selectedDataInjestionFile);
        form.append("source_id", this.selectedDataInjestionSourceId.toString());
        form.append("user_id", userId.toString());

        const result = await api.secureUpload("post", DATA_INJESTION_URL, form);

        if (result.error) {
          notify.notify({ text: String(result.error), variant: "error" });
        } else {
          notify.notify({ text: "Data Injestion File added successfully", variant: "success" });
          this.unselectDataInjestionSourceId();
          this.unselectDataInjestionFile();
        }

        return result;
      } catch (err: any) {
        console.error("Data injestion failed", err);
        notify.notify({
          text: err.message || "Upload failed. Please try again.",
          variant: "error",
        });
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export interface DataInjestionSource {
  id: number;
  source_name: string;
  description?: string;
  identifier_column_name: string;
  column_count: number;
  source_attribute_to_transform?: string;
  target_attribute_to_transform?: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataInjestionSourceAdminStore, import.meta.hot));
}
