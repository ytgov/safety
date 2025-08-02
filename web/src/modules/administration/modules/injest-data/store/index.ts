import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { DATA_INGESTION_URL, DATA_INGESTION_SOURCE_URL } from "@/urls";

interface AdminState {
  dataIngestionSources: Array<DataIngestionSource>;
  selectedDataIngestionSourceId: number | undefined;
  selectedDataIngestionFile: File | undefined;
  isLoading: boolean;
}

export const useDataIngestionSourceAdminStore = defineStore("dataIngestionSourceAdmin", {
  state: (): AdminState => ({
    dataIngestionSources: [],
    isLoading: false,
    selectedDataIngestionSourceId: undefined,
    selectedDataIngestionFile: undefined,
  }),
  getters: {
    dataIngestionSourceCount(state) {
      if (state && state.dataIngestionSources) return state.dataIngestionSources.length;
      return 0;
    },
  },
  actions: {
    async getAllDataIngestionSources() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", DATA_INGESTION_SOURCE_URL)
        .then((resp) => {
          this.dataIngestionSources = resp.dataIngestionSources;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectDataIngestionSourceId(dataIngestionSourceId: number) {
      this.selectedDataIngestionSourceId = dataIngestionSourceId;
    },
    unselectDataIngestionSourceId() {
      this.selectedDataIngestionSourceId = undefined;
    },
    selectDataIngestionFile(dataIngestionFile: File) {
      this.selectedDataIngestionFile = dataIngestionFile;
    },
    unselectDataIngestionFile() {
      this.selectedDataIngestionFile = undefined;
    },
    async addDataIngestion(userId: number) {
      const api = useApiStore();
      const notify = useNotificationStore();

      // Guards
      if (!this.selectedDataIngestionSourceId) {
        return notify.notify({
          text: "Please select a data ingestion source first",
          variant: "error",
        });
      }
      if (!this.selectedDataIngestionFile) {
        return notify.notify({ text: "Please choose a CSV file to upload", variant: "error" });
      }

      this.isLoading = true;
      try {
        const form = new FormData();
        form.append("csvFile", this.selectedDataIngestionFile);
        form.append("source_id", this.selectedDataIngestionSourceId.toString());
        form.append("user_id", userId.toString());

        const result = await api.secureUpload("post", DATA_INGESTION_URL, form);

        if (result.error) {
          notify.notify({ text: String(result.error), variant: "error" });
        } else {
          notify.notify({ text: "Data Ingestion File added successfully", variant: "success" });
          this.unselectDataIngestionSourceId();
          this.unselectDataIngestionFile();
        }

        return result;
      } catch (err: any) {
        console.error("Data ingestion failed", err);
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

export interface DataIngestionSource {
  id: number;
  source_name: string;
  description?: string;
  identifier_column_name: string;
  column_count: number;
  source_attribute_to_transform?: string;
  target_attribute_to_transform?: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataIngestionSourceAdminStore, import.meta.hot));
}
