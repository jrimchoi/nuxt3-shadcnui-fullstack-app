<template>
  <div>
    <!-- Header  -->
    <Header />
    <div class="container lg:grid lg:grid-cols-12 lg:gap-6">
      <!-- Sidebar -->
      <Sidebar class="hidden lg:col-span-2 lg:block" />
      <!-- Body  -->
      <slot />
      <Toaster/>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>
