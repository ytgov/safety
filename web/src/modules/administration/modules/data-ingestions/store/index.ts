import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { DATA_INGESTION_URL, DATA_INGESTION_SOURCE_URL } from "@/urls";
import { isNil } from "lodash";

interface AdminState {
  dataIngestionSources: Array<DataIngestionSource>;
  selectedDataIngestionSourceId: number | undefined;
  selectedDataIngestionFile: File | undefined;
  isLoading: boolean;
}
const notificationStore = useNotificationStore();

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
    async addDataIngestion(userId: number | null | undefined) {
      if (this.isLoading) return;

      if (isNil(userId)) {
        notificationStore.notify({
          text: "You must be logged in to do this.",
          variant: "warning",
          icon: "mdi-alert-circle",
          status_code: 401,
        });
        return;
      }

      if (isNil(this.selectedDataIngestionSourceId) || isNil(this.selectedDataIngestionFile)) {
        notificationStore.notify({
          text: "Please select a data source and upload a file.",
          variant: "warning",
          icon: "mdi-alert-circle",
          status_code: 422,
        });
        return;
      }

      const api = useApiStore();
      this.isLoading = true;

      try {
        const form = new FormData();
        form.append("csvFile", this.selectedDataIngestionFile);
        form.append("sourceId", this.selectedDataIngestionSourceId.toString());
        form.append("userId", userId.toString());

        const result = await api.secureUpload("post", DATA_INGESTION_URL, form);

        if (result.error) {
          notificationStore.notify({ text: String(result.error), variant: "error" });
        } else {
          notificationStore.notify({
            text: "Data Ingestion File added successfully",
            variant: "success",
          });
          this.unselectDataIngestionSourceId();
          this.unselectDataIngestionFile();
        }
        return result;
      } catch (err: any) {
        console.error("Data ingestion failed", err);
        notificationStore.notify({
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
