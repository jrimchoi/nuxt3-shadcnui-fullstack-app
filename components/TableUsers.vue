<template>
  <div>
    <Grid
      :data="data"
      :pageable="true"
      :sortable="true"
      :filterable="true"
      :skip="skip"
      :take="pageSize"
      :total="total"
      @pagechange="pageChange"
      style="height: calc(100vh - 250px);"
    >
      <GridColumn field="id" title="ID" width="70" />
      <GridColumn field="status" title="Status" width="100">
        <template v-slot:cell="{ dataItem }">
          <div class="capitalize bg-gray-200 rounded-md px-1 py-1 text-center">
            {{ dataItem.status }}
          </div>
        </template>
      </GridColumn>
      <GridColumn field="avatar" title="Photo" width="100">
        <template v-slot:cell="{ dataItem }">
          <img :src="dataItem.avatar" alt="avatar" class="w-10 h-10 rounded-full" />
        </template>
      </GridColumn>
      <GridColumn field="name" title="Name" width="150">
        <template v-slot:cell="{ dataItem }">
          {{ dataItem.firstName }} {{ dataItem.lastName }}
        </template>
      </GridColumn>
      <GridColumn field="email" title="Email" width="200" />
      <GridColumn field="price" title="Price" width="120">
        <template v-slot:cell="{ dataItem }">
          {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dataItem.price) }}
        </template>
      </GridColumn>
      <GridColumn field="role" title="Role" width="100" />
      <GridColumn field="createdAt" title="Created At" width="150">
        <template v-slot:cell="{ dataItem }">
          {{ format(new Date(dataItem.createdAt), 'yyyy/MM/dd HH:mm') }}
        </template>
      </GridColumn>
      <GridColumn field="actions" title="Actions" width="120">
        <template v-slot:cell="{ dataItem }">
          <div class="flex gap-2">
            <button class="p-1 hover:bg-gray-100 rounded-md">
              <Icon name="heroicons:eye" class="w-4 h-4" />
            </button>
            <button class="p-1 hover:bg-gray-100 rounded-md">
              <Icon name="heroicons:pencil" class="w-4 h-4" />
            </button>
          </div>
        </template>
      </GridColumn>
    </Grid>
  </div>
</template>

<script setup lang="ts">
import * as KendoGrid from '@progress/kendo-vue-grid';
const { Grid, GridColumn } = KendoGrid;
import { format } from 'date-fns';
import { computed, ref } from 'vue';

const props = defineProps<{
  data: any[]
}>()

// 페이지네이션 상태
const pageSize = ref(10);
const skip = ref(0);
const total = computed(() => props.data.length);

// 페이지 변경 핸들러
const pageChange = (event: any) => {
  skip.value = event.page.skip;
  pageSize.value = event.page.take;
};
</script>

<style>
@import '@progress/kendo-theme-default/dist/all.css';

.k-grid {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.k-grid-header {
  background-color: #f8fafc;
}

.k-grid td {
  border-color: #e2e8f0;
}

.k-pager {
  border-top: 1px solid #e2e8f0;
  background-color: #fff;
}
</style>
