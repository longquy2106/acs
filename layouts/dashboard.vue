<template>
  <v-card class="card_style" theme="light">
    <Header />
    <v-main>
      <v-card theme="light" min-height="calc(100vh - 64px)" class="pa-2">
        <slot />
      </v-card>
    </v-main>
  </v-card>
  <Snackbar />
</template>

<script>
import Header from "~/components/Header.vue";
import Snackbar from "~/components/utilities/Snackbar.vue";
export default {
  name: "DashboardLayout",

  components: {
    Header,
    Snackbar,
  },
};
</script>

<style scoped>
</style>