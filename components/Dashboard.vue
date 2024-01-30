<template>
    <!-- Main section  -->
    <main class="py-5 lg:col-span-6">
      <!-- Status cards  -->
      <StatusCard/>
      <!-- costumer list   -->
      <NewCustomer/>
      <!-- Sales Chart  -->
      <SalesChart/>
      <!-- Recent Orders  -->
      <RecentOrders/>
    </main>

    <!-- Profile info  -->
    <div class="hidden py-5 lg:col-span-3 lg:block">
      <ProfileInfo />
     <!-- Reminders  -->
     <Reminders />
    </div>

</template>

<script lang="ts" setup></script>

