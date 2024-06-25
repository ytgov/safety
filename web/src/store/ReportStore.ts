import { acceptHMRUpdate, defineStore } from "pinia";
import { useApiStore } from "./ApiStore";
import { LOCATION_URL, REPORTS_URL } from "@/urls";

export const useReportStore = defineStore("reports", {
  state: () => ({
    myReports: [] as Incident[],
    mySupervisorReports: [] as Incident[],
    locations: [] as Location[],
    urgencies: [] as Urgency[],
    selectedReport: undefined as Incident | undefined,
  }),
  actions: {
    async initialize() {
      console.log("Initializing Report Store");
      this.myReports = this.myReports || new Array<Incident>();

      // this.myReports = [{ title: "testing", createDate: new Date() }];
      await this.loadLocations();
      await this.loadUrgency();
      await this.loadMyReports();
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
        { code: "High", name: "High" },
        { code: "Medium", name: "Medium" },
        { code: "Low", name: "Low" },
      ];
    },

    async loadMyReports() {
      const api = useApiStore();
      return api
        .secureCall("get", `${REPORTS_URL}/my-reports`)
        .then((resp) => {
          this.myReports = resp.data;
          return resp.data;
        })
        .catch(() => {
          console.log("Error in loadMyReports");
        });
    },

    async loadMySupervisorReports() {
      const api = useApiStore();
      return api
        .secureCall("get", `${REPORTS_URL}/my-supervisor-reports`)
        .then((resp) => {
          this.mySupervisorReports = resp.data;
          return resp.data;
        })
        .catch(() => {
          console.log("Error in loadMyReports");
        });
    },

    async addReport(report: Incident) {
      this.myReports.push(report);
      const api = useApiStore();

      const formData = new FormData();
      formData.append("eventType", report.eventType);
      formData.append("date", (report as any).date.toString());
      formData.append("urgency", report.urgency);
      formData.append("location_code", report.location_code);
      formData.append("specificLocation", report.specificLocation);
      formData.append("description", report.description);
      formData.append("supervisor_email", report.supervisor_email);
      formData.append("on_behalf", report.on_behalf);
      formData.append("on_behalf_email", report.on_behalf_email);

      for (const file of report.files || []) {
        formData.append("files", file);
      }

      return api.secureUpload("post", `${REPORTS_URL}`, formData);
    },

    async loadReport(reportId: number) {
      console.log("LOADING REPORT", reportId);

      const api = useApiStore();
      return api
        .secureCall("get", `${REPORTS_URL}/${reportId}`)
        .then((resp) => {
          this.selectedReport = resp.data;
        })
        .catch(() => {
          console.log("Error in loadReport");
        });
    },
  },
});

export interface Report {
  createDate?: Date;
  date: Date;
  title?: string;
  eventType: string;
  status: string;
  urgency: string;
  location_code: string;
  specificLocation: string;
  description: string;
  supervisor_email: string;
  on_behalf: string;
  on_behalf_email: string;

  files?: any[];
}

export interface Incident {
  id: number;
  created_at: Date;
  title?: string;
  eventType: string;
  status: string;
  urgency: string;
  location_code: string;
  specificLocation: string;
  description: string;
  supervisor_email: string;
  on_behalf: string;
  on_behalf_email: string;

  incident_type_description: string;
  status_name: string;

  files?: any[];
}

export interface Location {
  code: string;
  name: string;
  description?: string;
}

export interface Urgency {
  code: string;
  name: string;
  description?: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportStore, import.meta.hot));
}
