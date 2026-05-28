import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "axios";
import auth0 from "@/plugins/auth";

import { useApiStore } from "@/store/ApiStore";
import { COMMITTEE_MEETING_URL } from "@/urls";

export interface CommitteeMeetingCochair {
  id?: number;
  committee_meeting_id?: number;
  committee_id?: number;
  user_id?: number | null;
  email?: string | null;
  display_name?: string | null;
}

export interface CommitteeMeeting {
  id?: number;
  committee_id: number;
  committee_name?: string;
  meeting_date: string;
  minutes?: string | null;
  minutes_file_name?: string | null;
  minutes_file_type?: string | null;
  minutes_file_size?: number | null;
  has_minutes_file?: boolean;
  status?: "Draft" | "Complete";
  completed_at?: string | null;
  completed_by_user_id?: number | null;
  created_at?: string;
  cochairs?: CommitteeMeetingCochair[];
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

    async loadPreviousCochairs(committeeId: number): Promise<CommitteeMeetingCochair[]> {
      const api = useApiStore();
      return api
        .secureCall("get", `${COMMITTEE_MEETING_URL}/previous-cochairs/${committeeId}`)
        .then((resp) => resp.data);
    },

    async create(meeting: Partial<CommitteeMeeting>) {
      const api = useApiStore();
      return api.secureCall("post", COMMITTEE_MEETING_URL, meeting).then((resp) => resp.data);
    },

    async save(id: number, changes: Partial<CommitteeMeeting>) {
      const api = useApiStore();
      return api.secureCall("put", `${COMMITTEE_MEETING_URL}/${id}`, changes).then((resp) => resp.data);
    },

    async downloadMinutesFile(id: number, fileName: string) {
      const token = await auth0.getAccessTokenSilently();
      const resp = await axios.get(`${COMMITTEE_MEETING_URL}/${id}/minutes-file`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "minutes");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },

    async uploadMinutesFile(id: number, file: File) {
      const api = useApiStore();
      const formData = new FormData();
      formData.append("file", file);
      return api.secureUpload("post", `${COMMITTEE_MEETING_URL}/${id}/minutes-file`, formData);
    },

    async deleteMinutesFile(id: number) {
      const api = useApiStore();
      return api.secureCall("delete", `${COMMITTEE_MEETING_URL}/${id}/minutes-file`);
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
