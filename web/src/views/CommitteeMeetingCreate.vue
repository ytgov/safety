<template>
  <v-breadcrumbs :items="[
    { title: 'Home', to: '/' },
    { title: 'Committee Meetings', to: '/committee-meetings' },
    { title: 'Start Meeting' },
  ]" />

  <h1 class="text-h4 mb-4">Start a Committee Meeting</h1>

  <v-card class="default">
    <v-card-text class="pt-5">
      <v-row>
        <v-col cols="12" md="6">
          <h3 class="text-h6 mb-4">Meeting Details</h3>
          <v-row>
            <v-col cols="12" md="12">
              <v-select v-model="meeting.committee_id" :items="committees" item-title="name" item-value="id"
                label="Committee" :loading="committeesLoading" />

              <DateSelector v-model="meeting.meeting_date" label="Date" class="mb-5" />

              <CommitteeMeetingReviewQuestions v-model="meeting" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="6">
          <h3 class="text-h6 mb-4">Please record who is present for this meeting.</h3>


          <h4 class="text-h7 mb-4">Co-Chairs</h4>

          <v-list v-if="meeting.cochairs.length > 0" density="compact" class="py-0 mb-3"
            style="border: 1px #999 solid; border-radius: 4px">
            <v-list-item v-for="(c, idx) in meeting.cochairs" :key="idx"
              :style="{ borderBottom: idx < meeting.cochairs.length - 1 ? '1px #999 solid' : 'none' }"
              :title="c.display_name || c.email" :subtitle="c.display_name ? c.email : ''" class="py-3">
              <template #append>
                <v-btn color="error" class="my-0" size="x-small" variant="text" @click="removeCochair(idx)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <DirectorySelector ref="dirRef" label="Add a co-chair" @selected="onDirectorySelected" />

          <v-divider class="my-5" />

          <h3 class="text-h6 mb-4">Members</h3>

          <v-list v-if="meeting.members.length > 0" density="compact" class="py-0 mb-3"
            style="border: 1px #999 solid; border-radius: 4px">
            <v-list-item v-for="(m, idx) in meeting.members" :key="idx"
              :style="{ borderBottom: idx < meeting.members.length - 1 ? '1px #999 solid' : 'none' }"
              :title="m.display_name || m.email" :subtitle="m.display_name ? m.email : ''" class="py-3">
              <template #append>
                <v-btn color="error" class="my-0" size="x-small" variant="text" @click="removeMember(idx)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <DirectorySelector ref="memberRef" label="Add a member" @selected="onMemberSelected" />
        </v-col>
      </v-row>
      <v-divider class="my-4" />

      <div class="d-flex justify-end">
        <v-btn class="mr-2" color="warning" variant="text" to="/committee-meetings">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="!canCreate" @click="create">
          Create &amp; Continue to Minutes
        </v-btn>
      </div>


    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import DirectorySelector from "@/components/DirectorySelector.vue";
import DateSelector from "@/components/DateSelector.vue";
import CommitteeMeetingReviewQuestions from "@/components/committee/CommitteeMeetingReviewQuestions.vue";

import { useCommitteeStore } from "@/store/CommitteeStore";
import { useCommitteeMeetingStore } from "@/store/CommitteeMeetingStore";
import { useNotificationStore } from "@/store/NotificationStore";

const router = useRouter();
const committeeStore = useCommitteeStore();
const meetingStore = useCommitteeMeetingStore();
const notify = useNotificationStore();

const { committees, isLoading: committeesLoading } = storeToRefs(committeeStore);

const saving = ref(false);
const dirRef = ref(null);
const memberRef = ref(null);

const meeting = ref({
  committee_id: null,
  meeting_date: new Date().toISOString().slice(0, 10),
  quorum: null,
  meet_anyway: null,
  no_loss_incidents_reviewed: null,
  loss_incidents_reviewed: null,
  new_hazards_reviewed: null,
  worker_vacancies: null,
  worker_vacancy_count: null,
  cochairs: [],
  members: [],
});

const canCreate = computed(
  () => meeting.value.committee_id && meeting.value.meeting_date && meeting.value.cochairs.length > 0
);

onMounted(() => committeeStore.loadCommittees());

watch(
  () => meeting.value.committee_id,
  async (id) => {
    if (!id) {
      meeting.value.cochairs = [];
      meeting.value.members = [];
      return;
    }
    const { cochairs, members } = await meetingStore.loadPreviousAttendees(id);
    const mapPerson = (p) => ({
      user_id: p.user_id ?? null,
      email: p.email,
      display_name: p.display_name ?? null,
    });
    meeting.value.cochairs = cochairs.map(mapPerson);
    meeting.value.members = members.map(mapPerson);
  }
);

function onDirectorySelected(person) {
  if (!person || !person.email) return;
  if (meeting.value.cochairs.some((c) => c.email === person.email)) return;
  meeting.value.cochairs.push({
    user_id: null,
    email: person.email,
    display_name: person.display_name || person.long_name || null,
  });
  if (dirRef.value && dirRef.value.clear) dirRef.value.clear();
}

function removeCochair(idx) {
  meeting.value.cochairs.splice(idx, 1);
}

function onMemberSelected(person) {
  if (!person || !person.email) return;
  if (meeting.value.members.some((m) => m.email === person.email)) return;
  meeting.value.members.push({
    user_id: null,
    email: person.email,
    display_name: person.display_name || person.long_name || null,
  });
  if (memberRef.value && memberRef.value.clear) memberRef.value.clear();
}

function removeMember(idx) {
  meeting.value.members.splice(idx, 1);
}

async function create() {
  if (!canCreate.value) return;
  saving.value = true;
  try {
    const result = await meetingStore.create(meeting.value);
    if (result?.id) {
      notify.notify({ text: "Meeting created", variant: "success" });
      router.push(`/committee-meetings/${result.id}`);
    }
  } finally {
    saving.value = false;
  }
}
</script>
