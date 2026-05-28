<template>
  <v-breadcrumbs :items="[
    { title: 'Home', to: '/' },
    { title: 'Committee Meetings', to: '/committee-meetings' },
    { title: 'Minutes' },
  ]" />

  <div v-if="!meeting && isLoading" class="text-center py-12">
    <v-progress-circular indeterminate />
  </div>

  <div v-else-if="meeting">
    <div class="d-flex align-center mb-1">
      <h1 class="text-h4">{{ meeting.committee_name }} – Meeting Minutes</h1>
      <v-chip v-if="isComplete" class="ml-3" color="success" size="small" prepend-icon="mdi-lock">Complete</v-chip>
    </div>
    <p class="text-body-1 text-medium-emphasis mb-4">
      <strong>{{ formatDate(meeting.meeting_date) }}</strong>
      &middot; Co-Chairs: {{ formatCochairs(meeting.cochairs) }}
    </p>

    <v-row dense>
      <v-col cols="12" md="8" class="d-flex">
        <v-card class="default" style="width: 100%">
          <v-card-item class="py-3 px-5 bg-sun">
            <h4 class="text-h6">Type Minutes</h4>
          </v-card-item>
          <v-card-text class="pt-5">
            <v-textarea v-model="minutesText" rows="20" auto-grow placeholder="Type meeting minutes here..."
              hide-details :readonly="isComplete" />
            <div v-if="!isComplete" class="d-flex justify-end">
              <v-btn color="primary" :loading="savingText" @click="saveText">Save Minutes</v-btn>
            </div>
          </v-card-text>
        </v-card>

        <div class="text-center ml-2 pt-4" style="width: 30px">or</div>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="default">
          <v-card-item class="py-3 px-5 bg-sun">
            <h4 class="text-h6">Upload Minutes File</h4>
          </v-card-item>
          <v-card-text class="pt-5">
            <template v-if="!isComplete">
              <v-file-input v-model="newFile" label="Choose file" prepend-icon="" prepend-inner-icon="mdi-paperclip"
                show-size clearable hide-details />

              <div class="d-flex justify-end">
                <v-btn color="primary" :loading="uploading" :disabled="!newFile" @click="uploadFile">Upload</v-btn>
              </div>
            </template>

            <div v-if="meeting.minutes_file_name" class="">
              <v-icon class="mr-2">mdi-file-document</v-icon>
              <a href="#" @click.prevent="downloadFile">{{ meeting.minutes_file_name }}</a>
              <v-btn v-if="!isComplete" class="ml-4" icon="mdi-delete" size="small" variant="text" color="red"
                @click="removeFile" />
            </div>
          </v-card-text>
        </v-card>

        <div class="d-flex justify-end mt-3 ga-2">
          <v-btn v-if="canMarkComplete && !isComplete" color="success" variant="flat" prepend-icon="mdi-lock"
            :loading="updatingStatus" @click="confirmComplete = true">
            Mark Complete
          </v-btn>
          <v-btn v-if="isSystemAdmin && isComplete" color="warning" variant="outlined" prepend-icon="mdi-lock-open"
            :loading="updatingStatus" @click="reopenMeeting">
            Reopen
          </v-btn>
          <v-btn v-if="isSystemAdmin" color="red" variant="outlined" prepend-icon="mdi-delete" :loading="deleting"
            @click="deleteMeeting">
            Delete Meeting
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>

  <v-dialog v-model="confirmComplete" width="500px" persistent @keydown.esc="confirmComplete = false">
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title class="text-white">Mark Meeting Complete</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="confirmComplete = false" />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-5">
        <p class="mb-2">Once complete, the minutes and attached file are locked and can no longer be edited.</p>
        <p>Only a System Admin can reopen the meeting.</p>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="confirmComplete = false">Cancel</v-btn>
        <v-btn color="success" :loading="updatingStatus" @click="markComplete">Mark Complete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="confirmDelete" width="500px" persistent @keydown.esc="confirmDelete = false">
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title class="text-white">Delete Meeting</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="confirmDelete = false" />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-5">
        This will permanently remove the meeting, its minutes, and any attached file.
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
        <v-btn color="red" :loading="deleting" @click="performDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { DateTime } from "luxon";

import { useCommitteeMeetingStore } from "@/store/CommitteeMeetingStore";
import { useNotificationStore } from "@/store/NotificationStore";
import { useUserStore } from "@/store/UserStore";
import { useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const store = useCommitteeMeetingStore();
const notify = useNotificationStore();
const userStore = useUserStore();
const { selected: meeting, isLoading } = storeToRefs(store);
const { isSystemAdmin, user: currentUser } = storeToRefs(userStore);

const minutesText = ref("");
const newFile = ref(null);
const savingText = ref(false);
const uploading = ref(false);
const deleting = ref(false);
const confirmDelete = ref(false);
const updatingStatus = ref(false);
const confirmComplete = ref(false);

const isComplete = computed(() => meeting.value?.status === "Complete");

const isCurrentUserCochair = computed(() => {
  const u = currentUser.value;
  const list = meeting.value?.cochairs || [];
  if (!u || list.length === 0) return false;
  const email = (u.email || "").toLowerCase();
  return list.some((c) => (c.user_id && c.user_id === u.id) || (c.email && c.email.toLowerCase() === email));
});

const canMarkComplete = computed(() => isSystemAdmin.value || isCurrentUserCochair.value);

onMounted(load);

async function downloadFile() {
  if (!meeting.value) return;
  await store.downloadMinutesFile(meeting.value.id, meeting.value.minutes_file_name);
}

async function load() {
  await store.load(route.params.id);
  minutesText.value = meeting.value?.minutes || "";
}

watch(meeting, (m) => {
  if (m && minutesText.value === "") minutesText.value = m.minutes || "";
});

function formatDate(d) {
  if (!d) return "";
  return DateTime.fromISO(d).toFormat("DDD");
}

function formatCochairs(list) {
  if (!list || list.length === 0) return "None";
  return list.map((c) => c.display_name || c.email).join(", ");
}

async function saveText() {
  if (!meeting.value) return;
  savingText.value = true;
  try {
    await store.save(meeting.value.id, { minutes: minutesText.value });
    notify.notify({ text: "Minutes saved", variant: "success" });
  } finally {
    savingText.value = false;
  }
}

async function uploadFile() {
  if (!meeting.value || !newFile.value) return;
  const file = Array.isArray(newFile.value) ? newFile.value[0] : newFile.value;
  uploading.value = true;
  try {
    await store.uploadMinutesFile(meeting.value.id, file);
    newFile.value = null;
    notify.notify({ text: "File uploaded", variant: "success" });
    await load();
  } finally {
    uploading.value = false;
  }
}

async function removeFile() {
  if (!meeting.value) return;
  await store.deleteMinutesFile(meeting.value.id);
  notify.notify({ text: "File removed", variant: "success" });
  await load();
}

function deleteMeeting() {
  confirmDelete.value = true;
}

async function markComplete() {
  if (!meeting.value) return;
  updatingStatus.value = true;
  try {
    await store.setStatus(meeting.value.id, "Complete");
    notify.notify({ text: "Meeting marked complete", variant: "success" });
    confirmComplete.value = false;
    await load();
  } finally {
    updatingStatus.value = false;
  }
}

async function reopenMeeting() {
  if (!meeting.value) return;
  updatingStatus.value = true;
  try {
    await store.setStatus(meeting.value.id, "Draft");
    notify.notify({ text: "Meeting reopened", variant: "success" });
    await load();
  } finally {
    updatingStatus.value = false;
  }
}

async function performDelete() {
  if (!meeting.value) return;
  deleting.value = true;
  try {
    await store.remove(meeting.value.id);
    notify.notify({ text: "Meeting deleted", variant: "success" });
    confirmDelete.value = false;
    router.push("/committee-meetings");
  } finally {
    deleting.value = false;
  }
}
</script>
