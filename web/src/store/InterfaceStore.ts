import { ref } from "vue";
import { defineStore } from "pinia";

export const useInterfaceStore = defineStore("interface", () => {
  const showApplicationOverlay = ref(true);
  const isOffline = ref(false);

  window.addEventListener("offline", function (e) {
    console.log("offline");
    isOffline.value = true;
  });

  window.addEventListener("online", function (e) {
    console.log("online");
    isOffline.value = false;
  });

  function showOverlay() {
    console.log("SHOW OVER");
    showApplicationOverlay.value = true;
  }

  function hideOverlay() {
    console.log("HIDE OVER");
    showApplicationOverlay.value = false;
  }

  return { showApplicationOverlay, isOffline, showOverlay, hideOverlay };
});
