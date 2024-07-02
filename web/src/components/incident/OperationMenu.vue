<template>
  <v-menu transition="slide-y-transition">
    <template v-slot:activator="{ props }">
      <v-btn color="info" v-bind="props" class="my-0"><v-icon class="mr-2">mdi-chevron-down</v-icon> Operations</v-btn>
    </template>

    <v-list>
      <v-list-item title="Investigation Completed">
        <template #prepend>
          <v-icon color="green">mdi-check</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts"></script>
