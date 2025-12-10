<template>
  <button
    class="flex flex-col items-center justify-center w-full h-full transition-all duration-300"
    :class="active ? 'text-primary transform -translate-y-1' : 'text-gray-400'"
  >
    <i :class="['fas', icon, 'text-xl mb-1']"></i>
    <span class="text-[10px] font-medium font-rounded">{{ label }}</span>
  </button>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

defineOptions({
  name: 'NavItem'
})
defineProps({
  icon: String,
  label: String,
  active: Boolean,
})

</script>
