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
          :items="dataInjestionSources"
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
import { useDataInjestionSourceAdminStore } from "../store";
import { useNotificationStore } from "@/store/NotificationStore";

export default {
  name: "DataInjestionEditor",
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue"],
  mounted() {
    this.getAllDataInjestionSources();
  },
  computed: {
    ...mapState(useDataInjestionSourceAdminStore, [
      "dataInjestionSources",
      "selectedDataInjestionSourceId",
      "selectedDataInjestionFile",
      "isLoading",
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
        return this.selectedDataInjestionSourceId;
      },
      set(id: number | undefined) {
        if (id != undefined) {
          this.selectDataInjestionSourceId(id);
        }
      },
    },
    selectedFile: {
      get() {
        return this.selectedDataInjestionFile;
      },
      set(file: File | undefined) {
        if (file != undefined) {
          this.selectDataInjestionFile(file);
        } else {
          this.unselectDataInjestionFile();
        }
      },
    },
  },
  methods: {
    ...mapActions(useDataInjestionSourceAdminStore, [
      "getAllDataInjestionSources",
      "selectDataInjestionSourceId",
      "unselectDataInjestionSourceId",
      "selectDataInjestionFile",
      "unselectDataInjestionFile",
      "addDataInjestion",
    ]),
    ...mapActions(useUserStore, ["loadCurrentUser"]),
    handleClose() {
      this.unselectDataInjestionSourceId();
      this.unselectDataInjestionFile();
      this.internalVisible = false;
    },
    async handleSave() {
      const notify = useNotificationStore();
      this.isLoading = true;

      try {
        await this.loadCurrentUser();

        if (!this.selectedDataInjestionSourceId || !this.selectedDataInjestionFile) {
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
        await this.addDataInjestion(this.user.id);
      } catch (err) {
        console.error("save failed");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
