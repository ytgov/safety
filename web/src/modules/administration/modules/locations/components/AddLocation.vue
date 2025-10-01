<template>
  <div>
    <v-btn color="primary" variant="flat" size="small" class="mr-5" @click="doShow">Add Location</v-btn>

    <v-dialog v-model="showEdit" width="700px" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-toolbar color="primary" density="comfortable">
            <v-toolbar-title class="text-white" style="">Add Location</v-toolbar-title>
            <v-spacer> </v-spacer>
            <v-toolbar-items>
              <v-btn icon="mdi-close" @click="doClose"></v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-text class="pt-5">
            <v-text-field v-model="chosenOne.code" dense outlined label="Code" />
            <v-text-field v-model="chosenOne.name" dense outlined label="Name" />
            <v-text-field v-model="chosenOne.community" dense outlined label="Community" />
            <v-text-field v-model="chosenOne.description" dense outlined label="Description" />

            <v-btn
              color="primary"
              class="my-0"
              @click="doAdd"
              :disabled="isNil(chosenOne.code) || isNil(chosenOne.name)"
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
import { useLocationAdminStore } from "../store";
import * as _ from "lodash";

export default {
  name: "AddLocation",
  props: ["onComplete", "onError"],
  data: () => ({
    showEdit: false,
    chosenOne: {} as any,
  }),
  methods: {
    ...mapActions(useLocationAdminStore, ["addLocation"]),
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
      this.addLocation(this.chosenOne)
        .then((resp: any) => {
          if (resp && resp.error) {
            if (this.onError) this.onError(resp.error[0]);

            this.chosenOne = {};
            return;
          }

          if (this.onComplete) this.onComplete();

          this.doClose();
        })
        .catch((resp) => {
          console.log("Error in AddLocation", resp);
        });
    },
    isNil(val: any) {
      return _.isNil(val);
    },
  },
};
</script>
