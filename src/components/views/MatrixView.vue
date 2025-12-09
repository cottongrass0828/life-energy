<template>
    <div class="h-full flex flex-col pb-20">
        <div
            class="mb-3 bg-blue-50 p-3 rounded-xl text-xs text-blue-600 flex items-start gap-2  border border-blue-100">
            <i class="fa-solid fa-circle-info mt-0.5 text-base"></i>
            <div>優先級矩陣幫助你決定「現在該做什麼」。</div>
        </div>
        <h1 class="text-2xl font-bold text-text mb-6 font-rounded">輕重緩急</h1>
        <div class="grid grid-cols-2 gap-3 flex-1">
            <div v-for="(card, key) in matrixTasks" :key="key"
                :class="['p-4 rounded-2xl min-h-40 flex flex-col', card.bg]">
                <h3 class="font-bold text-sm mb-1">{{ card.title }}</h3>
                <p class="text-[10px] opacity-70 mb-2">{{ card.desc }}</p>
                <div class="flex-1 overflow-y-auto space-y-1">
                    <div v-for="task in tasks.filter(task => !task.completed && card.filter(task))" :key="task.id"
                        class="bg-white/60 p-1.5 rounded text-xs truncate">
                        {{ task.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const matrixTasks = [
    { title: '馬上做', bg: 'bg-red-100 text-red-800', desc: '緊急且重要', filter: task => task.urgency && task.importance },
    { title: '計畫做', bg: 'bg-blue-100 text-blue-800', desc: '重要不緊急', filter: task => !task.urgency && task.importance },
    { title: '交給別人', bg: 'bg-yellow-100 text-yellow-800', desc: '緊急不重要', filter: task => task.urgency && !task.importance },
    { title: '最後做', bg: 'bg-gray-200 text-gray-800', desc: '不急不重要', filter: task => !task.urgency && !task.importance }
];

defineOptions({
    name: 'MatrixView'
})

defineProps({
    tasks: Array
})
</script>
