<template>
  <NuxtLayout name="admin">
    <main class="py-5 lg:col-span-9">
      <!-- 필터 섹션 -->
      <div class="mb-6 flex flex-wrap gap-4">
        <div class="w-full md:w-64">
          <Input 
            v-model="filters.ticker" 
            placeholder="종목코드" 
            @input="debouncedSearch"
          />
        </div>
        
        <div class="w-full md:w-64">
          <Input 
            v-model="filters.name" 
            placeholder="종목명" 
            @input="debouncedSearch"
          />
        </div>
      </div>

      <!-- 테이블 -->
      <DataTable
        :columns="columns"
        :data="tickers"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #empty>
          <div class="text-center p-4">
            데이터가 없습니다.
          </div>
        </template>
      </DataTable>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTickersStore } from '@/stores/tickers';
import { format, isValid, parseISO } from 'date-fns';
import { debounce } from '@/utils/debounce';

const tickersStore = useTickersStore();
const loading = ref(false);
const tickers = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});

const filters = ref({
  ticker: '',
  name: ''
});

// 컬럼 정의
const columns = [
  {
    key: 'ticker',
    title: '티커'
  },
  {
    key: 'name',
    title: '이름'
  },
  {
    key: 'market',
    title: '마켓'
  },
  {
    key: 'currency_name',
    title: '통화'
  },
  {
    key: 'base_currency_name',
    title: '기준통화'
  },
  {
    key: 'last_updated_utc',
    title: '마지막 업데이트',
    render: (value: string) => formatDate(value)
  }
];

// 날짜 포맷팅
const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

// 데이터 로드
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/tickers/search', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.ticker,
        name: filters.value.name
      }
    });
    
    tickers.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error('Error fetching tickers:', error);
  } finally {
    loading.value = false;
  }
};

// 디바운스된 검색 함수
const debouncedSearch = debounce(() => {
  pagination.value.page = 1; // 검색 시 첫 페이지로 리셋
  fetchData();
}, 300);

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchData();
};

// 초기 데이터 로드
onMounted(() => {
  fetchData();
});
</script>
