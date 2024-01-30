<template>
  <div>
    <HDisclosure v-slot="{ open }">
      <HDisclosureButton class="flex items-center justify-between w-full py-2 px-4 text-left">
        <div class="flex items-center gap-2 text-sm text-primary font-medium">
          <Icon v-if="state.icon" :name="state.icon" class="h-5 w-5 text-muted-foreground" />
          <p class="truncate">
            {{ state.title }}
          </p>
        </div>
        <div>
          <Icon name="heroicons:chevron-down" :class="[open && 'rotate-180']" class="h-4 w-4 text-muted-foreground transition" />
        </div>
      </HDisclosureButton>
      <TransitionExpand>
        <HDisclosurePanel class="mx-6 flex flex-col border-l px-3">
          <template v-for="(i, j) in state.items" :key="j" class="inline-flex items-center gap-1 py-2 px-4 text-left text-primary">
            <NuxtLink class="rounded-md px-1 py-1.5 hover:bg-muted truncate" :to="i.path">
              <Icon name="heroicons:stop-circle" class="h-3 w-3 text-muted-foreground" />
              <span class="pl-2 text-[14px]">{{ i.title }}</span>
            </NuxtLink>
          </template>
        </HDisclosurePanel>
      </TransitionExpand>
    </HDisclosure>
  </div>

</template>

<script lang="ts" setup>
export type MenuItemState = { icon: string; path: string; title: string; items: { title: string, path: string; }[] }
defineProps({
  state: {
    type: Object as PropType<MenuItemState>,
    required: true,
  },
});
</script>
