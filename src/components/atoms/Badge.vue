<template>
  <span :class="['px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap', color]">
    <slot></slot>
  </span>
</template>

<script setup lang='ts'>
defineOptions({
  name: 'Badge'
})
const props = defineProps({
  color: {
    type: String,
    default: 'bg-gray-100 text-gray-600'
  }
})

</script>
