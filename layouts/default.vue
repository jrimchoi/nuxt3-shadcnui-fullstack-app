<template>
  <div>
    <!-- Header  -->
    <Header />
    <div class="container lg:grid lg:grid-cols-12 lg:gap-6">
      <!-- Body  -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup></script>
