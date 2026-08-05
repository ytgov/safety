<template>
  <v-breadcrumbs :items="[
    { title: 'Home', to: '/' },
    { title: 'Committee Meetings', to: '/committee-meetings' },
    { title: 'Meeting Setup' },
  ]" />

  <div v-if="!meeting && isLoading" class="text-center py-12">
    <v-progress-circular indeterminate />
  </div>

  <div v-else-if="meeting">
    <h1 class="text-h4 mb-1">{{ meeting.committee_name }} – Meeting Setup</h1>
    <p class="text-body-1 text-medium-emphasis mb-4">
      <strong>{{ formatDate(meeting.meeting_date) }}</strong>
    </p>

    <v-card class="default">
      <v-stepper v-model="step" flat alt-labels bg-color="#ffffff00">
        <v-stepper-header>
          <template v-for="(s, idx) in stepDefs" :key="s.key">
            <v-stepper-item :value="idx + 1" :title="s.title" :complete="step > idx + 1" />
            <v-divider v-if="idx < stepDefs.length - 1" />
          </template>
        </v-stepper-header>
      </v-stepper>

      <v-divider />

      <v-card-text class="pt-5">
        <!-- Step 1: Choose how minutes are captured -->
        <template v-if="currentKey === 'mode'">
          <h3 class="text-h6 mb-4">How would you like to record the minutes?</h3>
          <v-radio-group v-model="mode">
            <v-radio value="upload" class="mb-5">
              <template #label>
                <div>
                  <div class="font-weight-medium">Upload meeting minutes</div>
                  <div class="text-medium-emphasis text-body-2">
                    I already have minutes and want to attach a document.
                  </div>
                </div>
              </template>
            </v-radio>
            <v-radio value="guided">
              <template #label>
                <div>
                  <div class="font-weight-medium">Guide me through the sections</div>
                  <div class="text-medium-emphasis text-body-2">
                    Walk through discussion items, hazard assessments and work refusals.
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </template>

        <!-- Upload path -->
        <template v-else-if="currentKey === 'upload'">
          <h3 class="text-h6 mb-4">Upload Minutes</h3>
          <v-file-input v-model="uploadFiles" label="Choose file(s)" prepend-icon="" prepend-inner-icon="mdi-paperclip"
            show-size clearable multiple />
        </template>

        <!-- Final step: quorum (both paths) + review numbers (upload only) -->
        <template v-else-if="currentKey === 'review'">
          <h3 class="text-h6 mb-4">Review Questions</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="form.quorum" :items="['Yes', 'No']" label="Did you meet quorum?" />
              <v-select v-if="form.quorum === 'No'" v-model="form.meet_anyway" :items="['Yes', 'No']"
                label="Did you meet anyway for informational purposes?" />

              <v-text-field v-model="form.no_loss_incidents_reviewed" type="number" min="0"
                label="Number of no loss (near miss) incidents reviewed by the committee" />
              <v-text-field v-model="form.loss_incidents_reviewed" type="number" min="0"
                label="Number of loss incidents reviewed by the committee" />
              <v-text-field v-model="form.new_hazards_reviewed" type="number" min="0"
                label="Number of new hazards reviewed by the committee" />
              <v-select v-model="form.worker_vacancies" :items="['Yes', 'No']"
                label="Do you currently have any worker member vacancies, as defined by your committee's Rules Of Procedure (ROP)?" />
              <v-text-field v-if="form.worker_vacancies === 'Yes'" v-model="form.worker_vacancy_count" type="number"
                min="0" label="How many worker vacancies do you have?" />
            </v-col>
          </v-row>
        </template>

        <!-- Guided step 1: Outstanding discussion items -->
        <template v-else-if="currentKey === 'outstanding'">
          <h3 class="text-h6 mb-1">Outstanding Items from Previous Meetings</h3>
          <p class="text-medium-emphasis mb-4">
            Record the problem or concern, the action taken or proposed, and a target date.
            Anything flagged for discussion at the previous meeting is listed here already; flag an item
            again to defer it to the next meeting.
          </p>

          <DiscussionTable v-model="form.outstanding_items" flaggable />
        </template>

        <!-- Guided step 2: New discussion items -->
        <template v-else-if="currentKey === 'new_items'">
          <h3 class="text-h6 mb-1">Open Discussion of New Items and/or New Hazards Identified</h3>
          <p class="text-medium-emphasis mb-4">
            Record the problem or concern, the action taken or proposed, and a target date.
          </p>

          <DiscussionTable v-model="form.new_items" flaggable />
        </template>

        <!-- Guided step 3: Hazard assessments -->
        <template v-else-if="currentKey === 'assessments'">
          <h3 class="text-h6 mb-1">Hazard Assessments</h3>
          <p class="text-medium-emphasis mb-4">
            A completed Hazard Assessment identifies and ranks hazards to dedicate resources for controlling them.
            (Hazard Management Performance Standard)
          </p>

          <div v-for="(row, idx) in form.assessments" :key="idx" class="mb-2">
            <v-row dense align="center">
              <v-col cols="12" :md="row.assessment === 'Other' ? 4 : 8">
                <v-select v-model="row.assessment" :items="ASSESSMENT_OPTIONS" label="Assessment" hide-details />
              </v-col>
              <v-col v-if="row.assessment === 'Other'" cols="12" md="4">
                <v-text-field v-model="row.other_name" label="Hazard assessment name" hide-details />
              </v-col>
              <v-col cols="10" md="3">
                <DateSelector v-model="row.date_completed" label="Date completed" :teleport="true" />
              </v-col>
              <v-col cols="2" md="1" class="text-right">
                <v-btn icon="mdi-close" size="small" variant="tonal" color="error"
                  @click="remove(form.assessments, idx)" />
              </v-col>
            </v-row>
            <FlagForNextMeeting v-model="row.flag_next" />
          </div>
          <v-btn size="small" variant="flat" color="info" prepend-icon="mdi-plus"
            @click="add(form.assessments, { assessment: null, other_name: '', date_completed: null, flag_next: false })">
            Add assessment
          </v-btn>
        </template>

        <!-- Guided step 4: Work refusals -->
        <template v-else-if="currentKey === 'refusals'">
          <h3 class="text-h6 mb-1">Work Refusals</h3>
          <p class="text-medium-emphasis mb-4">
            Workers have the right to refuse work they believe is unsafe. The collaborative process of investigating
            to ensure the work is safe must be completed and documented. (WSCA Division 5, Sections 47–52)
          </p>

          <div v-for="(row, idx) in form.refusals" :key="idx" class="mb-2">
            <v-row dense align="center">
              <v-col cols="12" md="4">
                <v-text-field v-model="row.location" label="Workplace or location" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="row.reason" label="Reason for refusal" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="row.outcome" label="Outcome" hide-details />
              </v-col>
              <v-col cols="12" md="1" class="text-right">
                <v-btn icon="mdi-close" size="small" variant="tonal" color="error" @click="remove(form.refusals, idx)" />
              </v-col>
            </v-row>
            <FlagForNextMeeting v-model="row.flag_next" />
          </div>
          <v-btn size="small" variant="flat" color="info" prepend-icon="mdi-plus"
            @click="add(form.refusals, { location: '', reason: '', outcome: '', flag_next: false })">
            Add work refusal
          </v-btn>
        </template>
      </v-card-text>

      <v-divider />

      <div class="d-flex justify-space-between pa-4">
        <v-btn variant="outlined" color="warning" prepend-icon="mdi-arrow-left" :disabled="step === 1"
          @click="back">Back</v-btn>
        <div>
          <v-btn v-if="step < stepDefs.length" color="primary" :disabled="!canAdvance" @click="next">Next</v-btn>
          <v-btn v-else color="success" :loading="saving" :disabled="!canAdvance" @click="finish">Finish</v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import DiscussionTable from "@/components/committee/CommitteeDiscussionTable.vue";
import DateSelector from "@/components/DateSelector.vue";
import FlagForNextMeeting from "@/components/committee/FlagForNextMeeting.vue";
import { ASSESSMENT_OPTIONS, buildMinutesData, renderMinutesText } from "@/utils/committeeMinutes";
import { useCommitteeMeetingStore } from "@/store/CommitteeMeetingStore";
import { useNotificationStore } from "@/store/NotificationStore";

const route = useRoute();
const router = useRouter();
const store = useCommitteeMeetingStore();
const notify = useNotificationStore();
const { selected: meeting, isLoading } = storeToRefs(store);

const step = ref(1);
const saving = ref(false);
const mode = ref(null); // "upload" | "guided"
const uploadFiles = ref([]);

const form = reactive({
  quorum: null,
  meet_anyway: null,
  // Review questions (real API fields) — asked in the upload path after the minutes are attached.
  no_loss_incidents_reviewed: null,
  loss_incidents_reviewed: null,
  new_hazards_reviewed: null,
  worker_vacancies: null,
  worker_vacancy_count: null,
  // TODO: the sections below aren't on the CommitteeMeeting API model yet — persist once fields exist.
  outstanding_items: [],
  new_items: [],
  assessments: [],
  refusals: [],
});

// Steps are dynamic: the method choice is always first and the review questions
// (incl. quorum) are always last, so the stepper shows 2 steps before a mode is
// picked and inserts the path-specific steps in between afterwards.
const stepDefs = computed(() => {
  const first = { key: "mode", title: "Minutes Method" };
  const review = { key: "review", title: "Review Questions" };
  if (mode.value === "upload") {
    return [first, { key: "upload", title: "Upload Minutes" }, review];
  }
  if (mode.value === "guided") {
    return [
      first,
      { key: "outstanding", title: "Outstanding Items" },
      { key: "new_items", title: "New Items" },
      { key: "assessments", title: "Hazard Assessments" },
      { key: "refusals", title: "Work Refusals" },
      review,
    ];
  }
  return [first, review];
});

const currentKey = computed(() => stepDefs.value[step.value - 1]?.key);

// A value counts as filled if it's a non-blank string or any number (0 included).
function isFilled(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
}

// Empty lists are fine to continue; any added row must have all its fields filled.
function rowsComplete(list) {
  return list.every((row) => Object.values(row).every(isFilled));
}

// "Other" carries a free-text name; every other choice ignores that field.
function assessmentsComplete(list) {
  return list.every(
    (row) =>
      isFilled(row.assessment) &&
      isFilled(row.date_completed) &&
      (row.assessment !== "Other" || isFilled(row.other_name))
  );
}

const canAdvance = computed(() => {
  switch (currentKey.value) {
    case "mode":
      return !!mode.value;
    case "upload":
      return (uploadFiles.value?.length ?? 0) > 0;
    case "outstanding":
      return rowsComplete(form.outstanding_items);
    case "new_items":
      return rowsComplete(form.new_items);
    case "assessments":
      return assessmentsComplete(form.assessments);
    case "refusals":
      return rowsComplete(form.refusals);
    case "review":
      return !!form.quorum && (form.quorum !== "No" || !!form.meet_anyway);
    default:
      return true;
  }
});

// If the mode changes and shrinks the step list, keep the pointer in range.
watch(stepDefs, (defs) => {
  if (step.value > defs.length) step.value = defs.length;
});

function list(rows) {
  return Array.isArray(rows) ? rows.map((r) => ({ ...r })) : [];
}

// Re-entering the wizard on a draft restores what was captured before — otherwise
// Finish would overwrite the saved sections (including carried-forward items) with blanks.
function hydrate(data) {
  if (!data) return false;
  if (data.method === "upload" || data.method === "guided") mode.value = data.method;
  form.outstanding_items = list(data.outstanding_items);
  form.new_items = list(data.new_items);
  form.assessments = list(data.assessments);
  form.refusals = list(data.refusals);
  return true;
}

onMounted(async () => {
  await store.load(route.params.id);

  // A completed meeting is locked — the API rejects edits, so don't offer the wizard.
  if (meeting.value?.status === "Complete") {
    notify.notify({ text: "This meeting is complete and can no longer be edited", variant: "warning" });
    router.replace(`/committee-meetings/${route.params.id}`);
    return;
  }

  form.quorum = meeting.value?.quorum ?? null;
  form.meet_anyway = meeting.value?.meet_anyway ?? null;
  form.no_loss_incidents_reviewed = meeting.value?.no_loss_incidents_reviewed ?? null;
  form.loss_incidents_reviewed = meeting.value?.loss_incidents_reviewed ?? null;
  form.new_hazards_reviewed = meeting.value?.new_hazards_reviewed ?? null;
  form.worker_vacancies = meeting.value?.worker_vacancies ?? null;
  form.worker_vacancy_count = meeting.value?.worker_vacancy_count ?? null;

  // First pass through a meeting: seed Outstanding Items from whatever the committee
  // flagged last time. After that the saved minutes are the source of truth.
  if (!hydrate(meeting.value?.minutes_data) && meeting.value?.committee_id) {
    form.outstanding_items = await store.loadCarryForwardItems(
      meeting.value.committee_id,
      String(meeting.value.meeting_date).slice(0, 10)
    );
  }
});

// A number input hands back a string; the API only accepts a non-negative integer or null.
function normalizeCount(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function formatDate(d) {
  if (!d) return "";
  return DateTime.fromISO(d).toFormat("DDD");
}

function add(list, template) {
  list.push({ ...template });
}

function remove(list, idx) {
  list.splice(idx, 1);
}

function back() {
  if (step.value > 1) step.value -= 1;
}

function next() {
  if (step.value < stepDefs.value.length) step.value += 1;
}

async function finish() {
  saving.value = true;
  try {
    if (mode.value === "upload" && uploadFiles.value?.length) {
      const files = Array.isArray(uploadFiles.value) ? uploadFiles.value : [uploadFiles.value];
      await store.uploadFiles(meeting.value.id, files);
    }

    // The full wizard payload is the source of truth (minutes_data); the quorum and
    // review answers are also written to their typed columns for existing UI/reporting,
    // and a plain-text rendering seeds the editable minutes box.
    const minutesData = buildMinutesData(form, mode.value);
    const minutes = renderMinutesText(minutesData, meeting.value);
    await store.save(meeting.value.id, {
      minutes,
      minutes_data: minutesData,
      quorum: form.quorum,
      meet_anyway: form.meet_anyway,
      no_loss_incidents_reviewed: normalizeCount(form.no_loss_incidents_reviewed),
      loss_incidents_reviewed: normalizeCount(form.loss_incidents_reviewed),
      new_hazards_reviewed: normalizeCount(form.new_hazards_reviewed),
      worker_vacancies: form.worker_vacancies,
      worker_vacancy_count: form.worker_vacancies === "Yes" ? normalizeCount(form.worker_vacancy_count) : null,
    });
    notify.notify({ text: "Meeting setup saved", variant: "success" });
    router.push(`/committee-meetings/${meeting.value.id}`);
  } finally {
    saving.value = false;
  }
}
</script>
