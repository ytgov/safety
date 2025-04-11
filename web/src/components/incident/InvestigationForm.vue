<template>
  <v-dialog max-width="650px" persistent>
    <v-card>
      <v-toolbar color="info">
        <v-toolbar-title class="d-flex"> Investigation </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-help-circle-outline" @click="helpClick"></v-btn>
        <v-btn icon="mdi-close" @click="close"></v-btn>
      </v-toolbar>
      <v-window v-model="step" style="max-height: 550px; overflow-y: scroll">
        <v-window-item :value="0">
          <v-card-text>
            <h3>Data Collection</h3>
            <p class="mb-5">
              All the collected data must be stored in a secure file. Only the investigator/ investigation team should
              have access to the file. Use the following as a checklist. Check all that apply.
            </p>

            <v-checkbox
              v-for="option in collectionOptions"
              v-model="collections"
              :value="option.value"
              :label="option.title"
              hide-details
              return-object
              density="compact" />

            <v-textarea
              v-model="collections_other"
              class="mt-2"
              label="Rationale for any data that was not able to be collected at this time"
              rows="2" />
          </v-card-text>
        </v-window-item>
        <v-window-item :value="1">
          <v-card-text>
            <h3>{{ incident_type_description == "Hazard" ? "Potential" : "" }} Event Type</h3>
            <p class="mb-5">Check all that apply.</p>

            <v-checkbox
              v-for="option in eventOptions.filter((o) => o.value != 'serious')"
              v-model="events"
              :value="option.value"
              :label="option.title"
              hide-details
              return-object
              density="compact">
            </v-checkbox>

            <div class="d-flex">
              <v-checkbox v-model="events" value="serious" hide-details density="compact">
                <template v-slot:label> Serious Incident (as per WSCA) </template>
              </v-checkbox>

              <v-tooltip location="top" width="600" open-delay="250">
                <template #activator="{ props }">
                  <v-icon color="primary" class="ml-2 pt-4 cursor-pointer" v-bind="props">mdi-information</v-icon>
                </template>
                <ul class="mx-5 my-3">
                  <li>An incident that results in serious injury to or the death of a worker</li>
                  <li>An incident or injury that results in a worker's admission to a hospital as an inpatient</li>
                  <li>
                    A major structural failure or collapse of a bridge, building, crane, excavation, hoist, mine, mining
                    development, temporary construction support system, tower or any other like structure
                  </li>
                  <li>A major release of a hazardous substance</li>
                  <li>
                    An explosion or fire that has the potential to cause serious injury to or the death of a worker or
                    other person
                  </li>
                  <li>
                    An incident, injury or death that is required to be reported by the regulations or by order of the
                    board
                  </li>
                </ul>
              </v-tooltip>
            </div>
            <v-alert v-if="showWCBLink" type="warning" class="mt-5">
              Events of this type should also be reported to WSCB via the
              <strong>Employer's report of injury or illness (F-0036)</strong> form located at:<br />
              <a href="https://www.wcb.yk.ca/web-0063/f-0036" target="_blank" style="text-decoration: underline"
                >https://www.wcb.yk.ca/web-0063/f-0036
              </a>
            </v-alert>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="2">
          <v-card-text>
            <h3>Incident Type</h3>

            <p class="mb-5">Select the most relevant type.</p>

            <v-select v-model="incidents" label="Incident type" :items="incidentOptions" return-object />

            <v-textarea v-model="incidents_other" class="mt-3" label="Additional applicable information" rows="2" />
          </v-card-text>
        </v-window-item>
        <v-window-item :value="3">
          <v-card-text>
            <h3>Immediate Cause</h3>
            <p class="mb-5">Select the most relevant cause.</p>

            <v-select
              v-model="acts"
              label="Cause"
              :items="actsAndConditions"
              :item-props="true"
              return-object
              item-text="title">
              <template #selection="{ item }">
                <strong>{{ item.props.subtitle }}:&nbsp;</strong> {{ item.title }}
              </template>
            </v-select>
          </v-card-text>
        </v-window-item>
        <v-window-item :value="4">
          <v-card-text>
            <h3>Contributing Factors</h3>
            <p class="mb-5">Select all that apply.</p>

            <v-select
              v-model="factors"
              label="Contributing factors"
              :items="factorOptions"
              item-text="title"
              return-object
              chips
              clearable
              multiple />
          </v-card-text>
        </v-window-item>
        <v-window-item :value="5">
          <v-card-text>
            <h3>Root Cause</h3>
            <p class="mb-5">Select all that apply.</p>

            <v-select
              v-model="causes"
              label="Root causes"
              :items="rootCauseOptions"
              item-text="title"
              return-object
              chips
              clearable
              multiple />
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-card-text class="d-flex">
        <v-btn :disabled="!isPrev" color="primary" @click="step--">Prev</v-btn>
        <v-spacer />
        <div class="pt-1">Step {{ step + 1 }}: {{ stepName }}</div>
        <v-spacer />
        <v-btn v-if="!isDone" :disabled="!isNext" color="primary" @click="step++">Next</v-btn>
        <v-btn v-else :disabled="!isNext" color="success" @click="save">Save</v-btn>
      </v-card-text>
    </v-card>

    <GetHelpDialog v-model="showHelp" :incident="incident" @do-close="showHelp = false" />
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useReportStore } from "@/store/ReportStore";
import { useUserStore } from "@/store/UserStore";
import { useInterfaceStore } from "@/store/InterfaceStore";
import { isNil } from "lodash";
import { useActionStore } from "@/store/ActionStore";
import GetHelpDialog from "@/components/incident/GetHelpDialog.vue";

const props = defineProps(["incidentId", "incident_type_description", "incident"]);
const emits = defineEmits(["complete", "close"]);

const reportStore = useReportStore();
const { saveInvestigation } = reportStore;

const actionStore = useActionStore();
const { saveAction } = actionStore;

const interfaceStore = useInterfaceStore();
const { showOverlay, hideOverlay } = interfaceStore;

const userStore = useUserStore();
const { user } = userStore;

const showHelp = ref(false);
const helpClick = () => {
  showHelp.value = true;
};

const step = ref(0);
const stepName = computed(() => {
  return steps.value[step.value].name;
});

const steps = ref([
  { name: "Data Collection" },
  { name: "Event Type" },
  { name: "Incident Type" },
  { name: "Immediate Cause" },
  { name: "Contributing Factors" },
  { name: "Root Cause" },
]);

const collections_other = ref("");
const collections = ref([]);
const collectionOptions = [
  { title: "Photos and/or sketching of scene", value: "photo", required: true },
  { title: "Samples/ tests (noise, material etc.)", value: "sample", required: true },
  { title: "Witnesses identified and statement collected", value: "statement", required: true },
  { title: "Documents (SWPS, JHSC meeting minutes, inspection reports etc.)", value: "documents", required: true },
  { title: "Witnesses interviewed", value: "interview", required: true },
  { title: "Other, Please explain below", value: "other", required: false },
];
const hasAllRequiredCollections = computed(() => {
  return collections.value.length > 0;
});

const events = ref([]);
const eventOptions = computed(() => {
  const baseOptions = [
    { title: "Injury - First aid", value: "first_aid", required: true },
    { title: "Injury - Medical aid", value: "medical_aid", required: true },
    { title: "Damage", value: "damage", required: true },
    { title: "Service Loss", value: "service_loss", required: true },
    { title: "Environmental impact", value: "environmental", required: true },
    { title: "Serious Incident (as per WSCA)", value: "serious", required: true },
  ];

  if (props.incident_type_description.startsWith("No Loss Incident"))
    baseOptions.unshift({ title: "Unknown Outcome", value: "unknown" });

  return baseOptions;
});

const hasAllRequiredEvents = computed(() => {
  return events.value.length > 0;
});

const showWCBLink = computed(() => {
  const linkItems = ["medical_aid", "serious"];
  return events.value.filter((e) => linkItems.includes(e)).length > 0;
});

const incidents_other = ref("");
const incidents = ref(null);
const incidentOptions = [
  { title: "Slip, trip or fall", value: "slip_trip_or_fall" },
  { title: "Fall from height", value: "fall_from_height" },
  { title: "Musculoskeletal Damage (MSD) / Overexertion", value: "musculoskeletal_damage_msd_overexertion" },
  { title: "Exposure", value: "exposure" },
  { title: "Sharps / puncture / laceration", value: "sharps_puncture_laceration" },
  { title: "Physical abuse / violence", value: "physical_abuse_violence" },
  { title: "Motor vehicle accident", value: "motor_vehicle_accident" },
  { title: "Caught in/ on/ between objects", value: "caught_in_on_between_objects" },
  { title: "Struck against/ Struck by", value: "struck_against_struck_by" },
  { title: "Fire/explosion", value: "fire_explosion" },
  { title: "Contact with electrical component", value: "contact_with_electrical_component" },
  { title: "Spill/ containment breach", value: "spill_containment_breach" },
];
const hasAllRequiredIncidents = computed(() => {
  return !isNil(incidents.value);
});

const acts = ref(null);
const actsAndConditions = ref([
  { title: "Operating without authority", subtitle: "Act or Practice", value: "operating_without_authority" },
  { title: "Failure to secure or warn", subtitle: "Act or Practice", value: "failure_to_secure_or_warn" },
  { title: "Working at unsafe speed", subtitle: "Act or Practice", value: "working_at_unsafe_speed" },
  { title: "Removing safety devices", subtitle: "Act or Practice", value: "removing_safety_devices" },
  { title: "Improper position or posture", subtitle: "Act or Practice", value: "improper_position_or_posture" },
  {
    title: "Improper lifting, loading, placing",
    subtitle: "Act or Practice",
    value: "improper_lifting_loading_placing",
  },
  { title: "Working on operating equipment", subtitle: "Act or Practice", value: "working_on_operating_equipment" },
  { title: "Improper activity or behavior", subtitle: "Act or Practice", value: "improper_activity_or_behavior" },
  { title: "Failure to use PPE", subtitle: "Act or Practice", value: "failure_to_use_ppe" },
  { title: "Failure to lockout", subtitle: "Act or Practice", value: "failure_to_lockout" },
  { title: "3rd party action", subtitle: "Act or Practice", value: "third_party_action" },
  { title: "Impairment", subtitle: "Act or Practice", value: "impairment" },

  { title: "Improper guard/ barrier", subtitle: "Condition", value: "improper_guard_barrier" },
  { title: "Inadequate visibility", subtitle: "Condition", value: "inadequate_visibility" },
  { title: "Fire, explosion, atmospheric hazard", subtitle: "Condition", value: "fire_explosion_atmospheric_hazard" },
  { title: "Hazardous personal attire", subtitle: "Condition", value: "hazardous_personal_attire" },
  { title: "Hazardous method or procedure", subtitle: "Condition", value: "hazardous_method_or_procedure" },
  { title: "Hazardous design or procedure", subtitle: "Condition", value: "hazardous_design_or_procedure" },
  { title: "Outside hazardous condition", subtitle: "Condition", value: "outside_hazardous_condition" },
  { title: "Slippery surface", subtitle: "Condition", value: "slippery_surface" },
  { title: "Improperly labelled or identified", subtitle: "Condition", value: "improperly_labelled_or_identified" },
  {
    title: "Defective tools, equipment or materials",
    subtitle: "Condition",
    value: "defective_tools_equipment_materials",
  },
  { title: "Congestion", subtitle: "Condition", value: "congestion" },
  { title: "Inadequate warning", subtitle: "Condition", value: "inadequate_warning" },
  { title: "Poor housekeeping", subtitle: "Condition", value: "poor_housekeeping" },
  { title: "Noise exposure", subtitle: "Condition", value: "noise_exposure" },
  { title: "Radiation exposures", subtitle: "Condition", value: "radiation_exposures" },
  { title: "High or low temperature exposures", subtitle: "Condition", value: "high_low_temperature_exposures" },
  { title: "Improper ventilation", subtitle: "Condition", value: "improper_ventilation" },
]);

const hasAllRequiredCauses = computed(() => {
  return !isNil(acts.value);
});

const factors = ref([]);
const factorOptions = [
  { title: "Congestion", value: "congestion" },
  { title: "Weather conditions", value: "weather_conditions" },
  { title: "Temperature", value: "temperature" },
  { title: "Lighting", value: "lighting" },
  { title: "Ventilation", value: "ventilation" },
  { title: "Vibration", value: "vibration" },
  { title: "Inadequate capability", value: "inadequate_capability" },
  { title: "Stress", value: "stress" },
  { title: "Improper motivation", value: "improper_motivation" },
  { title: "Improper use (misuse)", value: "improper_use" },
  { title: "Inadequate leadership", value: "inadequate_leadership" },
  { title: "Lack of supervision", value: "lack_of_supervision" },
  { title: "Inadequate engineering", value: "inadequate_engineering" },
  { title: "Inadequate purchasing", value: "inadequate_purchasing" },
  { title: "Inadequate tools/equip/materials", value: "inadequate_tools_equip_materials" },
  {
    title: "Incorrect/defective/unavailable tool, material, equipment",
    value: "incorrect_defective_unavailable_tool_material_equipment",
  },
  { title: "Inadequate work standards", value: "inadequate_work_standards" },
  { title: "Wear and tear", value: "wear_and_tear" },
  { title: "Chemical", value: "chemical" },
  { title: "Failure to detect or correct known hazards", value: "failure_to_detect_or_correct_known_hazards" },
  {
    title: "Worker did not understand the Work/Task Instructions",
    value: "worker_did_not_understand_work_task_instructions",
  },
  {
    title: "Lack of Training/Information/Instruction delivered to worker",
    value: "lack_of_training_information_instruction",
  },
  { title: "Failure to Implement Recommendations from JHSC", value: "failure_to_implement_recommendations_from_jhsc" },
  { title: "Hazardous Method/Procedure Used", value: "hazardous_method_procedure_used" },
  { title: "Slippery, Dusty or tripping hazard", value: "slippery_dusty_tripping_hazard" },
  { title: "Improper Position/Posture (Ergonomics)", value: "improper_position_posture_ergonomics" },
  {
    title: "Inadequate safe work practices, procedures or policies",
    value: "inadequate_safe_work_practices_procedures_policies",
  },
  { title: "Unauthorized Task/Operation", value: "unauthorized_task_operation" },
  { title: "Inadequate Personal Protective Equipment", value: "inadequate_personal_protective_equipment" },
  { title: "Not Wearing proper PPE", value: "not_wearing_proper_ppe" },
  { title: "Workstation Layout is Faulty", value: "workstation_layout_is_faulty" },
  { title: "Unsafe design/layout/construction", value: "unsafe_design_layout_construction" },
];
const hasAllRequiredFactors = computed(() => {
  return factors.value.length > 0;
});

const causes = ref([]);
const rootCauseOptions = [
  { title: "Leadership training and understanding", value: "leadership_training_understanding" },
  { title: "Planned inspections and maintenance", value: "planned_inspections_maintenance" },
  { title: "Insufficient risk assessments", value: "insufficient_risk_assessments" },
  { title: "Improper Incident investigation", value: "improper_incident_investigation" },
  { title: "Performance observation", value: "performance_observation" },
  { title: "Emergency preparedness", value: "emergency_preparedness" },
  { title: "Rules and work permits", value: "rules_work_permits" },
  { title: "Failure to review previous Incident(s) data", value: "failure_review_previous_incident_data" },
  { title: "Training programs", value: "training_programs" },
  { title: "Personal protective equipment program", value: "ppe_program" },
  { title: "Health and hygiene control", value: "health_hygiene_control" },
  { title: "HSMS implementation and review", value: "hsms_implementation_review" },
  { title: "Engineering and change management", value: "engineering_change_management" },
  { title: "Personal communications", value: "personal_communications" },
  { title: "Team communications", value: "team_communications" },
  { title: "Hiring and placement", value: "hiring_placement" },
  { title: "Materials and services management", value: "materials_services_management" },
  { title: "Failure to respond to HSC recommendations", value: "failure_respond_hsc_recommendations" },
];
const hasAllRootCauses = computed(() => {
  return causes.value.length > 0;
});

const isPrev = computed(() => {
  return step.value > 0;
});
const isNext = computed(() => {
  if (step.value == 0) return hasAllRequiredCollections.value;
  if (step.value == 1) return hasAllRequiredEvents.value;
  if (step.value == 2) return hasAllRequiredIncidents.value;
  if (step.value == 3) return hasAllRequiredCauses.value;
  if (step.value == 4) return hasAllRequiredFactors.value;
  if (step.value == 5) return hasAllRootCauses.value;

  return step.value < steps.value.length - 1;
});
const isDone = computed(() => {
  return step.value == steps.value.length - 1;
});

function close() {
  collections_other.value = "";
  collections.value = [];
  events.value = [];
  incidents_other.value = "";
  incidents.value = null;
  acts.value = null;
  factors.value = [];
  causes.value = [];

  emits("close");
  step.value = 0;
}

async function save() {
  showOverlay("Saving Investigation");

  const collectionInfo = collectionOptions.filter((o) => collections.value.includes(o.value));
  const eventInfo = eventOptions.filter((o) => events.value.includes(o.value));

  const investigation = {
    incident_id: props.incidentId,
    investigation_data: {
      collections_other: collections_other.value,
      collections: collectionInfo,
      events: eventInfo,
      incidents_other: incidents_other.value,
      incidents: incidents.value,
      acts: acts.value,
      factors: factors.value,
      causes: causes.value,
    },
  };

  await saveInvestigation(investigation);

  const items = [];
  const urgency_code = "Low";
  const hazard_type_id = 1;

  items.push({
    incident_id: props.incidentId,
    description: `Acting/Practice: ${acts.value.title}`,
    actor_user_id: user.id,
    actor_user_email: user.email,
    actor_display_name: user.display_name,
    urgency_code,
    hazard_type_id,
  });

  for (let item of factors.value) {
    items.push({
      incident_id: props.incidentId,
      description: `Contributing Factor: ${item.title}`,
      actor_user_id: user.id,
      actor_user_email: user.email,
      actor_display_name: user.display_name,
      urgency_code,
      hazard_type_id,
    });
  }
  for (let item of causes.value) {
    items.push({
      incident_id: props.incidentId,
      description: `Root Cause: ${item.title}`,
      actor_user_id: user.id,
      actor_user_email: user.email,
      actor_display_name: user.display_name,
      urgency_code,
      hazard_type_id,
    });
  }

  for (let item of items) {
    await saveAction(item);
  }

  emits("complete");
  close();
  //step.value = 0;
  hideOverlay();
}
</script>
