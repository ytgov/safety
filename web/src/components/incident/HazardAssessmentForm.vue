<template>
  <v-dialog v-model="show" max-width="650px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title class="d-flex"> Hazard Assessment </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>
      <ActionCreateForm :action="action" @do-close="close" @save="save" />
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { isNil } from "lodash";
import { useActionStore } from "@/store/ActionStore";
import ActionCreateForm from "@/components/action/ActionCreateForm.vue";

const props = defineProps(["incidentId", "incident_type_description", "hazardReport", "modelValue"]);
const emits = defineEmits(["complete", "close"]);

const show = ref(false);

const reportStore = useReportStore();
const { saveInvestigation } = reportStore;

const actionStore = useActionStore();
const { saveAction } = actionStore;

const action = ref({ categories: [] });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      action.value = {
        description: `${props.hazardReport?.description}`,
        incident_id: props.incidentId,
        categories: [],
      };
    }
    show.value = val;
  }
);

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { user } = userStore;

function close() {
  emits("close");
}

async function save() {
  showOverlay("Saving Assessment");

  const urgency_code = "Low";
  const hazard_type_id = 1;

  const item = {
    ...action.value,
    actor_user_id: user.id,
    actor_user_email: user.email,
    actor_display_name: user.display_name,
    urgency_code,
    hazard_type_id,
  };

  await saveAction(item);

  emits("complete");
  close();
  //step.value = 0;
  hideOverlay();
}
</script>
