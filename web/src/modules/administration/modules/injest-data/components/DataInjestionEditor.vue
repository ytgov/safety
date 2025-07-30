<template>
  <v-dialog
    v-model="internalVisible"
    persistent
    max-width="700"
  >
    <v-card>
      <v-toolbar
        color="primary"
        variant="dark"
        title="Edit Location"
      >
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="handleClose"
          color="white"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-select
          v-model="selectedId"
          :items="dataInjectionSources"
          item-title="source_name"
          item-value="id"
          label="Data Source"
          dense
          outlined
        />
        <v-file-input
          v-model="selectedFile"
          label="Upload File"
          dense
          outlined
          accept=".csv"
          show-size
          prepend-icon="mdi-upload"
          class="mb-2"
        />
      </v-card-text>

      <v-card-actions class="mx-4 mb-2">
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSave"
          >Save</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="yg_sun"
          variant="outlined"
          @click="handleClose"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useDataInjectionSourceAdminStore } from "../store";
import { useUserStore } from "@/store/UserStore";
import { useNotificationStore } from "@/store/NotificationStore";

export default {
  name: "DataInjestionEditor",
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue"],
  mounted() {
    this.getAllDataInjectionSources();
  },
  computed: {
    ...mapState(useDataInjectionSourceAdminStore, [
      "dataInjectionSources",
      "selectedDataInjectionSourceId",
      "selectedDataInjectionFile",
    ]),
    ...mapState(useUserStore, ["user"]),
    internalVisible: {
      get() {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
    selectedId: {
      get() {
        return this.selectedDataInjectionSourceId;
      },
      set(id: number | undefined) {
        if (id != undefined) {
          this.selectDataInjectionSourceId(id);
        }
      },
    },
    selectedFile: {
      get() {
        return this.selectedDataInjectionFile;
      },
      set(file: File | undefined) {
        if (file != undefined) {
          this.selectDataInjectionFile(file);
        } else {
          this.unselectDataInjectionFile();
        }
      },
    },
  },
  methods: {
    ...mapActions(useDataInjectionSourceAdminStore, [
      "getAllDataInjectionSources",
      "selectDataInjectionSourceId",
      "unselectDataInjectionSourceId",
      "selectDataInjectionFile",
      "unselectDataInjectionFile",
      "addDataInjection",
    ]),
    ...mapActions(useUserStore, ["loadCurrentUser"]),
    handleClose() {
      this.unselectDataInjectionSourceId();
      this.unselectDataInjectionFile();
      this.internalVisible = false;
    },
    async handleSave() {
      const notify = useNotificationStore();
      this.isLoading = true;

      try {
        // 1) ensure we have current user
        await this.loadCurrentUser();

        // 2) guard missing inputs
        if (!this.selectedDataInjectionSourceId || !this.selectedDataInjectionFile) {
          return notify.notify({
            text: "Please select a data source and upload a file.",
            variant: "warning",
            icon: "mdi-alert-circle",
            status_code: 400,
          });
        }
        if (!this.user?.id) {
          return notify.notify({
            text: "You must be logged in to do this.",
            variant: "error",
            icon: "mdi-alert-circle",
            status_code: 401,
          });
        }
        console.log(this.selectedDataInjectionFile);
        // 3) perform the injection
        await this.addDataInjection(this.user.id);
        // success toast is already shown inside addDataInjection
      } catch (err) {
        console.error("save failed");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
