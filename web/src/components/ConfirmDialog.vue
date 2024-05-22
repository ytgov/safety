<template>
  <v-dialog v-model="dialogModel" persistent max-width="500px">
    <v-card>
      <v-card-item class="py-4 px-6 text-white bg-primary">
        <div class="d-flex">
          <h4 class="text-h6">{{ title }}</h4>
          <v-spacer />
          <v-icon @click="doDeny" icon="mdi-close" size="small" class="my-auto" />
        </div>
      </v-card-item>
      <v-card-text>
        {{ message }}
        <v-divider class="mt-2" />
      </v-card-text>
      <v-card-actions class="mb-2 mx-3">
        <v-btn color="primary" variant="flat" v-if="showConfirm" @click="doConfirm()">Confirm</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="warning" variant="tonal" @click="doDeny()">{{ messageButton }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    title: "",
    message: "",
    dialogModel: null,
    confirmCallback: null,
    denyCallback: null,
    showConfirm: true,
    messageButton: "Cancel",
  }),
  methods: {
    show(title, message, confirmCallback, denyCallback, showConfirm = true, messageButton = "Cancel") {
      this.title = title;
      this.message = message;
      this.confirmCallback = confirmCallback;
      this.denyCallback = denyCallback;
      this.showConfirm = showConfirm;
      this.messageButton = messageButton;
      this.dialogModel = true;
    },

    doConfirm() {
      this.confirmCallback();
      this.dialogModel = null;
    },
    doDeny() {
      this.denyCallback();
      this.dialogModel = null;
    },
  },
};
</script>
