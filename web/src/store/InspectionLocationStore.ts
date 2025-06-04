import { defineStore } from "pinia";

import { useApiStore } from "@/store/ApiStore";
import { INSPECTION_LOCATION_URL } from "@/urls";

export const useInspectionLocationStore = defineStore("inspectionLocation", {
  state: () => ({
    isLoading: false,
    inspectionlocations: [] as InspectionLocation[],
  }),
  actions: {
    async initialize() {
      await this.loadInspectionLocations();
    },

    async loadInspectionLocations() {
      this.isLoading = true;
      let api = useApiStore();
      return api
        .secureCall("get", INSPECTION_LOCATION_URL)
        .then((resp) => {
          this.inspectionlocations = resp.data;

          for (const location of this.inspectionlocations) {
            location.title = location.name;
            if (!location.description) location.title = `${location.name} (${location.description})`;
          }

          return resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});

export interface InspectionLocation {
  id: number;
  name: string;
  description?: string;
  department_code: string;
  building_id?: number;

  title?: string;
}
