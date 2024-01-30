<template>
  <button
    @click="mobileMenu"
    aria-label="Open menu"
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background lg:hidden cursor-pointer"
  >
    <span class="sr-only">Button used to open menu</span>
    <Icon name="heroicons:bars-2" />
  </button>
</template>
<script lang="ts" setup>
// Used to open/close menu
const emits = defineEmits(['open-menu'])

const mobileMenu = () => {
  emits("open-menu", true)
}
</script>
