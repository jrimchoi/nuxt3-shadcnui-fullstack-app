<template>
  <div class="flex flex-col mt-2">
    <template v-for="(link, i) in links" :key="i">
      <MyMenuItem  v-if="!link.items" :state="link" />
      <MyMenuItemNexted v-else :state="link"/>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  links : {
    type: Object as PropType<{icon: String, title: string, path: String, items: []}[]>,
    required: true
}
})

</script>
