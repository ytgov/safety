import { acceptHMRUpdate, defineStore } from "pinia";

import { useNotificationStore } from "@/store/NotificationStore";
import { useApiStore } from "@/store/ApiStore";
import { LOCATION_URL } from "@/urls";

let m = useNotificationStore();

interface AdminState {
  locations: Array<Location>;
  selectedLocation: Location | undefined;
  isLoading: boolean;
}

export const useLocationAdminStore = defineStore("locationAdmin", {
  state: (): AdminState => ({
    locations: [],
    isLoading: false,
    selectedLocation: undefined,
  }),
  getters: {
    locationCount(state) {
      if (state && state.locations) return state.locations.length;
      return 0;
    },
  },
  actions: {
    async getAllLocations() {
      this.isLoading = true;
      let api = useApiStore();
      await api
        .secureCall("get", LOCATION_URL)
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
        .secureCall("put", `${LOCATION_URL}/${this.selectedLocation.code}`, this.selectedLocation)
        .then(async (resp) => {
          //this.locations = resp.data;

          this.unselectLocation();
        })
        .finally(() => {
          this.isLoading = false;
        });

      m.notify({ text: "Location saved", variant: "success" });
      this.getAllLocations();
    },
    async addLocation(location: any) {
      let api = useApiStore();

      return api.secureCall("post", LOCATION_URL, location).then(async (resp) => {
        if (resp && resp.data && resp.data.error) {
          m.notify({ text: resp.data.error[0].text, variant: "error" });
        }

        await this.getAllLocations();
        return resp.data;
      });
    },
  },
});

export interface Location {
  code: string;
  name: string;
  description: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLocationAdminStore, import.meta.hot));
}
