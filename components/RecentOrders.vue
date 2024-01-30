<template>
  <div class="mt-5">
    <p class="font-bold text-primary">Recent orders</p>

    <div
      class="mt-5 overflow-x-auto rounded-md border bg-background scrollbar-thin scrollbar-thumb-input scrollbar-thumb-rounded-md"
    >
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b text-left text-xs">
            <th class="p-4 font-medium uppercase text-muted-foreground">Product</th>
            <th class="p-4 font-medium uppercase text-muted-foreground">Payment</th>
            <th class="p-4 font-medium uppercase text-muted-foreground">Status</th>
            <th class="p-4 font-medium uppercase text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, i) in recentOrders" :key="i" class="border-b text-left text-sm last:border-b-0 hover:bg-muted">
            <td class="p-4">{{ o.product }}</td>
            <td class="p-4">{{ o.payment }}</td>
            <td class="p-4">{{ o.status }}</td>
            <td class="p-4">
              <div class="flex items-center justify-center gap-3">
                <button>
                  <Icon :name="o.icon" class="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const recentOrders = ref([
  { product: "Nike Shoes", payment: "Paid", status: 'Shipped', icon: "heroicons:pencil" },
  { product: "Iphone", payment: "Pending", status: 'waiting', icon: "heroicons:pencil" },
  { product: "TeeShirt", payment: "Paid", status: 'Shipped', icon: "heroicons:pencil" },
  { product: "Book", payment: "Pending", status: 'waiting', icon: "heroicons:pencil" },

])
</script>