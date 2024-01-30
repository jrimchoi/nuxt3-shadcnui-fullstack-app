<template>
  <div>
    <ol class="flex items-center whitespace-nowrap" aria-label="Breadcrumb">
      <li v-for="(item ,i) in props.state" :key="i" class="inline-flex items-center">
        <NuxtLink :to="props.state[i].path" class="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:focus:text-blue-500" >
          <Icon v-if="props.state[i].icon" :name="props.state[i].icon" class="flex-shrink-0 me-3 h-4 w-4" width="24" height="24" />
          {{ props.state[i].label }}
        </NuxtLink>
        <Icon v-if="!(i === props.state.length-1)" name="heroicons:chevron-right" class="flex-shrink-0 mx-2 overflow-visible h-4 w-4 text-gray-400 dark:text-neutral-600" />
      </li>

    </ol> 
  </div>
</template>

<script lang="ts" setup>
export interface BraidCrumbState {
  icon?: string,
  label: string,
  path: string
}
const props = defineProps({
  state: {
    type: Object as PropType<BraidCrumbState[]>,
      required: true
  }
})

</script>



<style>

</style>
