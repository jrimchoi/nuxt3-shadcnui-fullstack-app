<template>
  <div >
    <img :src="avatar" alt="Avatar" class="w-8 h-8 rounded-full"  />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  avatar: {
    type: String,
    required: true,
  }
})
</script>
