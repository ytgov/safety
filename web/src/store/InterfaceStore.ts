import { ref } from "vue";
import { defineStore } from "pinia";

export const useInterfaceStore = defineStore("interface", () => {
  const showApplicationOverlay = ref(true);
  const isOffline = ref(false);
  const overlayMessage = ref("");

  window.addEventListener("offline", function (e) {
    console.log("offline");
    isOffline.value = true;
  });

  window.addEventListener("online", function (e) {
    console.log("online");
    isOffline.value = false;
  });

  function showOverlay(message?: string) {
    console.log("SHOW OVER");
    overlayMessage.value = message ?? "";
    showApplicationOverlay.value = true;
  }

  function hideOverlay() {
    console.log("HIDE OVER");
    showApplicationOverlay.value = false;
  }

  return { showApplicationOverlay, isOffline, showOverlay, hideOverlay, overlayMessage };
});
