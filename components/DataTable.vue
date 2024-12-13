<template>
  <div class="w-full">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in columns" :key="column.accessorKey || column.id">
              <template v-if="typeof column.header === 'function'">
                <component :is="column.header({ table: {} })" />
              </template>
              <template v-else>
                {{ column.header }}
              </template>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in paginatedData" :key="row.id">
            <TableCell v-for="column in columns" :key="column.accessorKey || column.id">
              <component
                v-if="column.cell"
                :is="column.cell({ row })"
              />
              <template v-else>
                {{ row[column.accessorKey] }}
              </template>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="mt-4 flex items-center justify-between px-2">
      <div class="text-sm text-muted-foreground">
        총 {{ pagination.total }}개 중 {{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
      </div>
      
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page === 1"
          @click="$emit('page-change', pagination.page - 1)"
        >
          이전
        </Button>
        
        <div class="flex items-center justify-center text-sm">
          {{ pagination.page }} / {{ pagination.totalPages }}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="$emit('page-change', pagination.page + 1)"
        >
          다음
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  }
})

// 페이지네이션된 데이터 계산
const paginatedData = computed(() => {
  const start = (props.pagination.page - 1) * props.pagination.limit
  const end = start + props.pagination.limit
  return props.data.slice(start, end)
})

defineEmits(['page-change'])
</script> 