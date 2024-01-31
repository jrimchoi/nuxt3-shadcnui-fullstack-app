<template>
  <div class="flex flex-col mt-2">
    <template v-for="(link, i) in links" :key="i">
      <MyMenuItem v-on:menu-click="onMenuClick" v-if="!link.items" :state="link" />
      <MyMenuItemNexted v-on:menu-click="onMenuClick" v-else :state="link" />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  links: {
    type: Object as PropType<{ icon: String; title: string; path: String; items: [] }[]>,
    required: true,
  },
});

async function onMenuClick(payload: { path: string; title: String }) {
  if (payload.title === 'Logout') {
    await useAuthStore().logout();
    useRouter().push({ path: useRoute().path });
  } else {
    try {
      useRouter().push({ path: payload.path });
    } catch (error) {
      useRouter().push({ path: '/' });
    }
  }
}

watch(
  () => useUserSession().loggedIn.value,
  () => {
  }
);
</script>
