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

const { getUsers, loading } = storeToRefs(useUsersStore());
const { loadUsers } = useUsersStore();

const layout = 'admin';

const columnsUser = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => h('div', { class: 'capitalize text-center' }, row.id)
  },
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked: false,
        'onUpdate:checked': (value) => {},
        ariaLabel: 'Select all',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: false,
        'onUpdate:checked': (value) => {},
        ariaLabel: 'Select row',
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h('div', { class: 'capitalize bg-gray-200 rounded-md px-1 py-1 text-center' }, row.status)
  },
  {
    accessorKey: 'avatar',
    header: 'Photo',
    cell: ({ row }) => h(TableAvatar, { avatar: row.avatar })
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => h('div', {}, `${row.firstName} ${row.lastName}`)
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => h('div', {}, row.email)
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.price);
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
    cell: ({ row }) => h('div', {}, row.role)
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => h('div', {}, format(new Date(row.createdAt), 'yyyy/MM/dd HH:mm'))
  },
  {
    accessorKey: 'detail',
    header: 'Detail',
    cell: () => h(ButtonTable, { state: { icon: 'heroicons:eye', label: 'Detail' } })
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => h(TableMenu, { actions: row.actions, id: row.id })
  }
];

onBeforeMount(async () => {
  await loadUsers();
});

watch(() => getUsers.value, () => {
  // alert('ok')
}, { deep: true })
</script>
