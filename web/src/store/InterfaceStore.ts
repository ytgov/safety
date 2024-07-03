import { ref } from "vue";
import { defineStore } from "pinia";

export const useInterfaceStore = defineStore("interface", () => {
  const showApplicationOverlay = ref(true);
  const isOffline = ref(false);

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
