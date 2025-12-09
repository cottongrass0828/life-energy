<template>
    <div class="pb-24 space-y-6">
        <h1 class="text-2xl font-bold text-text font-rounded">回顧與設定</h1>

        <div class="bg-primary text-white p-6 rounded-3xl shadow-cute relative overflow-hidden">
            <div class="relative z-10">
                <h2 class="text-lg font-medium mb-4 font-rounded">累積成就</h2>
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <div class="text-4xl font-bold mb-1">{{ completedTasks }}</div>
                        <div class="text-sm opacity-80">完成任務</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-1">{{ totalEnergy }}</div>
                        <div class="text-sm opacity-80">消耗能量</div>
                    </div>
                </div>
            </div>
            <div class="absolute -right-4 -bottom-4 text-9xl opacity-20">🏆</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <button @click="isCatModalOpen = true"
                class="bg-white p-4 rounded-3xl shadow-soft text-left hover:bg-gray-50 transition">
                <i class="fas fa-tags text-secondary text-2xl mb-2"></i>
                <div class="font-bold text-sm">分類管理</div>
            </button>
            <button @click="isOverdueModalOpen = true"
                class="bg-white p-4 rounded-3xl shadow-soft text-left hover:bg-gray-50 transition relative">
                <i class="fas fa-history text-danger text-2xl mb-2"></i>
                <span v-if="overdueTasks.length > 0"
                    class="absolute top-3 right-3 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{{
                        overdueTasks.length }}</span>
                <div class="font-bold text-sm">過期整理</div>
            </button>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-soft space-y-3">
            <button @click="handleExport"
                class="w-full bg-gray-50 p-3 rounded-xl flex items-center justify-between hover:bg-gray-100">
                <span class="text-sm font-medium"><i class="fas fa-download mr-2 text-primary"></i> 備份資料</span><i
                    class="fas fa-chevron-right text-gray-300"></i>
            </button>
            <label
                class="w-full bg-gray-50 p-3 rounded-xl flex items-center justify-between hover:bg-gray-100 cursor-pointer">
                <span class="text-sm font-medium"><i class="fas fa-upload mr-2 text-secondary"></i> 還原資料</span>
                <input type="file" accept=".json" class="hidden" @change="handleFileImport"><i
                    class="fas fa-chevron-right text-gray-300"></i>
            </label>
        </div>

        <Modal :is-open="isCatModalOpen" title="管理分類" @close="isCatModalOpen = false">
            <div class="flex gap-2 mb-4">
                <input type="text" v-model="newCategory" placeholder="輸入新分類..."
                    class="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none">
                <button @click="handleAddCategory"
                    class="bg-secondary text-teal-800 px-4 rounded-xl text-sm font-bold">新增</button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto">
                <div v-for="cat in categories" :key="cat"
                    class="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl">
                    <template v-if="editingCat.original === cat">
                        <input v-model="editingCat.new" class="border rounded px-2 py-1 text-sm flex-1 mr-2">
                        <button @click="handleUpdateCategory" class="text-green-500"><i
                                class="fas fa-check"></i></button>
                    </template>
                    <template v-else>
                        <span>{{ cat }}</span>
                        <div class="flex gap-2">
                            <button @click="editingCat.original = cat; editingCat.new = cat"
                                class="text-gray-400 hover:text-primary"><i class="fas fa-pen"></i></button>
                            <button @click="handleDeleteCategory(cat)" class="text-gray-400 hover:text-red-400"><i
                                    class="fas fa-trash"></i></button>
                        </div>
                    </template>
                </div>
            </div>
        </Modal>

        <Modal :is-open="isOverdueModalOpen" title="過期任務" @close="isOverdueModalOpen = false">
            <div v-if="overdueTasks.length === 0" class="text-center py-8 text-gray-400">太棒了！沒有過期的任務</div>
            <div v-else class="space-y-4">
                <div v-for="task in overdueTasks" :key="task.id" class="bg-gray-50 p-3 rounded-xl">
                    <div class="flex justify-between mb-2">
                        <span class="font-bold text-sm truncate">{{ task.title }}</span>
                        <span class="text-xs text-red-400">{{ formatDate(task.deadline) }}</span>
                    </div>
                    <div class="flex gap-2 justify-end">
                        <button @click="handleReschedule(task, 0)"
                            class="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg">今天</button>
                        <button @click="handleReschedule(task, 1)"
                            class="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg">明天</button>
                        <button @click="$emit('delete-task', task.id)"
                            class="text-[10px] text-red-400 border border-gray-200 px-2 py-1 rounded-lg">刪除</button>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import Modal from '../atoms/Modal.vue'
import { formatDate } from '../../utils/date'

const props = defineProps({
    tasks: Array,
    goals: Array,
    categories: Array
})

const emit = defineEmits(['set-categories', 'import-data', 'update-task', 'delete-task'])

const isCatModalOpen = ref(false)
const isOverdueModalOpen = ref(false)
const newCategory = ref('')

const editingCat = reactive({ original: '', new: '' })

const completedTasks = computed(() => props.tasks.filter(t => t.completed).length)
const totalEnergy = computed(() => props.tasks.filter(t => t.completed).reduce((acc, t) => acc + (t.estimatedEnergy || 0), 0))
const overdueTasks = computed(() => {
    const now = new Date()
    return props.tasks.filter(t => t.deadline && new Date(t.deadline) < now && !t.completed)
})

const handleAddCategory = () => {
    if (newCategory.value && !props.categories.includes(newCategory.value)) {
        emit('set-categories', [...props.categories, newCategory.value])
        newCategory.value = ''
    }
}
const handleUpdateCategory = () => {
    if (editingCat.new && editingCat.new !== editingCat.original) {
        emit('set-categories', props.categories.map(c => c === editingCat.original ? editingCat.new : c))
    }
    editingCat.original = ''; editingCat.new = ''
}
const handleDeleteCategory = (cat) => {
    if (props.goals.some(g => g.category === cat)) return alert('此分類下還有目標，無法刪除！')
    emit('set-categories', props.categories.filter(c => c !== cat))
}

const handleExport = () => {
    const blob = new Blob([JSON.stringify({ tasks: props.tasks, goals: props.goals, categories: props.categories })], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'life_energy_backup.json'
    a.click()
}
const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        try { emit('import-data', JSON.parse(ev.target.result)); alert('匯入成功') } catch { alert('格式錯誤') }
    }
    reader.readAsText(file)
}

const handleReschedule = (task, days) => {
    const d = new Date(); d.setDate(d.getDate() + days); d.setHours(23, 59, 0, 0)
    emit('update-task', task.id, { deadline: d.toISOString() })
}
</script>
