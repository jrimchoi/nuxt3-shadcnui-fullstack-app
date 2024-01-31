import type { UserSession } from '#auth-utils';
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const protectedRoutes = ref(['/api/user']);
  const userSession = ref<UserSession>();

  const authenticated = computed( () => userSession.value?.authenticated)
  const getUserSession = computed( () => userSession.value)

  const signIn = async () => {
    const { data: results } = await useFetch('/api/auth/login', { method: 'POST' });
    userSession.value = results.value;
    return results.value;
  };

  const logout = async () => {
    const { data } = await useFetch('/api/auth/logout', { method: 'POST' });
    userSession.value = {};
    return data.value;
  };

  return { signIn, logout, authenticated, protectedRoutes, getUserSession };
}); //

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
