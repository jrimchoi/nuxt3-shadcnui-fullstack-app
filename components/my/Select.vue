<template>
    <Select>
      <SelectTrigger>
        <SelectValue :placeholder="state.label" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{{state.label}}</SelectLabel>
          <SelectItem v-for="(item, i) in state.items" :key="i" :value="item"> {{ item }} pages </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
</template>

<script lang="ts" setup>
export interface SelectState {
  label: String;
  items: Number[];
}
defineProps({
  state: {
    type: Object as PropType<SelectState>,
    required: true,
  },
});
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
</script>
