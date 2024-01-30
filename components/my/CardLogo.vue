<template>
  <div>
    <NuxtLink :to="state.path" class="flex items-center gap-3">
      <!-- logo -->
      <img :src="state.img" :alt="state.alt" class="h-7 w-7 object-contain" />
      <!-- Page title  -->
      <span class="text-xl font-bold">{{ state.name }}</span>
    </NuxtLink> 
  </div>
</template>

<script lang="ts" setup>
export type CardLogoState = { path: String; img: string; name: String, alt: string}
defineProps({
  state: {
    type: Object as PropType<CardLogoState>,
    required: true,
  }
})
</script>
