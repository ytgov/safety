<template>
  <div>
    <v-label>{{ props.label }}</v-label>
    <div v-if="selectedPerson">
      <v-text-field
        :value="selectedPerson.long_name"
        readonly
        hide-details
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
        hide-details
        return-object>
        <template #no-data>
          <div class="mx-4 text-caption">
            <strong>No matches found?</strong>
            This search matches the beginning of names and titles only
          </div>
        </template>
      </v-autocomplete>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDirectoryStore } from "@/store/DirectoryStore";

const props = defineProps(["label"]);
const emit = defineEmits(["selected"]);
defineExpose({ setModel });

const directoryStore = useDirectoryStore();
const { searchActionDirectory, searchActionDirectoryEmail } = directoryStore;

const isLoading = ref(false);
const items = ref([] as any[]);
const search = ref("");

const model = ref(null as any);
const searchIndex = ref(1);

const timerId = ref(null as any);

const selectedPerson = ref(null as any);

await doDirectorySearch("");

watch(search, async (nv) => {
  isLoading.value = false;
  doDirectorySearch(nv);
});

watch(model, async (nv) => {
  if (!nv) {
    return;
  }

  doSelect();
});
async function doDirectorySearch(val: string) {
  clearTimeout(timerId.value);

  // delay new call 50ms
  timerId.value = setTimeout(() => {
    val = val ?? "";
    isLoading.value = true;

    searchActionDirectory({ terms: val, showRoles: false })
      .then((res) => {
        items.value = res;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }, 50);
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

function setModel(email: string, otherActor: object) {
  if (email) {
    searchActionDirectoryEmail({ terms: email, showRoles: false })
      .then((res) => {
        selectedPerson.value = res[0];
        //model.value = res[0];
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  } else {
    selectedPerson.value = otherActor;
  }
}
</script>
