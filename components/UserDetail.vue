<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-4">
      <img :src="user.avatar" alt="User avatar" class="w-16 h-16 rounded-full" />
      <div>
        <h3 class="text-lg font-semibold">
          {{ user.firstName }} {{ user.lastName }}
        </h3>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Label>상태</Label>
        <div class="mt-1">
          <Badge :variant="getStatusVariant(user.status)">
            {{ user.status }}
          </Badge>
        </div>
      </div>
      
      <div>
        <Label>역할</Label>
        <div class="mt-1">
          <Badge>{{ user.role }}</Badge>
        </div>
      </div>
    </div>
    
    <div>
      <Label>생성일</Label>
      <div class="mt-1">
        {{ formatDate(user.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

const props = defineProps<{
  user: any;
}>();

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Approved': return 'success';
    case 'Processing': return 'warning';
    default: return 'secondary';
  }
};

const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
};
</script> 