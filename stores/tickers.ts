import { defineStore } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface Ticker {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  active: boolean;
  currency_symbol: string;
  currency_name: string;
  base_currency_symbol: string;
  base_currency_name: string;
  last_updated_utc: string;
}

export const useTickersStore = defineStore('tickers', () => {
  const tickers = ref<Ticker[]>([]);
  const getTickers = computed(() => tickers.value);
  const loading = ref(false);

  async function fetchAllTickers() {
    try {
      loading.value = true;
      const data = await $fetch('/api/tickers/all_tickers');
      tickers.value = data;
      
      useToast().toast({
        title: '성공',
        description: '티커 데이터를 성공적으로 불러왔습니다.',
        variant: 'default'
      });
    } catch (error) {
      useToast().toast({
        title: '오류 발생',
        description: '티커 데이터를 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive',
        action: h(ToastAction, {
          altText: '다시 시도'
        }, {
          default: () => '다시 시도'
        })
      });
      console.error('Error fetching tickers:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    getTickers,
    loading,
    fetchAllTickers
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTickersStore, import.meta.hot));
}


