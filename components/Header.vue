<template>
  <header class="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
    <!-- Flex container  -->
    <div class="container flex h-16 items-center justify-between">
      <div class="flex items-center gap-3">
        <MyButtonMenu v-on:open-menu="mobileMenu" />
        <!-- log and page title  -->
        <MyCardLogo :state="logo" />
      </div>

      <!-- Right side of header -->
      <div class="flex items-center gap-5">
        <Button variant="outline" size="sm" v-show="!authenticated" @click="login()">  Sign In <Icon name="heroicons:arrow-left-end-on-rectangle" class="ml-2 text-xl"/></Button>
        <!-- black and wight  -->

        <MyButtonDark />
        <!-- Profile dropdown menu  -->
        <ProfileMenu :profileMenuOptions="profileMenuOptions" :user="user" />
      </div>
    </div>
    <!-- Mobile menu -->
    <MobileMenu v-model="isOpen" />
  </header>
</template>

<script lang="ts" setup>
const isOpen = ref(false);
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
  { title: 'Profile', icon: 'heroicons:user', path: '/profile', divider: false },
  { title: 'Billing', icon: 'heroicons:credit-card', path: '/billing', divider: false },
  { title: 'Settings', icon: 'heroicons:cog-8-tooth', path: '/settings', divider: false },
  { title: 'Team members', icon: 'heroicons:users', path: '/teams', divider: false },
  { title: 'Sales', icon: 'heroicons:banknotes',path: '/sales', divider: false },
  { title: '', icon: '',  path: '', divider: true },
  { title: 'Logout', icon: 'heroicons:arrow-right-on-rectangle', path: '/', divider: false },
]);
const mobileMenu = (ok: true) => {
  isOpen.value = ok;
}

const { authenticated }  = storeToRefs(useAuthStore())

async function login  (){
 const data  = await useAuthStore().signIn();
 user.value.email = data?.user?.email; 
 console.log(data);
 
 return user.value
}

</script>
