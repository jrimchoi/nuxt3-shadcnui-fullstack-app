<template>
  <div>
    <HMenu as="div" class="relative">
      <HMenuButton
        v-slot="open"
        class="flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer overflow-hidden rounded-full border bg-background"
      >
        <img :src="user.avatar" alt="Logged in user" class="w-full h-full" />
      </HMenuButton>

      <!-- Menu Items -->
      <TransitionScale :scale="0.8" origin="top right">
        <HMenuItems
          class="absolute right-0 z-10 mt-3 w-48 rounded-md border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div class="border-b px-3 py-1.5 text-sm">
            <p class="front-semibold">{{ user.username }}</p>
            <a href="mailto:nastib@gmail.com" class="leading-none text-muted-foreground">{{ user.email }}</a>
          </div>
          <div class="p-1">
            <template v-for="(p, i) in profileMenuOptions" :key="i">
              <hr v-if="p.divider" class="my-2" />
              <HMenuItem v-else v-slot="{ active }">
                <NuxtLink
                  @click="action(p.path, p.title)"
                  :class="[active && 'bg-muted']"
                  class="inline-flex w-full items-center rounded-md p-2 text-sm font-medium"
                >
                  <Icon v-if="p.icon" :name="p.icon" class="h-4 w-4 text-muted-foreground mr-2" /> {{ p.title }}
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

defineProps({
  profileMenuOptions: {
    type: Object as PropType<{ title: String; icon: String; path: string; divider: boolean }[]>,
    required: true,
  },
  user: {
    type: Object as PropType<{ username: String; avatar: string; email: String }>,
    required: true,
  },
});

function action (path: string, title: String) {
  if(title === 'Logout') {
    useAuthStore().clear()
    navigateTo('/')
    window.location.reload()
  } else {
    navigateTo(path)
  }
}
</script>
