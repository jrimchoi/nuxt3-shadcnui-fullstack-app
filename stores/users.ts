import { defineStore } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast';

export interface Action {
  title: string;
  icon: string;
  path: string;
  divider: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  status: string;
  role: string;
  createdAt: string;
  actions: Action[];
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const getUsers = computed(() => users.value);

  async function loadUsers() {
    try {
      loading.value = true;
      const response = await $fetch('/api/users');
      users.value = response;
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '사용자 목록을 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      loading.value = false;
    }
  }

  async function createUser(userData: Partial<User>) {
    try {
      loading.value = true;
      const response = await $fetch('/api/users/create', {
        method: 'POST',
        body: userData
      });
      await loadUsers();
      return response.user;
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '사용자 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id: string, userData: Partial<User>) {
    try {
      loading.value = true;
      await $fetch(`/api/users/${id}`, {
        method: 'PUT',
        body: userData
      });
      await loadUsers();
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '사용자 수정 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id: string) {
    try {
      loading.value = true;
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      await loadUsers();
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '사용자 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    getUsers,
    loading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser
  };
});
