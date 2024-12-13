<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>이름</Label>
        <Input v-model="form.firstName" required />
      </div>
      <div class="space-y-2">
        <Label>성</Label>
        <Input v-model="form.lastName" required />
      </div>
    </div>
    
    <div class="space-y-2">
      <Label>이메일</Label>
      <Input v-model="form.email" type="email" required />
    </div>
    
    <div class="space-y-2">
      <Label>상태</Label>
      <Select v-model="form.status">
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Approved">Approved</option>
      </Select>
    </div>
    
    <div class="space-y-2">
      <Label>역할</Label>
      <Select v-model="form.role">
        <option value="User">User</option>
        <option value="Admin">Admin</option>
      </Select>
    </div>
    
    <div class="flex justify-end space-x-2">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        취소
      </Button>
      <Button type="submit" :disabled="loading">
        {{ loading ? '처리중...' : submitLabel }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  initialData?: any;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const form = ref({
  firstName: props.initialData?.firstName || '',
  lastName: props.initialData?.lastName || '',
  email: props.initialData?.email || '',
  status: props.initialData?.status || 'Pending',
  role: props.initialData?.role || 'User'
});

const handleSubmit = () => {
  emit('submit', { ...form.value });
};
</script> 