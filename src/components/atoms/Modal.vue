<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity">
        <div
            class="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transition-transform transform translate-y-0 opacity-100">
            <div class="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-white z-10">
                <h3 class="text-lg font-bold text-text font-rounded">{{ title }}</h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-5 overflow-y-auto custom-scroll">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>

defineOptions({
    name: 'Modal'
})

defineProps({
    isOpen: Boolean,
    title: String
})

defineEmits(['close'])
</script>
