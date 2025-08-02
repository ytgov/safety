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
          :items="dataIngestionSources"
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

import { useUserStore } from "@/store/UserStore";
import { useDataIngestionSourceAdminStore } from "../store";
import { useNotificationStore } from "@/store/NotificationStore";

export default {
  name: "DataIngestionEditor",
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue"],
  mounted() {
    this.getAllDataIngestionSources();
  },
  computed: {
    ...mapState(useDataIngestionSourceAdminStore, [
      "dataIngestionSources",
      "selectedDataIngestionSourceId",
      "selectedDataIngestionFile",
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
        return this.selectedDataIngestionSourceId;
      },
      set(id: number | undefined) {
        if (id != undefined) {
          this.selectDataIngestionSourceId(id);
        }
      },
    },
    selectedFile: {
      get() {
        return this.selectedDataIngestionFile;
      },
      set(file: File | undefined) {
        if (file != undefined) {
          this.selectDataIngestionFile(file);
        } else {
          this.unselectDataIngestionFile();
        }
      },
    },
  },
  methods: {
    ...mapActions(useDataIngestionSourceAdminStore, [
      "getAllDataIngestionSources",
      "selectDataIngestionSourceId",
      "unselectDataIngestionSourceId",
      "selectDataIngestionFile",
      "unselectDataIngestionFile",
      "addDataIngestion",
    ]),
    ...mapActions(useUserStore, ["loadCurrentUser"]),
    handleClose() {
      this.unselectDataIngestionSourceId();
      this.unselectDataIngestionFile();
      this.internalVisible = false;
    },
    async handleSave() {
      const notify = useNotificationStore();

      try {
        await this.loadCurrentUser();

        if (!this.selectedDataIngestionSourceId || !this.selectedDataIngestionFile) {
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
        await this.addDataIngestion(this.user.id);
      } catch (err) {
        console.error("save failed");
      }
    },
  },
};
</script>
