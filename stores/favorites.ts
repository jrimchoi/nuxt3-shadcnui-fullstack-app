import { defineStore } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast';

interface Favorite {
  userId: string;
  favorite_name: string;
  ticker: any;
  createdAt: string;
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Favorite[]>([]);
  const loading = ref(false);

  const getFavorites = computed(() => favorites.value);

  async function fetchUserFavorites(userId: string) {
    try {
      loading.value = true;
      const response = await $fetch('/api/tickers/favorites', {
        params: { userId }
      });
      favorites.value = response.data;
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '즐겨찾기를 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      loading.value = false;
    }
  }

  async function addFavorite(userId: string, favorite_name: string, ticker: any) {
    try {
      loading.value = true;
      await $fetch('/api/tickers/favorites', {
        method: 'POST',
        body: { userId, favorite_name, ticker }
      });
      
      await fetchUserFavorites(userId);
      
      useToast().toast({
        title: '성공',
        description: '즐겨찾기가 추가되었습니다.',
        variant: 'default'
      });
    } catch (error: any) {
      useToast().toast({
        title: '오류 발생',
        description: error.message || '즐겨찾기 추가 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    getFavorites,
    loading,
    fetchUserFavorites,
    addFavorite
  };
});
