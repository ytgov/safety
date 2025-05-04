<template>
  <div>
    <v-btn color="primary" variant="flat" size="small" class="mr-5" @click="doShow">Add Committee</v-btn>

    <v-dialog v-model="showEdit" width="700px" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-toolbar color="primary" density="comfortable">
            <v-toolbar-title class="text-white" style="">Add Committee</v-toolbar-title>
            <v-spacer> </v-spacer>
            <v-toolbar-items>
              <v-btn icon="mdi-close" @click="doClose"></v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-text class="pt-5">
            <v-text-field v-model="chosenOne.name" dense outlined label="Name" />
            <DepartmentSelector v-model="chosenOne.department_code" label="Department" />

            <v-btn
              color="primary"
              class="my-0"
              @click="doAdd"
              :disabled="isNil(chosenOne.name) || isNil(chosenOne.department_code)"
              >Add
            </v-btn>
          </v-card-text>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mapActions } from "pinia";
import { Committee, useCommitteeAdminStore } from "../store";
import * as _ from "lodash";
import DepartmentSelector from "@/components/DepartmentSelector.vue";

export default {
  props: ["onComplete", "onError"],
  data: () => ({
    showEdit: false,
    chosenOne: {} as Committee | Partial<Committee>,
  }),
  methods: {
    ...mapActions(useCommitteeAdminStore, ["addCommittee"]),
    doShow() {
      this.showEdit = true;
      this.chosenOne = {};
    },
    doClose() {
      this.showEdit = false;
      this.chosenOne = {};
    },
    doSelect(person: any) {
      this.chosenOne = person;
    },
    doAdd() {
      this.addCommittee(this.chosenOne)
        .then((resp: any) => {
          if (resp && resp.error) {
            if (this.onError) this.onError(resp.error[0]);

            this.chosenOne = {};
            return;
          }

          console.log("AddCommittee", resp);

          return this.$router.push(`/administration/committees/${resp.id}`);
        })
        .catch((resp) => {
          console.log("Error in AddCommittee", resp);
        });
    },
    isNil(val: any) {
      return _.isNil(val);
    },
  },
};
</script>
