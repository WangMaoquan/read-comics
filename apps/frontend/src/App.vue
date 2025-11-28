<script setup lang="ts">
  import { onMounted } from 'vue';
  import Layout from './components/Layout.vue';
  import { useUIStore } from './stores/ui';

  const uiStore = useUIStore();

  onMounted(() => {
    uiStore.initTheme();
  });
</script>

<template>
  <Layout>
    <router-view />
  </Layout>
</template>
