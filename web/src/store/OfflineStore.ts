import { ref, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { useApiStore } from "./ApiStore";
import { useNotificationStore } from "./NotificationStore";
import { OFFLINEREPORTS_URL } from "@/urls";

const STORAGE_KEY = "offline-pending-reports";

export interface PendingReport {
  id: string;
  savedAt: string;
  eventType: string;
  date: string;
  urgency: string;
  location_code: string;
  location_detail?: string;
  description: string;
  supervisor_email: string;
  supervisor_alt_email?: string;
  on_behalf: string;
  on_behalf_email: string;
  additional_people?: string[];
}

function loadFromStorage(): PendingReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(reports: PendingReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export const useOfflineStore = defineStore("offline", () => {
  const pendingReports = ref<PendingReport[]>(loadFromStorage());
  const isUploading = ref(false);

  const pendingCount = computed(() => pendingReports.value.length);

  function addPendingReport(report: any): PendingReport {
    const pending: PendingReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
      eventType: report.eventType,
      date: report.date?.toString() ?? new Date().toString(),
      urgency: report.urgency,
      location_code: report.location_code,
      location_detail: report.location_detail,
      description: report.description,
      supervisor_email: report.supervisor_email,
      supervisor_alt_email: report.supervisor_alt_email,
      on_behalf: report.on_behalf ?? "No",
      on_behalf_email: report.on_behalf_email ?? "",
      additional_people: report.additional_people,
    };

    pendingReports.value.push(pending);
    saveToStorage(pendingReports.value);
    return pending;
  }

  function removePendingReport(id: string) {
    pendingReports.value = pendingReports.value.filter((r) => r.id !== id);
    saveToStorage(pendingReports.value);
  }

  function buildFormData(report: PendingReport): FormData {
    const formData = new FormData();
    formData.append("eventType", report.eventType);
    formData.append("date", report.date);
    formData.append("urgency", report.urgency);
    formData.append("location_code", report.location_code);
    formData.append("location_detail", report.location_detail ?? "");
    formData.append("description", report.description);
    formData.append("supervisor_email", report.supervisor_email);
    formData.append("additional_people", (report.additional_people ?? []).join(","));
    if (report.supervisor_alt_email) formData.append("supervisor_alt_email", report.supervisor_alt_email);
    formData.append("on_behalf", report.on_behalf);
    formData.append("on_behalf_email", report.on_behalf_email);
    return formData;
  }

  async function uploadSingleReport(id: string): Promise<boolean> {
    const report = pendingReports.value.find((r) => r.id === id);
    if (!report) return false;

    const api = useApiStore();
    const formData = buildFormData(report);
    const result = await api.offlineUpload("post", OFFLINEREPORTS_URL, formData);

    if (result?.queued || result?.error) {
      return false;
    }

    removePendingReport(id);
    return true;
  }

  async function uploadPendingReports(): Promise<{ uploaded: number; failed: number }> {
    if (isUploading.value) return { uploaded: 0, failed: 0 };
    isUploading.value = true;

    const notifications = useNotificationStore();
    let uploaded = 0;
    let failed = 0;

    // Work through a snapshot of IDs so removals don't shift the list mid-loop
    const ids = pendingReports.value.map((r) => r.id);

    for (const id of ids) {
      const success = await uploadSingleReport(id);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    }

    if (uploaded > 0) {
      notifications.notify({
        variant: "success",
        text: `${uploaded} offline report${uploaded > 1 ? "s" : ""} uploaded successfully.`,
      });
    }
    if (failed > 0) {
      notifications.notify({
        variant: "warning",
        text: `${failed} report${failed > 1 ? "s" : ""} could not be uploaded. They will remain in your queue.`,
        icon: "mdi-cloud-off-outline",
      });
    }

    isUploading.value = false;
    return { uploaded, failed };
  }

  return {
    pendingReports,
    pendingCount,
    isUploading,
    addPendingReport,
    removePendingReport,
    uploadSingleReport,
    uploadPendingReports,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOfflineStore, import.meta.hot));
}
