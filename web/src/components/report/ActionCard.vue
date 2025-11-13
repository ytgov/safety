<template>
  <v-card class="default mb-5">
    <v-card-text>
      <v-btn to="/actions" class="my-0 float-right text-subtitle-2" color="primary" size="small" variant="text"
        >All Actions</v-btn
      >
      <h4 class="text-h5">My Open Actions</h4>
      <p class="mb-3">Unresolved actions assigned to me</p>

      <v-list
        v-if="actions && actions.length > 0"
        bg-color="#fff"
        class="py-0 limit-card-height-400"
        style="border: 1px #aaa solid"
        rounded>
        <div v-for="(action, idx) of actions">
          <v-list-item
            :title="makeTitle(action)"
            :subtitle="makeSubtitle(action)"
            class="pt-1 pb-2"
            @click="openActionClick(action)">
            <template #prepend>
              <v-avatar size="small" class="mx-n2">
                <v-icon v-if="action.status_code == 'Open'" color="warning" size="26">mdi-alert-circle-outline</v-icon>
                <v-icon v-else color="green" size="26">mdi-circle-outline</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
          <v-divider v-if="idx < actions.length - 1" />
        </div>
      </v-list>

      <div v-else>
        <v-divider class="mb-4" />

        You have no pending actions
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { Action, useActionStore } from "@/store/ActionStore";

const router = useRouter();

const actionStore = useActionStore();
const { loadActions } = actionStore;
const { actions } = storeToRefs(actionStore);

loadActions({ page: 1, perPage: 15, search: null, review: null, status: "Dashboard" });

function makeTitle(input: Action) {
  return `${input.incident_identifier ? input.incident_identifier + " : " : ""}${input.description}`;
}

function makeSubtitle(input: Action) {
  return `Created: ${DateTime.fromISO(input.created_at?.toString()).toRelative()}, Status: ${input.status_code}`;
}

function openActionClick(input: Action) {
  if (input.incident_type_id == 6) {
    router.push(`/inspections/${input.incident_slug}?action=${input.slug}`);
    return;
  }
  router.push(`/reports/${input.incident_slug}?action=${input.slug}`);
}
</script>
