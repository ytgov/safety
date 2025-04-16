import { acceptHMRUpdate, defineStore } from "pinia";
import { useApiStore } from "./ApiStore";
import { ATTACHMENT_URL, LOCATION_URL, INSPECTIONS_URL } from "@/urls";
import { isEmpty, isNil } from "lodash";
import { Incident } from "./ReportStore";

export const useInspectionStore = defineStore("inspections", {
  state: () => ({
    myReports: [] as Incident[],
    locations: [] as Location[],
    selectedReport: undefined as Incident | undefined,
    isLoading: false,
    reports: [] as Incident[],
    totalCount: 0,
    linkedUsers: [] as any[],
  }),
  actions: {
    async initialize() {
      console.log("Initializing Report Store");
      this.myReports = this.myReports || new Array<Incident>();

      // this.myReports = [{ title: "testing", createDate: new Date() }];
      await this.loadLocations();
      await this.loadMyReports();
      this.clear();
    },

    async loadLocations() {
      const api = useApiStore();
      return api.call("get", `${LOCATION_URL}`).then((resp) => {
        this.locations = resp.data;
        return resp.data;
      });
    },

    clear() {
      this.selectedReport = undefined;
    },

    async loadReports({
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

      let queryUrl = `${INSPECTIONS_URL}?page=${page}&perPage=${perPage}&`;

      if (!isEmpty(search)) queryUrl += `search=${search}&`;
      if (!isNil(status)) queryUrl += `status=${status}&`;
      if (!isNil(urgency)) queryUrl += `urgency=${urgency}&`;
      if (!isNil(location)) queryUrl += `location=${location}&`;

      return api.secureCall("get", queryUrl).then((resp) => {
        this.reports = resp.data;
        this.totalCount = resp.totalCount;
        this.isLoading = false;
        return resp.data;
      });
    },

    async loadMyReports() {
      const api = useApiStore();
      return api
        .secureCall("get", `${INSPECTIONS_URL}/my-reports`)
        .then((resp) => {
          this.myReports = resp.data;
          return resp.data;
        })
        .catch(() => {
          console.log("Error in loadMyReports");
        });
    },

    async addInspection(report: Incident) {
      this.myReports.push(report);
      const api = useApiStore();

      const formData = new FormData();
      formData.append("eventType", report.eventType);
      formData.append("date", (report as any).date.toString());
      formData.append("location_code", report.location_code);
      formData.append("department_code", report.department_code ?? "");
      formData.append("description", report.description);

      for (const file of report.files || []) {
        formData.append("files", file);
      }

      return api.secureUpload("post", `${INSPECTIONS_URL}`, formData);
    },

    async deleteIncident() {
      if (!this.selectedReport) return;

      const api = useApiStore();
      return api.secureCall("delete", `${INSPECTIONS_URL}/${this.selectedReport.id}`);
    },

    async updateReport() {
      if (!this.selectedReport) return;

      const body = {
        investigation_notes: this.selectedReport.investigation_notes,
        description: this.selectedReport.description,
        additional_description: this.selectedReport.additional_description,
        urgency_code: this.selectedReport.urgency_code,
        incident_type_id: this.selectedReport.incident_type_id,
      };

      const api = useApiStore();
      return api.secureCall("put", `${INSPECTIONS_URL}/${this.selectedReport.id}`, body);
    },

    async loadReport(slug: string) {
      const api = useApiStore();
      return api
        .secureCall("get", `${INSPECTIONS_URL}/${slug}`)
        .then((resp) => {
          this.selectedReport = resp.data;
        })
        .catch(() => {
          console.log("Error in loadReport");
        });
    },

    openAttachment(attachment: any) {
      if (!this.selectedReport) return;

      window.open(`${ATTACHMENT_URL}/incident/${this.selectedReport.id}/attachment/${attachment.id}`);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInspectionStore, import.meta.hot));
}
