import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "axios";
import auth0 from "@/plugins/auth";

import { useApiStore } from "@/store/ApiStore";
import { COMMITTEE_MEETING_URL } from "@/urls";

export type Representing = "Employee" | "Employer";

export interface CommitteeMeetingCochair {
  id?: number;
  committee_meeting_id?: number;
  committee_id?: number;
  user_id?: number | null;
  email?: string | null;
  display_name?: string | null;
  representing?: Representing | null;
}

export type CommitteeMeetingMember = CommitteeMeetingCochair;

export interface CommitteeMeetingFile {
  id: number;
  committee_meeting_id: number;
  added_date?: string;
  added_by_email?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
}

export interface CommitteeMeetingDiscussionItem {
  concern?: string | null;
  action?: string | null;
  target_date?: string | null;
  flag_next?: boolean;
}

// An inspection already logged against the committee's department. Read-only in the
// minutes -- the committee reviews the list rather than editing it.
export interface CommitteeMeetingInspection {
  id?: number;
  slug?: string | null;
  description?: string | null;
  inspection_date?: string | null;
  location_code?: string | null;
  location_name?: string | null;
  status_name?: string | null;
  reporting_person_email?: string | null;
  inspection_location_name?: string | null;
  inspection_location_branch?: string | null;
}

export type InspectionRangeDays = 30 | 60 | 90;

export type YesNo = "Yes" | "No";

export interface CommitteeMeeting {
  id?: number;
  committee_id: number;
  committee_name?: string;
  meeting_date: string;
  minutes?: string | null;
  quorum?: YesNo | null;
  meet_anyway?: YesNo | null;
  no_loss_incidents_reviewed?: number | null;
  loss_incidents_reviewed?: number | null;
  new_hazards_reviewed?: number | null;
  worker_vacancies?: YesNo | null;
  worker_vacancy_count?: number | null;
  minutes_data?: Record<string, any> | null;
  status?: "Draft" | "Complete";
  completed_at?: string | null;
  completed_by_user_id?: number | null;
  created_at?: string;
  cochairs?: CommitteeMeetingCochair[];
  members?: CommitteeMeetingMember[];
  files?: CommitteeMeetingFile[];
}

export const useCommitteeMeetingStore = defineStore("committeeMeeting", {
  state: () => ({
    isLoading: false,
    meetings: [] as CommitteeMeeting[],
    selected: undefined as CommitteeMeeting | undefined,
  }),
  actions: {
    async loadAll() {
      this.isLoading = true;
      const api = useApiStore();
      return api
        .secureCall("get", COMMITTEE_MEETING_URL)
        .then((resp) => {
          this.meetings = resp.data;
          return resp.data;
        })
        .finally(() => (this.isLoading = false));
    },

    async load(id: number | string) {
      this.isLoading = true;
      const api = useApiStore();
      return api
        .secureCall("get", `${COMMITTEE_MEETING_URL}/${id}`)
        .then((resp) => {
          this.selected = resp.data;
          return resp.data;
        })
        .finally(() => (this.isLoading = false));
    },

    async loadPreviousAttendees(
      committeeId: number,
      before?: string | null
    ): Promise<{ cochairs: CommitteeMeetingCochair[]; members: CommitteeMeetingMember[] }> {
      const api = useApiStore();
      const query = before ? `?before=${encodeURIComponent(before)}` : "";
      return api
        .secureCall("get", `${COMMITTEE_MEETING_URL}/previous-attendees/${committeeId}${query}`)
        .then((resp) => resp.data);
    },

    // Items the committee flagged for discussion at its previous meeting, shaped as
    // outstanding discussion items.
    async loadCarryForwardItems(
      committeeId: number,
      before?: string | null
    ): Promise<CommitteeMeetingDiscussionItem[]> {
      const api = useApiStore();
      const query = before ? `?before=${encodeURIComponent(before)}` : "";
      return api
        .secureCall("get", `${COMMITTEE_MEETING_URL}/carry-forward/${committeeId}${query}`)
        .then((resp) => resp.data ?? []);
    },

    // Inspections logged against the committee's department within the trailing window.
    // `asOf` anchors that window on the meeting date instead of today.
    async loadInspections(
      committeeId: number,
      {
        days = 30,
        inspectionLocationId = null,
        asOf = null,
      }: { days?: number; inspectionLocationId?: number | null; asOf?: string | null } = {}
    ): Promise<CommitteeMeetingInspection[]> {
      const api = useApiStore();
      const params = new URLSearchParams({ days: `${days}` });
      if (inspectionLocationId) params.set("inspection_location_id", `${inspectionLocationId}`);
      if (asOf) params.set("as_of", asOf);
      return api
        .secureCall("get", `${COMMITTEE_MEETING_URL}/inspections/${committeeId}?${params.toString()}`)
        .then((resp) => resp.data ?? []);
    },

    async create(meeting: Partial<CommitteeMeeting>) {
      const api = useApiStore();
      return api.secureCall("post", COMMITTEE_MEETING_URL, meeting).then((resp) => resp.data);
    },

    async save(id: number, changes: Partial<CommitteeMeeting>) {
      const api = useApiStore();
      return api.secureCall("put", `${COMMITTEE_MEETING_URL}/${id}`, changes).then((resp) => resp.data);
    },

    async downloadFile(id: number, fileId: number, fileName: string) {
      const token = await auth0.getAccessTokenSilently();
      const resp = await axios.get(`${COMMITTEE_MEETING_URL}/${id}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },

    async downloadMinutesPdf(id: number, fileName = "meeting-minutes.pdf") {
      const token = await auth0.getAccessTokenSilently();
      const resp = await axios.get(`${COMMITTEE_MEETING_URL}/${id}/minutes.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },

    async uploadFiles(id: number, files: File[]) {
      const api = useApiStore();
      const formData = new FormData();
      for (const file of files) formData.append("file", file);
      return api.secureUpload("post", `${COMMITTEE_MEETING_URL}/${id}/files`, formData);
    },

    async deleteFile(id: number, fileId: number) {
      const api = useApiStore();
      return api.secureCall("delete", `${COMMITTEE_MEETING_URL}/${id}/files/${fileId}`);
    },

    async setStatus(id: number, status: "Draft" | "Complete") {
      const api = useApiStore();
      return api.secureCall("post", `${COMMITTEE_MEETING_URL}/${id}/status`, { status }).then((resp) => resp.data);
    },

    async remove(id: number) {
      const api = useApiStore();
      return api.secureCall("delete", `${COMMITTEE_MEETING_URL}/${id}`);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCommitteeMeetingStore, import.meta.hot));
}
