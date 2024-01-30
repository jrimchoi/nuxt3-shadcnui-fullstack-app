import { defineStore, acceptHMRUpdate } from 'pinia';

export const useAuthStore = defineStore('Auth', () => {
  const { loggedIn, user, session, clear, fetch } = useUserSession();
  const protectedRoutes = ref(["/api/users"])
  const signIn = async () => {
    const { data: signIn } = await useFetch('/api/auth/login', { method: 'POST' });
    return signIn;
  };

  return { signIn, loggedIn, user, session, clear, fetch };
}); //

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
