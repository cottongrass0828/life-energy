<template>
  <div class="pb-24 space-y-6">
    <h1 class="flex justify-between items-center font-rounded">
      <span class="text-2xl font-bold text-text ">回顧與設定</span>
      <span class="text-slate-300 text-xs mr-2">
        v{{ version }}
      </span>
    </h1>

    <div class="grid grid-cols-2 gap-4">
      <div class="cute-card p-4 text-center flex flex-col items-center justify-center">
        <div class="text-3xl font-bold text-primary mb-1">{{ stats.completedTasks }}</div>
        <div class="text-xs text-gray-500">已完成任務</div>
      </div>
      <div class="cute-card p-4 text-center flex flex-col items-center justify-center">
        <div class="text-3xl font-bold text-secondary mb-1">{{ stats.completionRate }}<span class="text-sm">%</span>
        </div>
        <div class="text-xs text-gray-500">總達成率</div>
      </div>
      <div class="cute-card p-4 text-center flex flex-col items-center justify-center">
        <div class="text-3xl font-bold text-yellow-400 mb-1 flex items-center"><i
            class="fa-solid fa-bolt text-2xl mr-1"></i> {{ stats.averageDailyEnergy }}</div>
        <div class="text-xs text-gray-500">平均消耗能量</div>
        <div class="text-xs text-gray-500">(總消耗能量: {{ stats.totalEnergyConsumed }})</div>
      </div>
      <div class="cute-card p-4 text-center flex flex-col items-center justify-center">
        <div class="text-lg font-bold text-purple-400 mb-1">{{ stats.mostProductiveDay }}</div>
        <div class="text-xs text-gray-500">最有行動力</div>
      </div>
    </div>
    <div class="cute-card p-5">
      <h3 class="font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
        <i class="fa-solid fa-trophy text-yellow-400"></i> 已達成目標
      </h3>
      <ul class="space-y-3">
        <li
          v-for="goal in stats.finishedGoals"
          class="text-sm flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg"
        >
          <i class="fa-solid fa-check-circle text-secondary"></i> {{ goal.title }}
        </li>
        <li
          v-if="stats.finishedGoals.length === 0"
          class="text-xs text-center py-4 text-gray-400 border border-dashed rounded-lg"
        >
          還沒有完全達成的大目標，繼續加油！✨
        </li>
      </ul>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        @click="isCatModalOpen = true"
        class="bg-white p-4 rounded-3xl shadow-soft text-left hover:bg-gray-50 transition"
      >
        <i class="fas fa-tags text-secondary text-2xl mb-2"></i>
        <div class="font-bold text-sm">分類管理</div>
      </button>
      <button
        @click="isOverdueModalOpen = true"
        class="bg-white p-4 rounded-3xl shadow-soft text-left hover:bg-gray-50 transition relative"
      >
        <i class="fas fa-history text-danger text-2xl mb-2"></i>
        <span
          v-if="overdueTasks.length > 0"
          class="absolute top-3 right-3 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
        >{{
          overdueTasks.length }}</span>
        <div class="font-bold text-sm">過期整理</div>
      </button>
    </div>

    <div class="bg-white p-5 rounded-3xl shadow-soft space-y-3">
      <button
        @click="handleExport"
        class="w-full bg-gray-50 p-3 rounded-xl flex items-center justify-between hover:bg-gray-100"
      >
        <span class="text-sm font-medium"><i class="fas fa-download mr-2 text-primary"></i> 備份資料</span><i
          class="fas fa-chevron-right text-gray-300"
        ></i>
      </button>
      <label
        class="w-full bg-gray-50 p-3 rounded-xl flex items-center justify-between hover:bg-gray-100 cursor-pointer">
        <span class="text-sm font-medium"><i class="fas fa-upload mr-2 text-secondary"></i> 還原資料</span>
        <input
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileImport"
        ><i class="fas fa-chevron-right text-gray-300"></i>
      </label>
    </div>

    <Modal
      :is-open="isCatModalOpen"
      title="管理分類"
      @close="isCatModalOpen = false"
    >
      <div class="flex gap-2 mb-4">
        <input
          type="text"
          v-model="newCategory"
          placeholder="輸入新分類..."
          class="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none"
        >
        <button
          @click="handleAddCategory"
          class="bg-secondary text-teal-800 px-4 rounded-xl text-sm font-bold"
        >新增</button>
      </div>
      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
          v-for="cat in categories"
          :key="cat"
          class="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl"
        >
          <template v-if="editingCat.original === cat">
            <input
              v-model="editingCat.new"
              class="border rounded px-2 py-1 text-sm flex-1 mr-2"
            >
            <button
              @click="handleUpdateCategory"
              class="text-green-500"
            ><i class="fas fa-check"></i></button>
          </template>
          <template v-else>
            <span>{{ cat }}</span>
            <div class="flex gap-2">
              <button
                @click="editingCat.original = cat; editingCat.new = cat"
                class="text-gray-400 hover:text-primary"
              ><i class="fas fa-pen"></i></button>
              <button
                @click="handleDeleteCategory(cat)"
                class="text-gray-400 hover:text-red-400"
              ><i class="fas fa-trash"></i></button>
            </div>
          </template>
        </div>
      </div>
    </Modal>

    <Modal
      :is-open="isOverdueModalOpen"
      title="過期任務"
      @close="isOverdueModalOpen = false"
    >
      <div
        v-if="overdueTasks.length === 0"
        class="text-center py-8 text-gray-400"
      >太棒了！沒有過期的任務</div>
      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="task in overdueTasks"
          :key="task.id"
          class="bg-gray-50 p-3 rounded-xl"
        >
          <div class="flex justify-between mb-2">
            <span class="font-bold text-sm truncate">{{ task.title }}</span>
            <span class="text-xs text-red-400">{{ formatDate(task.deadline) }}</span>
          </div>
          <div class="flex gap-2 justify-end">
            <button
              @click="handleReschedule(task, 0)"
              class="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg"
            >今天</button>
            <button
              @click="handleReschedule(task, 1)"
              class="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg"
            >明天</button>
            <button
              @click="$emit('delete-task', task.id)"
              class="text-[10px] text-red-400 border border-gray-200 px-2 py-1 rounded-lg"
            >刪除</button>
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
import pkg from '../../../package.json'

const version = pkg.version

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

const overdueTasks = computed(() => {
  const now = new Date()
  return props.tasks.filter(t => t.deadline && new Date(t.deadline) < now && !t.completed)
})
const stats = computed(() => {
  const finished = props.tasks.filter(t => t.completed);
  const days = new Set(finished.map(t => formatDate(t.completedDate)));
  const totalEnergyConsumed = finished.reduce((a, b) => a + (b.estimatedEnergy || 0), 0)
  return {
    completedTasks: finished.length,
    completionRate: props.tasks.length ? Math.round((finished.length / props.tasks.length) * 100) : 0,
    totalEnergyConsumed,
    averageDailyEnergy: days.size > 0 ? (totalEnergyConsumed / days.size).toFixed(1) : 0,
    mostProductiveDay: '統計中...',
    finishedGoals: props.goals.filter(g => {
      const ts = props.tasks.filter(t => t.goalId === g.id);
      return ts.length > 0 && ts.every(t => t.completed);
    })
  };
});

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
