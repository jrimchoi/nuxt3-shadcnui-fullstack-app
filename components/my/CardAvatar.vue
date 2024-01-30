<template>
    <div class="flex shrink-0 flex-col items-center gap-2">
      <img
        class="h-10 w-10 rounded-full object-cover"
        :src="data.picture.thumbnail"
        :alt="data.name.first"
      />
      <div class="text-center">
        <p class="text-sm font-semibold ">{{ data.name.first }} {{ data.name.last }}</p>
        <p class="text-xs text-muted-foreground truncate">10 mins ago</p>
      </div>
    </div>
</template>

<script lang="ts" setup>
defineProps({
  data: {
    type: Object,
    required: true,
  }
})
</script>


