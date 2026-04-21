import { ref } from "vue";
import { defineStore } from "pinia";
import { apiBaseUrl } from "@/config";
import { useOfflineStore } from "./OfflineStore";

export const useInterfaceStore = defineStore("interface", () => {
  const showApplicationOverlay = ref(true);
  const isOffline = ref(!navigator.onLine);
  const overlayMessage = ref("");

  let connectivityInterval: ReturnType<typeof setInterval> | null = null;

  async function checkConnectivity() {
    try {
      const resp = await fetch(`${apiBaseUrl}/api/healthCheck`, {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      isOffline.value = !resp.ok;
    } catch {
      isOffline.value = true;
    }

    // Flush the queue whenever we're online and have pending reports — not
    // just on the offline→online transition — so submissions from a previous
    // session (app closed while offline, reopened while online) still upload.
    // uploadPendingReports() guards against concurrent runs internally.
    if (!isOffline.value) {
      const offlineStore = useOfflineStore();
      if (offlineStore.pendingCount > 0) {
        offlineStore.uploadPendingReports();
      }
    }
  }

  // Use browser events as fast signal, verify with server ping
  window.addEventListener("offline", function () {
    isOffline.value = true;
  });

  window.addEventListener("online", function () {
    checkConnectivity();
  });

  // Poll every 30 seconds for server reachability
  connectivityInterval = setInterval(checkConnectivity, 30000);
  checkConnectivity();

  function showOverlay(message?: string) {
    overlayMessage.value = message ?? "";
    showApplicationOverlay.value = true;
  }

  function hideOverlay() {
    showApplicationOverlay.value = false;
  }

  return { showApplicationOverlay, isOffline, showOverlay, hideOverlay, overlayMessage };
});
