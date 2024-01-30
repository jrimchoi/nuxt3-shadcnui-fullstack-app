<template>
  <div>
    <NuxtLayout :name="layout">
      <Dashboard />
    </NuxtLayout>
  </div>

</template>
<script lang="ts" setup>
const layout = 'admin';
</script>
