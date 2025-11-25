<script setup lang="ts">
  import Layout from './components/Layout.vue';
  import { ComicStatus } from '@read-comics/types';

  console.log(ComicStatus);

  // App.vue 主入口
</script>

<template>
  <Layout>
    <router-view />
  </Layout>
</template>
