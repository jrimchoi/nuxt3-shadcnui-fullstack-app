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
      path: '/'
    },
    {
      title: "Help",
      icon: "heroicons:question-mark-circle",
      path: '/'
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
      path: '/admin'
    },
    {
      title: "Customers",
      icon: "heroicons:user-group",
      path: '/',
      items: [
        { title: "List", path: '/' },
        { title: "Create", path: '/' },
        { title: "Edit", path: '/' },
        { title: "Delete", path: '/' },
        { title: "Details", path: '/' },
      ],
    },
    {
      title: "Orders",
      icon: "heroicons:shopping-cart",
      path: '/',
      items: [
        { title: "List", path: '/' },
        { title: "Create", path: '/' },
        { title: "Edit", path: '/' },
        { title: "Delete", path: '/' },
        { title: "Details", path: '/' },
      ],
    },
    {
      title: "Products",
      icon: "heroicons:cube",
      path: '/',
      items: [
        { title: "Categories", path: '/' },
        { title: "Prices", path: '/' },
        { title: "Product", path: '/' },
      ],
    },
    {
      title: "Staff",
      icon: "heroicons:user",
      path: '/',
      items: [
        { title: "List", path: '/' },
        { title: "Create", path: '/' },
        { title: "Edit", path: '/' },
        { title: "Delete", path: '/' },
        { title: "Details", path: '/' },
      ],
    },
    {
      title: "Analytics",
      icon: "heroicons:chart-pie",
      path: '/',
      items: [{ title: "Overview", path: '/' }, { title: "Statistics", path: '/' }, { title: "Trends", path: '/' }],
    },
  ];
</script>