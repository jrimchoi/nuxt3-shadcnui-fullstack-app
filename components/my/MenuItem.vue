<template>
  <div>
    <NuxtLink @click="$emit('menu-click', { title: state.title, path: state.path })" class="inline-flex items-center gap-2 py-2 px-4 text-left text-primary text-sm font-medium cursor-pointer">
      <Icon v-if="state.icon" :name="state.icon" class="h-5 w-5 text-muted-foreground" />
      <p class="truncate">
        {{ state.title }}
      </p>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>

export type MenuItemState = { icon: string; title: string; path: string; items: [] }
defineProps({
  state: {
    type: Object as PropType<MenuItemState>,
    required: true,
  },
});
</script>
