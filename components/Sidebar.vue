<template>
  <aside class="sticky top-[65px] h-[calc(100vh-65px)] py-5">
    <!-- Sidebar -->
    <div class="flex h-full w-full flex-col gap-5 overflow-y-auto rounded-md border bg-card pb-5 scrollbar-thin scrollbar-thumb-input scrollbar-thumb-rounded-md">
      <SidebarItem :links="menu" />
      <div class="mt-auto">
        <SidebarItem :links="bottomMenu" />
      </div>
    </div>
   </aside>
</template>

<script lang="ts" setup>
  const bottomMenu = [
    {
      title: "Settings",
      icon: "heroicons:cog-8-tooth",
      path: '/settings'
    },
    {
      title: "Help",
      icon: "heroicons:question-mark-circle",
      path: '/help'
    },
    {
      title: "Logout",
      icon: "heroicons:arrow-left-on-rectangle",
      path: '/'
    },
  ];
  const menu = [
    {
      title: "Dashboard",
      icon: "heroicons:home",
      path: '/'
    },
    {
      title: "Users",
      icon: "heroicons:user-group",
      path: '/users',
    },
    {
      title: "Favorites",
      icon: "heroicons:star",
      path: '/favorites',
    },
    {
      title: "Tickers",
      icon: "heroicons:user-group",
      path: '/tickers',
    },
    {
      title: "Clients",
      icon: "heroicons:user-group",
      path: '/clients',
    },
    {
      title: "Suppliers",
      icon: "heroicons:user-group",
      path: '/suppliers',
    },
    {
      title: "Products",
      icon: "heroicons:cube",
      path: '/products',
      items: [
        { title: "Catalogue", path: '/Catalogue', method: 'GET' },
        { title: "Categories", path: '/category', method:'GET' },
        { title: "Prices", path: '/price' },
      ],
    },
    {
      title: "Orders",
      icon: "heroicons:shopping-cart",
      path: '/orders',
    },

    {
      title: "Analytics",
      icon: "heroicons:chart-pie",
      path: '/analytics',
      items: [
        { title: "Overview", path: '/overview', method: 'GET' }, 
        { title: "Statistics", path: '/statistics', method: 'GET' }, 
        { title: "Trends", path: '/trends', method: 'GET' }
      ],
    },
  ];
</script>