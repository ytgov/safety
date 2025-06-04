import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { INSPECTION_LOCATION_URL } from "@/urls";

let m = useNotificationStore();

interface AdminState {
  locations: Array<InspectionLocation>;
  selectedLocation: InspectionLocation | undefined;
  isLoading: boolean;
}

export const useInspectionLocationAdminStore = defineStore("inspectionLocationAdmin", {
  state: (): AdminState => ({
    locations: [],
    isLoading: false,
    selectedLocation: undefined,
  }),
  getters: {
    inspectionLocationCount(state) {
      if (state && state.locations) return state.locations.length;
      return 0;
    },
  },
  actions: {
    async getAllInspectionLocations() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", INSPECTION_LOCATION_URL)
        .then((resp) => {
          this.locations = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectLocation(location: any) {
      this.selectedLocation = location;
    },
    unselectLocation() {
      this.selectedLocation = undefined;
    },
    async saveLocation() {
      this.isLoading = true;
      let api = useApiStore();

      if (!this.selectedLocation) return;

      await api
        .secureCall("put", `${INSPECTION_LOCATION_URL}/${this.selectedLocation.id}`, this.selectedLocation)
        .then(async (resp) => {
          //this.locations = resp.data;

          this.unselectLocation();
        })
        .finally(() => {
          this.isLoading = false;
        });

      m.notify({ text: "Location saved", variant: "success" });
      this.getAllInspectionLocations();
    },
    async addLocation(location: any) {
      let api = useApiStore();

      return api.secureCall("post", INSPECTION_LOCATION_URL, location).then(async (resp) => {
        if (resp && resp.data && resp.data.error) {
          m.notify({ text: resp.data.error[0].text, variant: "error" });
        }

        await this.getAllInspectionLocations();
        return resp.data;
      });
    },
  },
});

export interface InspectionLocation {
  id: number;
  name: string;
  description: string;
  department_code: string;
  building_id?: number;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInspectionLocationAdminStore, import.meta.hot));
}
