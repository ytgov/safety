<template>
  <v-dialog v-model="dialog" max-width="650px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title>Edit Incident Details</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>
      <v-card-text>
        <v-label class="mb-1">Department</v-label>
        <v-autocomplete v-model="form.department_code" :items="departments" item-title="name" item-value="code" />

        <v-label class="mb-1">Supervisor</v-label>
        <DirectorySelector ref="directorySelectorRef" label="Search and select supervisor"
          @selected="handleSupervisorSelect" />

        <v-label class="mb-1">General location</v-label>
        <v-autocomplete v-model="form.location_code" :items="locations" :item-title="makeLocationTitle"
          item-value="code">
          <template #item="{ item, props }">
            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="`Community: ${item.raw.community}`" />
          </template>
          <template #selection="{ item }">
            {{ makeLocationTitle(item.raw) }}
          </template>
        </v-autocomplete>

        <v-label class="mb-1" style="white-space: inherit">Specific location</v-label>
        <v-text-field v-model="form.location_detail" />

        <v-label class="mb-1" style="white-space: inherit">Description of event</v-label>
        <v-textarea v-model="form.description" hint="Please do not include names or personal identifiers"
          persistent-hint />
          
        <div class="d-flex">
          <v-btn color="secondary" @click="close">Cancel</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="save">Save</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useReportStore } from "@/store/ReportStore";
import { useDepartmentStore } from "@/store/DepartmentStore";
import DirectorySelector from "@/components/DirectorySelector.vue";

const props = defineProps(["incidentId"]);
const emit = defineEmits(["complete", "close"]);

const dialog = defineModel({ type: Boolean });

const reportStore = useReportStore();
const { adminUpdateReport, loadReport } = reportStore;
const { selectedReport, locations } = storeToRefs(reportStore);

const departmentStore = useDepartmentStore();
departmentStore.initialize();
const { departments } = storeToRefs(departmentStore);

const directorySelectorRef = ref(null);

const form = ref({
  department_code: "",
  supervisor_email: "",
  location_code: "",
  location_detail: "",
  description: "",
});

watch(dialog, (val) => {
  if (val && selectedReport.value) {
    form.value = {
      department_code: selectedReport.value.department_code || "",
      supervisor_email: selectedReport.value.supervisor_email || "",
      location_code: selectedReport.value.location_code || "",
      location_detail: selectedReport.value.location_detail || "",
      description: selectedReport.value.description || "",
    };
  }
});

function handleSupervisorSelect(value) {
  if (value) form.value.supervisor_email = value.email;
  else form.value.supervisor_email = "";
}

function makeLocationTitle(item) {
  return `${item.name}: ${item.community}`;
}

function close() {
  if (directorySelectorRef.value) directorySelectorRef.value.clear();
  emit("close");
}

async function save() {
  await adminUpdateReport(props.incidentId, form.value);
  await loadReport(selectedReport.value.slug);
  if (directorySelectorRef.value) directorySelectorRef.value.clear();
  emit("complete");
}
</script>
