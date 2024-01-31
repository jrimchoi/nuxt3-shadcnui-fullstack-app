<template>
  <div>
    <HMenu as="div" class="relative">
      <HMenuButton
        v-slot="open"
        class="flex h-8 w-8 shrink-0 items-center justify-center cursor-pointer overflow-hidden rounded-full bg-background"
      >
        <Icon name="heroicons:ellipsis-horizontal" alt="Context Menu" class="w-full h-full" />
      </HMenuButton>

      <!-- Menu Items -->
      <TransitionScale :scale="0.8" origin="top right">
        <HMenuItems
          class="absolute right-0 z-10 mt-3 w-48 rounded-md border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div class="border-b px-3 py-1.5 text-xs flex items-center">
            <Icon name="heroicons:user" class="w-8 h-8 mr-2" /> 
            <div>
              <p class="front-semibold">User ID</p>
              <span class="text-center text-xs text-amber-500 truncate w-8">{{ props.id.substring(0, 20) + '...' }}</span>
            </div>
          </div>
          <div class="p-1 flex flex-col">
            <template v-for="(p, i) in props.actions" :key="i">
              <hr v-show="p.divider" class="my-2" />
              <HMenuItem v-show="!p.divider" v-slot="{ active }">
                <NuxtLink
                  :to="parsePath(p.path)"
                  :class="[active && 'bg-muted']"
                  class="inline-flex w-full items-center rounded-md p-2 text-xs font-medium"
                >
                  <Icon v-show="p.icon" :name="p.icon" class="h-4 w-4 text-muted-foreground mr-2" /> 
                  <span class="truncate">
                    {{ p.title }}
                  </span> 
                </NuxtLink>
              </HMenuItem>
            </template>
          </div>
        </HMenuItems>
      </TransitionScale>
    </HMenu>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();

const props = defineProps({
  actions : {
    type: Object as PropType<{ title: String; icon: String; path: string; divider?: boolean }[]>,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const parsePath = (path: string): string => {
  switch (path) {
    case '/users/${id}/edit':
      path = `/users/${props.id}/edit`;
      break;
    default:
      path = '/'
      break;
  }
  
  return path;
};
</script>
