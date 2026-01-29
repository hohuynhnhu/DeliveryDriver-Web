<script setup lang="ts">
import { useFcm } from './composables/useFcm';

const getFcmToken  = useFcm();

// import '@vuepic/vue-datepicker/dist/main.css';
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
