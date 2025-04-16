<template>
  <v-dialog v-model="showDialog" persistent width="600px">
    <v-card>
      <v-toolbar color="info" density="comfortable">
        <v-toolbar-title class="text-white" style="">Need Help ?</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="closeClick"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <p class="mb-3">
          If you are struggling to complete the Investigation, the following people in
          {{ incident.department_code }} are available to provide support.
        </p>
        <p class="mb-5">When you add them, they will receive an email and be added to this report as a linked user.</p>

        <v-radio-group v-model="helper">
          <v-radio
            v-for="helper of helpers"
            :key="helper.email"
            :value="helper.email"
            :label="helper.display_name"></v-radio>
        </v-radio-group>

        <v-btn :disabled="!helper" color="primary" @click="assignClick">Send Help Request</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";

const props = defineProps(["incident"]);
const emit = defineEmits(["doClose"]);

const helper = ref(null);
const helpers = ref([]);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const reportStrore = useReportStore();
const { addLinkedUser } = reportStrore;

const userStore = useUserStore();
const { getHelpers } = userStore;

const showDialog = ref(false);

onMounted(async () => {
  await loadHelpers();
});

function closeClick() {
  showDialog.value = false;
  emit("doClose");
}

async function loadHelpers() {
  helpers.value = await getHelpers(props.incident.id);
}

async function assignClick() {
  showOverlay("Adding linked user...");
  await addLinkedUser({
    user_email: helper.value,
    incident_id: props.incident.id,
    reason: "supervisor",
  });
  hideOverlay();

  closeClick();
}
</script>
