<template>
  <div class="minutes-doc">
    <!-- Quorum & Review — for uploads, or whenever review numbers were recorded -->
    <template v-if="showReview">
      <h4 class="section">Quorum &amp; Review Questions</h4>
      <table class="grid">
        <tbody>
        <tr>
          <th>Did you meet quorum?</th>
          <td>{{ val(meeting.quorum) }}</td>
        </tr>
        <tr v-if="meeting.quorum === 'No'">
          <th>Did you meet anyway for informational purposes?</th>
          <td>{{ val(meeting.meet_anyway) }}</td>
        </tr>
        <tr>
          <th>No loss (near miss) incidents reviewed</th>
          <td>{{ val(meeting.no_loss_incidents_reviewed) }}</td>
        </tr>
        <tr>
          <th>Loss incidents reviewed</th>
          <td>{{ val(meeting.loss_incidents_reviewed) }}</td>
        </tr>
        <tr>
          <th>New hazards reviewed</th>
          <td>{{ val(meeting.new_hazards_reviewed) }}</td>
        </tr>
        <tr>
          <th>Worker member vacancies (per ROP)?</th>
          <td>{{ val(meeting.worker_vacancies) }}</td>
        </tr>
        <tr v-if="meeting.worker_vacancies === 'Yes'">
          <th>Number of worker vacancies</th>
          <td>{{ val(meeting.worker_vacancy_count) }}</td>
        </tr>
      </tbody>
      </table>
    </template>

    <p v-if="data.method === 'upload'" class="text-medium-emphasis mt-4">
      Minutes were attached as an uploaded document.
    </p>

    <template v-if="data.method !== 'upload'">
      <!-- Discussion Items -->
      <h4 class="section">Discussion Items</h4>
      <table class="grid">
        <thead>
          <tr>
            <th>Problem or Concern</th>
            <th>Action Taken or Proposed</th>
            <th class="narrow">Target Date</th>
          </tr>
        </thead>
        <tbody>
          <tr class="band">
            <td colspan="3">Outstanding Items from Previous Meetings</td>
          </tr>
          <tr v-for="(r, i) in data.outstanding_items || []" :key="'o' + i">
            <td>{{ val(r.concern) }}</td>
            <td>{{ val(r.action) }}</td>
            <td>{{ fmtDate(r.target_date) }}</td>
          </tr>
          <tr v-if="!(data.outstanding_items || []).length">
            <td colspan="3" class="empty">None recorded.</td>
          </tr>

          <tr class="band">
            <td colspan="3">Open Discussion of New Items</td>
          </tr>
          <tr v-for="(r, i) in data.new_items || []" :key="'n' + i">
            <td>{{ val(r.concern) }}</td>
            <td>{{ val(r.action) }}</td>
            <td>{{ fmtDate(r.target_date) }}</td>
          </tr>
          <tr v-if="!(data.new_items || []).length">
            <td colspan="3" class="empty">None recorded.</td>
          </tr>
        </tbody>
      </table>

      <!-- Hazards Identified -->
      <h4 class="section">Hazards Identified</h4>
      <table class="grid">
        <thead>
          <tr>
            <th>Hazards Identified</th>
            <th class="narrow">Number Controlled at Source</th>
            <th class="narrow">Number Recommended to Management</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in data.hazards || []" :key="'h' + i">
            <td>{{ val(r.hazard) }}</td>
            <td>{{ val(r.controlled_at_source) }}</td>
            <td>{{ val(r.recommended_to_management) }}</td>
          </tr>
          <tr v-if="!(data.hazards || []).length">
            <td colspan="3" class="empty">None recorded.</td>
          </tr>
        </tbody>
      </table>

      <!-- Hazard Assessments -->
      <h4 class="section">Hazard Assessments</h4>
      <table class="grid">
        <thead>
          <tr>
            <th>Assessments in Progress</th>
            <th>Assessments Completed</th>
            <th>Hazards Identified</th>
            <th>Controls Implemented</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ val(assessments.in_progress) }}</td>
            <td>{{ val(assessments.completed) }}</td>
            <td>{{ val(assessments.hazards_identified) }}</td>
            <td>{{ val(assessments.controls_implemented) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Work Refusals -->
      <h4 class="section">Work Refusals</h4>
      <table class="grid">
        <thead>
          <tr>
            <th>Workplace or Location</th>
            <th>Reason for refusal</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in data.refusals || []" :key="'r' + i">
            <td>{{ val(r.location) }}</td>
            <td>{{ val(r.reason) }}</td>
            <td>{{ val(r.outcome) }}</td>
          </tr>
          <tr v-if="!(data.refusals || []).length">
            <td colspan="3" class="empty">None recorded.</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DateTime } from "luxon";

const props = defineProps({
  meeting: { type: Object, required: true },
});

const data = computed(() => props.meeting.minutes_data || {});
const assessments = computed(() => data.value.assessments || {});

// Review numbers can be filled via the upload step or the results-page card on any
// meeting, so surface the block on value rather than gating behind the method.
const hasReviewNumbers = computed(() =>
  [
    props.meeting.no_loss_incidents_reviewed,
    props.meeting.loss_incidents_reviewed,
    props.meeting.new_hazards_reviewed,
    props.meeting.worker_vacancies,
    props.meeting.worker_vacancy_count,
  ].some((v) => v !== null && v !== undefined && v !== "")
);

const showReview = computed(() => data.value.method === "upload" || hasReviewNumbers.value);

function val(v) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = DateTime.fromISO(d);
  return dt.isValid ? dt.toFormat("DD") : String(d);
}
</script>

<style scoped>
.minutes-doc {
  font-size: 13px;
}
.section {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 6px;
}
.grid {
  width: 100%;
  border-collapse: collapse;
}
.grid th,
.grid td {
  border: 1px solid #999;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}
.grid thead th {
  background: #eee;
  font-weight: 600;
}
.grid tr.band td {
  background: #d9d9d9;
  font-weight: 600;
  text-align: left;
}
.grid td.empty {
  color: #888;
  font-style: italic;
}
.grid th.narrow,
.grid td.narrow {
  width: 22%;
}
</style>
