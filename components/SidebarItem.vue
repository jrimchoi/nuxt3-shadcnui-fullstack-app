<template>
  <div class="flex flex-col mt-2">
    <template v-for="(link, i) in links" :key="i">
      <MyMenuItem v-on:action="onClick" v-if="!link.items" :state="link" />
      <MyMenuItemNexted v-on:action="onClick" v-else :state="link" />
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

function onClick (payload: { path: string, title: String }) {

  if(payload.title === 'Logout') {
    useAuthStore().clear()
    useRouter().push({ path: '/' }) 
    //window.location.reload()
  } else {
     try {
      useRouter().push({ path: payload.path }) 
    } catch (error) {
      useRouter().push({ path: '/' })  
    }
  }
}
</script>
