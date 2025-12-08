<template>
    <div class="h-full flex flex-col pb-20">
        <h1 class="text-2xl font-bold text-text mb-6 font-rounded">輕重緩急</h1>
        <div class="grid grid-cols-2 gap-3 flex-1">
            <div v-for="(card, i) in [
                { title: '馬上做', bg: 'bg-red-100 text-red-800', desc: '緊急且重要', filter: t => t.urgency && t.importance },
                { title: '計畫做', bg: 'bg-blue-100 text-blue-800', desc: '重要不緊急', filter: t => !t.urgency && t.importance },
                { title: '交給別人', bg: 'bg-yellow-100 text-yellow-800', desc: '緊急不重要', filter: t => t.urgency && !t.importance },
                { title: '最後做', bg: 'bg-gray-200 text-gray-800', desc: '不急不重要', filter: t => !t.urgency && !t.importance }
            ]" :key="i" :class="['p-4 rounded-2xl min-h-[160px] flex flex-col', card.bg]">
                <h3 class="font-bold text-sm mb-1">{{ card.title }}</h3>
                <p class="text-[10px] opacity-70 mb-2">{{ card.desc }}</p>
                <div class="flex-1 overflow-y-auto space-y-1">
                    <div v-for="t in tasks.filter(t => !t.completed && card.filter(t))" :key="t.id"
                        class="bg-white/60 p-1.5 rounded text-xs truncate">
                        {{ t.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang='ts'>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
    name: 'MatrixView'
})
defineProps({ tasks: Array })

const emit = defineEmits([])

defineExpose({})

const { t } = useI18n()
</script>
