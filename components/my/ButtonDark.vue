<template>
  <button
    @click="toggleTheme"
    aria-label="Toggle theme"
    class="flex h-9 w-9 shrink-0 overflow-auto items-center justify-center rounded-full border bg-background"
  >
    <icon name="heroicons:sun" class="h-5 w-5" />
  </button>
</template>

<script lang="ts" setup>
const mode = useColorMode();
const toggleTheme = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light';
};
</script>
