<template>
  <div class="flex shrink-0 flex-col items-center gap-2" :title="props.state.label">
    <button @click.prevent="throwAlert()" class="flex h-8 w-8 items-center justify-center rounded-full border-input bg-background hover:bg-accent hover:text-accent-foreground">
      <Icon :name="props.state.icon" class="h-4 w-4" />
    </button>
  </div>
</template>

<script lang="ts" setup>
export type ButtonTableState = { icon: String; label: string }
const props =defineProps({
  state: {
    type: Object as PropType<ButtonTableState>,
    required: true
  }
})

const throwAlert = () => {
  alert(props.state.label)
}
</script>

