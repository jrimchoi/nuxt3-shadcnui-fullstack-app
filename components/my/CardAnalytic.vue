<template>
  <div class="rounded-lg border bg-card p-6 hover:bg-accent">
    <div class="flex items-center justify-between">
      <p class="text-sm text-primary font-medium truncate">{{ cardData.total }}</p>
      <span class="shrink-0">
        <Icon :name="cardData.icon" class="h-6 w-6 text-muted-foreground" />
      </span>
    </div>

    <p class="mt-1.5 text-xl font-extrabold">{{ cardData.account}}</p>
    <p class="text-xs text-muted-foreground truncate">{{ cardData.description}}</p>
  </div>
</template>

<script lang="ts" setup>
export type CardState = { total: String, icon?: String, account: String, description: String }
defineProps({
  cardData : {
    type: Object as PropType<CardState>,
    required: true,
  }
})

</script>
