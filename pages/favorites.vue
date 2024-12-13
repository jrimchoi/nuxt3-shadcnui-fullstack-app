<template>
  <NuxtLayout name="admin">
    <main class="py-5 lg:col-span-9">
      <!-- 필터 섹션 -->
      <div class="mb-6">
        <Label>즐겨찾기 목록</Label>
        <Select v-model="selectedFavorite">
          <option value="">전체 보기</option>
          <option 
            v-for="name in favoriteNames" 
            :key="name" 
            :value="name"
          >
            {{ name }}
          </option>
        </Select>
      </div>

      <!-- 테이블 -->
      <DataTable
        :columns="columns"
        :data="filteredFavorites"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #checkbox="{ row }">
          <Checkbox
            :checked="selectedItems.includes(row.id)"
            @change="toggleSelection(row.id)"
          />
        </template>
      </DataTable>

      <!-- 삭제 버튼 -->
      <div class="mt-4" v-if="selectedItems.length">
        <Button 
          variant="destructive" 
          @click="deleteSelected"
        >
          선택 항목 삭�� ({{ selectedItems.length }})
        </Button>
      </div>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useFavoritesStore } from '@/stores/favorites';
import { format, isValid, parseISO } from 'date-fns';

const favoritesStore = useFavoritesStore();
const loading = computed(() => favoritesStore.loading);
const favorites = computed(() => favoritesStore.getFavorites);

const selectedFavorite = ref('');
const selectedItems = ref<string[]>([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});

// 고유한 즐겨찾기 이름 목록
const favoriteNames = computed(() => {
  const names = new Set(favorites.value.map(f => f.favorite_name));
  return Array.from(names);
});

// 필터링된 즐겨찾기 목록
const filteredFavorites = computed(() => {
  let filtered = favorites.value;
  if (selectedFavorite.value) {
    filtered = filtered.filter(f => f.favorite_name === selectedFavorite.value);
  }
  return filtered;
});

// 컬럼 정의
const columns = [
  {
    key: 'select',
    title: '',
    slot: 'checkbox'
  },
  {
    key: 'favorite_name',
    title: '즐겨찾기 이름'
  },
  {
    key: 'ticker.ticker',
    title: '티커'
  },
  {
    key: 'ticker.name',
    title: '이름'
  },
  {
    key: 'ticker.market',
    title: '마��'
  },
  {
    key: 'createdAt',
    title: '생성일',
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

// 선택 토글
const toggleSelection = (id: string) => {
  const index = selectedItems.value.indexOf(id);
  if (index === -1) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

// 선택 항목 삭제
const deleteSelected = async () => {
  // 삭제 로직 구현
};

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  pagination.value.page = page;
};

// 초기 데이터 로드
onMounted(async () => {
  // 실제 사용시에는 사용자 ID를 동적으로 가져와야 합니다
  const userId = 'current-user-id';
  await favoritesStore.fetchUserFavorites(userId);
});
</script>
