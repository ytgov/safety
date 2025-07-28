<template>
  <v-dialog v-model="internalVisible" persistent max-width="700">
    <v-card>
      <v-toolbar color="primary" variant="dark" title="Edit Location">
        <v-spacer></v-spacer>
        <v-btn icon @click="handleClose" color="white">
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
        <v-btn color="primary" variant="flat">Save</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="yg_sun" variant="outlined" @click="handleClose">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useDataInjectionSourceAdminStore } from "../store";

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
        }
        else {
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
      "unselectDataInjectionFile"
    ]),
    handleClose() {
      this.unselectDataInjectionSourceId();
      this.unselectDataInjectionFile();
      this.internalVisible = false;
    },
  },
};
</script>
