<template>
  <section class="grid gap-5 md:grid-cols-2">
    <template v-for="(c, i) in cardData" :key="i">
      <MyCardAnalytic :cardData="c"/>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { type CardState } from '~/components/my/CardAnalytic.vue';
const cardData = [
{ total: "Total Revenue", icon: "heroicons:banknotes", account: "$45,231.89", description: "20% more than last month" },
{ total: "Sales", icon: "heroicons:credit-card", account: "$12,231", description: "13.2% more than last month" },
] as CardState[]
</script>
