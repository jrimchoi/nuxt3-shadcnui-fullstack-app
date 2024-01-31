<template>
  <section class="mt-5">
    <h3 class="font-bold text-primary">New Customers</h3>
    <div
      class="mt-5 flex w-full items-start gap-6 overflow-x-auto rounded-lg border bg-background p-5 scrollbar-thin scrollbar-thumb-input scrollbar-thumb-rounded-md hover:bg-accent"
    >
      <MyButtonLabel :state="state" />
      <div v-show="!pending" v-for="customer in data">
        <MyCardAvatar :data="customer"  />
      </div>
      <div v-if="pending">
        <span>Pending</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const { data, pending, error, refresh } = await useAsyncData('new-customers', () => $fetch('https://randomuser.me/api/?results=6'), {
  default: () => [],
  lazy: true,
  transform: (data: any) => {
    return data.results;
  }
});

const state = { icon: 'heroicons:plus', label: 'Add' };
</script>
