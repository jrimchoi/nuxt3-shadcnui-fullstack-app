<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-4 align-middle sm:px-6 lg:px-8">
          <MyBraidCrumb :state="braidCrumbState" class="my-5"/>
          <!-- Table Top -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="my-2 flex justify-end">
                <Button variant="default" size="default"  @click="add()">
                 <span> <Icon name="heroicons:plus" class="w-5 h-5 mr-2"/>Add</span>
                </Button>
              </div>
              <div class="my-1 w-[350px]">
                <Input type="text" class="border border-gray-400 rounded px-2 py-2" placeholder="Search..." v-model="filter" />
              </div>
            </div>

            <div class="w-[150px]">
              <MySelect v-model="linePerPage" :state="{ label: 'Lignes/Page', items: ['5', '10', '20','30','40', '50'] }" />
            </div>
          </div>
          <!-- Table -->
          <Table class="min-w-full divide-y divide-gray-500 dark:divide-gray-200">
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  scope="col"
                  class="px-1 py-2.5 text-left text-xs font-semibold text-primary"
                  :class="{
                    'cursor-pointer select-none': header.column.getCanSort(),
                  }"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                >
                  <span class="truncate">
                    <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                    {{ { asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted()] }}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="divide-y divide-gray-200 dark:divide-gray-500">
              <template v-if="table.getRowModel().rows.length > 0">
                <TableRow v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-accent">
                  <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="whitespace-nowrap px-1 py-3 text-xs text-gray-500">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow >
                  <TableCell :colspan="columns.length" class="h-14 text-center text-sm truncate"> <span class="text-xl">😔</span> No users loaded ! </TableCell>
                </TableRow>
              </template>

            </TableBody>
          </Table>
          <!-- Table down -->
          <div class="flex justify-between items-center">
            <div class="flex text-xs gap-2 text-muted-foreground">
              <div class="flex">
                Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }} -
                {{ table.getFilteredRowModel().rows.length }} results
              </div>
              <div class="flex-1" >
                {{ table.getFilteredSelectedRowModel().rows.length }} of
                {{ table.getFilteredRowModel().rows.length }} row(s) selected.
              </div>
            </div>
    
            <div class="flex justify-end w-40 gap-1">
              <Button
                variant="default"
                class="border border-gray-300 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Start"
                @click="table.setPageIndex(0)"
              >
                <Icon name="heroicons:chevron-double-left" class="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                class="border border-gray-300 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!table.getCanPreviousPage()"
                @click="table.previousPage()"
              >
                <Icon name="heroicons:chevron-left" class="w-4 h-4" />
              </Button>
    
              <Button
                variant="default"
                class="border border-gray-300 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!table.getCanNextPage()"
                @click="table.nextPage()"
              >
                <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                class="border border-gray-300 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="table.setPageIndex(table.getPageCount() - 1)"
              >
                <Icon name="heroicons:chevron-double-right" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
//import { ref } from 'vue'
//import MySelect from './my/Select.vue';

import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/vue-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { type BraidCrumbState } from './my/BraidCrumb.vue';
import { type User } from '../stores/users';

useHead({
  title: "Users manger",
  meta: [
    {
      name: "description",
      content: "Manage users here"
    }
    ]
})
const linePerPage = ref<number>();

const isOpen = ref(false);

const braidCrumbState = ref<BraidCrumbState[]>(
  [
    { icon: 'heroicons:home', label: "Home", path: '/'},
    { icon: 'heroicons:squares-plus', label: "App Center", path: '/'},
    { icon: '', label: "Users", path: '/'}
  ]
)
const logo = ref({
  img: '/logoipsum-298.svg',
  path: '/',
  alt: 'Analytics logo',
  name: 'Analytics',
});

const user = ref({
  avatar: 'https://randomuser.me/api/portraits/med/men/75.jpg',
  email: 'nastib@outlook.com',
  username: 'Wilfrid NASSARA',
});

// Items that will be displayed in menu
const profileMenuOptions = ref([
  { title: 'Profile', icon: 'heroicons:user', path: '/admin', divider: false },
  { title: 'Billing', icon: 'heroicons:credit-card', path: '/', divider: false },
  { title: 'Settings', icon: 'heroicons:cog-8-tooth', path: '/', divider: false },
  { title: 'Team members', icon: 'heroicons:users', path: '/', divider: false },
  { title: 'Sales', icon: 'heroicons:banknotes', path: '/', divider: false },
  { title: '', icon: '', path: '', divider: true },
  { title: 'Logout', icon: 'heroicons:arrow-left-on-rectangle', path: '/', divider: false },
]);

const tableMenu = (ok: true) => {
  isOpen.value = ok;
};

const props = defineProps({
  data: { type: Object as PropType<User[]>, required: true },
  columns: { type: Object as PropType<any[]>, required: true },
});
const buttonState = { icon: 'heroicons:plus', label: 'Add' };
const data = ref(props.data);

const sorting = ref<any[]>([]);
const filter = ref('');

const table = useVueTable({
  data: data.value,
  columns: props.columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value;
    },
    get globalFilter() {
      return filter.value;
    },
  },
  onSortingChange: updaterOrValue => {
    sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue;
  },
  initialState: {
    pagination: {
      pageSize: 5,
    },
  },
});

watch(
  () => linePerPage.value,
  () => {
    table.setPageSize(Number(linePerPage.value));
  }
);

function add(){
  alert('Add');
}
</script>
