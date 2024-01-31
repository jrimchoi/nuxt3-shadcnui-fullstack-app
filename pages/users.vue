<template>
  <div>
    <NuxtLayout :name="layout" class="w-full col-span-9">
      <div v-if="pending" class="pt-5">Loading ...</div>
      <div v-else class="w-full col-span-10">
        <TableUsers :data="getUsers" :columns="columnsUser" />
      </div>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
import { h } from 'vue';
import { format } from 'date-fns';
import TableUsers from '@/components/TableUsers.vue';
//import people from '../mockDataPeople.json';
import TableAvatar from '~/components/my/TableAvatar.vue';
import { Checkbox } from '../components/ui/checkbox';
import TableMenu from '~/components/TableMenu.vue';
import ButtonTable from '~/components/my/ButtonTable.vue';
import { useUsersStore } from '../stores/users';

const pending = ref<boolean>(true);
const { getUsers } = storeToRefs(useUsersStore());
const { loadUsers } = useUsersStore();

const layout = 'admin';

const columnsUser = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => h('div', { class: 'capitalize text-center' }, row.getValue('id')),
    enableSorting: false,
  },
  {
    id: 'status',
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': value => row.toggleSelected(!!value),
        ariaLabel: 'Select row',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h('div', { class: 'capitalize bg-gray-200 rounded-md px-1 py-1 text-center' }, row.getValue('status')),
  },
  {
    accessorKey: 'avatar',
    header: 'Photo',
    enableSorting: false,
    cell: ({ row }) => h(TableAvatar, { avatar: row.getValue('avatar') }),
  },
  // {
  //   accessorKey: 'firstName',
  //   header: 'First name',
  // },
  // {
  //   accessorKey: 'lastName',
  //   header: 'Last name',
  // },
  {
    accessorFn: (row: { firstName: any; lastName: any }) => `${row.firstName} ${row.lastName}`,
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'price',
    header: () => h('div', { class: 'text-right' }, 'Price'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);

      return h('div', { class: 'text-right font-medium' }, formatted);
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: (info: { getValue: () => string | number | Date }) => format(new Date(info.getValue()), 'd/MM/yyyy HH:MM'),
  },
  {
    accessorKey: 'detail',
    header: 'Detail ',
    cell: () => h(ButtonTable, { state: { icon: 'heroicons:eye', label: 'Detail' } }),
    enableSorting: false,
  },
  {
    accessorKey: 'actions',
    header: 'Actions ',
    cell: ({ row }) => h(TableMenu, { actions: row.original.actions, id: row.original.id }),
    enableSorting: false,
  },
];

onBeforeMount(() => {
  setTimeout(async () => {
    const { pending: pend } = await loadUsers();
    pending.value = pend.value;
  }, 500);
});

watch(() => getUsers , () => {
  alert('ok')
})
</script>
