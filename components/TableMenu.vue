<template>
  <div class="relative">
    <DropdownMenu>
      <DropdownMenuTrigger class="focus:outline-none">
        <Button variant="ghost" size="icon">
          <Icon name="heroicons:ellipsis-horizontal" class="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuItem v-for="action in actions" :key="action.title" @click="handleAction(action)">
          <Icon :name="action.icon" class="mr-2 h-4 w-4" />
          <span>{{ action.title }}</span>
          <DropdownMenuSeparator v-if="action.divider" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import type { Action } from '@/stores/users'

const props = defineProps<{
  actions: Action[]
  id: string
}>()

const router = useRouter()

const handleAction = (action: Action) => {
  if (action.path) {
    router.push(action.path)
  }
}
</script>
