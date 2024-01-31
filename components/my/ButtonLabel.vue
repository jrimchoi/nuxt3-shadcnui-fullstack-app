<template>
  <div class="flex shrink-0 flex-col items-center gap-2" :title="state.label">
    <button @click.prevent="throwAlert()" class="flex h-12 w-12 items-center justify-center rounded-full border-input bg-background hover:bg-accent hover:text-accent-foreground">
      <Icon :name="state.icon" class="h-6 w-6" />
    </button>
    <div v-show="state.label">
      <p class="text-sm font-semibold">{{ state.label }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
export type ButtonLabelState = { icon: String; label: string }
defineProps({
  state: {
    type: Object as PropType<ButtonLabelState>,
    required: true
  }
})

const throwAlert = () => {
  alert('hello')
}
</script>

