import { defineStore } from "pinia";
import { markRaw } from "vue";

export const useUpdateStore = defineStore("update", {
  state: () => ({
    visible: false,
    worker: null as ServiceWorker | null,
  }),
  actions: {
    show(worker: ServiceWorker) {
      this.worker = markRaw(worker);
      this.visible = true;
    },
    reload() {
      if (this.worker) this.worker.postMessage({ type: "SKIP_WAITING" });
      this.visible = false;
    },
    dismiss() {
      this.visible = false;
    },
  },
});
