import { acceptHMRUpdate, defineStore } from "pinia";
import { useApiStore } from "./ApiStore";
import { HAZARD_URL, LOCATION_URL } from "@/urls";
import { Location, Urgency } from "./ReportStore";
import { isEmpty, isNil } from "lodash";

export const useHazardStore = defineStore("hazards", {
  state: () => ({
    locations: [] as Location[],
    urgencies: [] as Urgency[],
    hazards: [] as Hazard[],
    totalCount: 0,
    selectedHazard: null as Hazard | null,
    isLoading: false,
  }),
  getters: {},
  actions: {
    async initialize() {
      console.log("Initializing Hazard Store");

      await this.loadLocations();
      await this.loadUrgency();
      //await this.loadHazards();
    },

    async loadLocations() {
      const api = useApiStore();
      return api.call("get", `${LOCATION_URL}`).then((resp) => {
        this.locations = resp.data;
        return resp.data;
      });
    },

    async loadUrgency() {
      this.urgencies = [
        { code: "Critical", name: "Critical" },
        { code: "High", name: "High" },
        { code: "Medium", name: "Medium" },
        { code: "Low", name: "Low" },
      ];
    },

    async loadHazards({
      page,
      perPage,
      search,
      status,
      urgency,
      location,
    }: {
      page: number | null;
      perPage: number | null;
      search: string | null;
      status: string | null;
      urgency: string | null;
      location: string | null;
    }) {
      this.isLoading = true;
      const api = useApiStore();

      let queryUrl = `${HAZARD_URL}?page=${page}&perPage=${perPage}&`;

      if (!isEmpty(search)) queryUrl += `search=${search}&`;
      if (!isNil(status)) queryUrl += `status=${status}&`;
      if (!isNil(urgency)) queryUrl += `urgency=${urgency}&`;
      if (!isNil(location)) queryUrl += `location=${location}&`;

      return api.secureCall("get", queryUrl).then((resp) => {
        this.hazards = resp.data;
        this.totalCount = resp.totalCount;
        this.isLoading = false;
        return resp.data;
      });
    },

    select(item: Hazard) {
      this.selectedHazard = item;
    },
  },
});

export interface Hazard {
  id: number;
  hazard_type_id: number;
  location_code?: string;
  department_code?: string;
  scope_code?: string;
  status_code?: string;
  sensitivity_code?: string;
  description?: string;
  location_detail?: string;
  created_at?: string;
  reported_at?: string;
  reopen_count: number;
  urgency_code: string;
  notes?: string;
  incident_type_description: string;
  status_name: string;

  files?: any[];
  steps?: any[];
  actions?: any[];
  hazards?: any[];
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHazardStore, import.meta.hot));
}
