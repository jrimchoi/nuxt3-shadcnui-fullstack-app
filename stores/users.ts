import { defineStore, acceptHMRUpdate } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'

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
  price: string;
  role: Array<string>;
  createdAt: Date;
  actions: Action[];
}

export const useUsersStore = defineStore('users', () => {
  /** state for holding users */
  const users = ref<User[]>();
  const getUsers = computed(() => users.value)
  
  /** Function to load users data */
  async function loadUsers () {
    const {
      data: results,
      pending,
      error,
      refresh,
    } = await useFetch('/api/users', {
      lazy: true,
    });
     
    if(!results.value?.length){
      useToast().toast({
        title: 'Oups !!!',
        description: 'No users loaded !, please logged in',
        variant: 'destructive',
        action: h(ToastAction, {
          altText: 'Try again',
        }, {
          default: () => {
            return 'Try again'}
        })
      });
    }

    users.value = results.value
    return { results, pending, error, refresh };
  }

  return { getUsers, loadUsers };
});

// make sure to pass the right store definition, `usersStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
