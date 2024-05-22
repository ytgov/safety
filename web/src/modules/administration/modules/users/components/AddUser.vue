<template>
  <div>
    <v-btn color="primary" variant="tonal" size="small" class="mr-5" @click="doShow">Add User</v-btn>

    <v-dialog v-model="showEdit" width="700px" transition="dialog-bottom-transition" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-toolbar color="info" density="comfortable">
            <v-toolbar-title class="text-white" style="">Add User</v-toolbar-title>
            <v-spacer> </v-spacer>
            <v-toolbar-items>
              <v-btn icon="mdi-close" @click="doClose"></v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <!--  <v-app-bar color="info" dark>
          
          </v-app-bar> -->
          <v-card-text class="pt-5">
            <employee-lookup label="" actionName="Select" :select="doSelect" v-if="!chosenOne.email"></employee-lookup>

            <v-text-field
              v-model="chosenOne.display_name"
              readonly
              dense
              outlined
              label="Selected user"
              append-icon="mdi-lock"
              v-if="chosenOne.email"
              append-outer-icon="mdi-close-circle"
              @click:append-outer="doSelect({})"></v-text-field>

            <v-btn color="primary" class="mt-0 mb-3" @click="doAdd" :disabled="!chosenOne.email">Add </v-btn>
          </v-card-text>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mapActions } from "pinia";
import EmployeeLookup from "./EmployeeLookup.vue";
import { useUserAdminStore } from "../store";

export default {
  components: { EmployeeLookup },
  name: "AddEmployee",
  props: ["onComplete", "onError"],
  data: () => ({
    showEdit: false,
    chosenOne: {} as any,
  }),
  methods: {
    ...mapActions(useUserAdminStore, ["addUser"]),
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
      this.addUser(this.chosenOne).then((resp: any) => {
        if (resp && resp.error) {
          if (this.onError) this.onError(resp.error[0]);

          this.chosenOne = {};
          return;
        }

        if (this.onComplete) this.onComplete();

        this.doClose();
      });
    },
  },
};
</script>
