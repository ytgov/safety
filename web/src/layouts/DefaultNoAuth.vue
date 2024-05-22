<template>
  <v-app-bar app color="#fff" flat height="70" style="left: 0; border-bottom: 3px #f3b228 solid">
    <img src="/yukon.svg" style="margin: -10px 85px 0 14px" height="44" />
    <!-- <v-img class="ml-0m pl-0" src="src/assets/yukon.svg" height="44" /> -->
    <v-app-bar-title class="pt-0 font-weight-bold" style="margin-left: -20px">{{ title }}</v-app-bar-title>

    <template v-slot:append></template>
  </v-app-bar>

  <v-main>
    <!-- Provides the application the proper gutter -->
    <!-- fill-height causes the main content to fill the entire page -->
    <v-container fluid class="page-wrapper">
      <router-view></router-view>
    </v-container>
  </v-main>

  <v-overlay v-model="showOverlay" class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate size="64" class="mb-5" color="#f3b228" width="6"></v-progress-circular>
      <h2>Loading {{ title }}</h2>
    </div>
  </v-overlay>
</template>

<script lang="ts">
export default {
  name: "DefaultNoAuth",

  data() {
    return {
      showOverlay: true,
    };
  },
  computed: {
    title() {
      return "Polus Surveys";
    },
  },

  async mounted() {
    this.showOverlay = false;
  },
  methods: {},
};
</script>

<style scoped>
.v-list-item__prepend > .v-icon {
  margin-inline-end: 12px;
}
</style>
