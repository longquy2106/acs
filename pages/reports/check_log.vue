<template>
abc
  <v-card-text>
    <v-navigation-drawer>
      <v-list-item
        title="Kiểm tra lịch sử thao tác"
        subtitle="Check Log"
      ></v-list-item>
      <v-divider></v-divider>
      <v-list-item link title="Danh sách công ty"></v-list-item>
      <v-list-item link title="Danh sách gói khám"></v-list-item>
      <v-list-item link title="Danh sách bệnh nhân"></v-list-item>
    </v-navigation-drawer>
  </v-card-text>
</template>

<script>
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
});
</script>

<style>
</style>