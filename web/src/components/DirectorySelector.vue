<template>
  <div>
    <v-label class="mb-1">{{ props.label }}</v-label>
    <div v-if="selectedPerson">
      <v-text-field
        :value="selectedPerson.long_name"
        readonly
        append-inner-icon="mdi-close"
        @click:append-inner="clear" />
    </div>
    <div v-else>
      <v-autocomplete
        v-model="model"
        v-model:search="search"
        :items="items"
        :loading="isLoading"
        item-value="id"
        item-title="long_name"
        append-icon="mdi-magnify"
        auto-select-first
        no-filter
        outlined
        dense
        clearable
        return-object>
        <template #no-data>
          <div class="mx-4 text-caption">
            <strong>No matches found?</strong>
            This search matches the beginning of names and titles only
          </div>
        </template>
      </v-autocomplete>

      <v-card class="default mb-4 d-none" v-if="model && model.display_name">
        <v-card-text>
          <v-row>
            <v-col cols="9">
              <strong>Name:</strong> {{ model.display_name }} ({{ model.ynet_id }})<br />
              <strong>Department:</strong> {{ model.department }} : {{ model.title }}<br />
              <strong>Email:</strong> {{ model.email }} <br />
              <strong>Location:</strong> {{ model.officeLocation }}
            </v-col>
            <v-col class="text-right">
              <v-btn @click="doSelect" color="primary" class="mb-0" small>
                <v-icon class="mr-2">mdi-account-check</v-icon>
                actionName
              </v-btn>
              <v-btn @click="clear" color="secondary" class="ml-4 mb-0 mt-4" small>Clear</v-btn></v-col
            >
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDirectoryStore } from "@/store/DirectoryStore";
import { ref, watch } from "vue";

const props = defineProps(["label"]);

const emit = defineEmits(["selected"]);

const directoryStore = useDirectoryStore();
const { searchDirectory } = directoryStore;

const isLoading = ref(false);
const items = ref([] as any[]);
const search = ref("");

const model = ref(null as any);
const searchIndex = ref(1);

const timerId = ref(null as any);

const selectedPerson = ref(null as any);

watch(search, async (nv) => {
  if (!nv) {
    items.value = [];
    return;
  }

  isLoading.value = false;

  doDirectorySearch(nv);
});

watch(model, async (nv) => {
  if (!nv) {
    doSelect();
    return;
  }

  doSelect();
});
async function doDirectorySearch(val: string) {
  clearTimeout(timerId.value);

  // delay new call 500ms
  timerId.value = setTimeout(() => {
    if (!val) {
      items.value = [];
      return;
    }

    if (val.length < 3) return;

    if (isLoading.value) return;
    isLoading.value = true;

    searchDirectory({ terms: val })
      .then((res) => {
        items.value = res;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => (isLoading.value = false));
  }, 500);
}

function clear() {
  model.value = null;
  search.value = "";
  selectedPerson.value = null;
}

function doSelect() {
  selectedPerson.value = model.value;
  emit("selected", model.value);
}
</script>
