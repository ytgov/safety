<template>
  <v-label v-if="linkedUsers.length > 0">Additional linked users</v-label>

  <v-list
    v-if="linkedUsers.length > 0"
    density="compact"
    class="py-0"
    :class="{ 'mb-5': !editable }"
    style="border: 1px #999 solid; border-radius: 4px">
    <v-list-item
      v-for="(user, idx) in linkedUsers"
      :key="user.id"
      :style="{ borderBottom: idx < linkedUsers.length - 1 ? '1px #999 solid' : 'none' }"
      :title="user.user_email"
      :subtitle="`Access: ${makeTitleCase(user.reason)}`"
      class="py-3">
      <template #append>
        <v-btn
          v-if="editable"
          color="error"
          class="my-0"
          size="x-small"
          variant="text"
          @click="removeLinkedUserClick(user)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-list-item>
  </v-list>

  <DirectorySelector
    v-if="editable"
    ref="directorySelector"
    label="Add a linked user"
    @selected="addLinkedUserClick"
    :class="{ 'mt-4': linkedUsers.length > 0 }" />
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";

import { useReportStore } from "@/store/ReportStore";
import DirectorySelector from "../DirectorySelector.vue";
import { useNotificationStore } from "@/store/NotificationStore";

const props = defineProps(["incident_id", "editable"]);

const directorySelector = ref(null);
const reportStrore = useReportStore();

const notificationStore = useNotificationStore();
const { notify } = notificationStore;

const { loadLinkedUsers, addLinkedUser, removeLinkedUser } = reportStrore;
const { linkedUsers } = storeToRefs(reportStrore);

loadLinkedUsers(props.incident_id);

function addLinkedUserClick(user) {
  if (user) {
    addLinkedUser({ user_email: user.email, incident_id: props.incident_id, reason: "supervisor" });

    notify({
      text: "Linked user added",
      variant: "success",
    });

    directorySelector.value.clear();
  }
}

function removeLinkedUserClick(user) {
  removeLinkedUser(user);

  notify({
    text: "Linked user removed",
    variant: "success",
  });
}

function makeTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
</script>
