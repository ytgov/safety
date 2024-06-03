import { defineStore } from "pinia";
import { useApiStore } from "./ApiStore";
import { REPORTS_URL } from "@/urls";

export const useReportStore = defineStore("reports", {
  state: () => ({
    myReports: [] as Report[],
  }),
  actions: {
    async initialize() {
      console.log("Initializing Report Store");
      this.myReports = this.myReports || new Array<Report>();

      // this.myReports = [{ title: "testing", createDate: new Date() }];

      await this.loadMyReports();
    },

    async loadMyReports() {
      const api = useApiStore();
      return api.secureCall("get", `${REPORTS_URL}/my-reports`).then((resp) => {
        this.myReports = resp.data;
        return resp.data;
      });
    },

    async addReport(report: Report) {
      this.myReports.push(report);
      const api = useApiStore();

      return api.secureCall("post", `${REPORTS_URL}`, report);
    },
  },
});

export interface Report {
  createDate: Date;
  date: Date;
  title: string;
  eventType: string;
  status: string;
}
