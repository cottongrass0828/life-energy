<template>
  <div class="space-y-6 pb-20">
    <div class="flex justify-between items-end">
      <div>
        <p class="text-subtext text-sm">早安，今天也要充滿能量！</p>
        <h1 class="text-2xl font-bold text-text font-rounded">我的儀表板</h1>
      </div>
      <div class="text-right">
        <span class="text-3xl font-bold text-primary font-rounded">{{ formatDate(new Date()).slice(5) }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center">
        <div class="text-3xl mb-2">🔥</div>
        <span class="text-sm text-subtext">今日耗能預估</span>
        <span class="text-xl font-bold text-text font-rounded">{{ totalEnergy }} <span class="text-xs">pts</span></span>
      </div>
      <div class="bg-white p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center">
        <div class="text-3xl mb-2">✨</div>
        <span class="text-sm text-subtext">今日已達成</span>
        <span class="text-xl font-bold text-text font-rounded">{{ completedToday }} <span
            class="text-xs">個任務</span></span>
      </div>
    </div>

    <div class="bg-primary/10 p-4 rounded-3xl">
      <label class="text-sm font-bold text-text mb-2 block font-rounded">
        <i class="fa-solid fa-pen-fancy text-secondary mr-2"></i>隨手記
      </label>
      <div class="flex gap-2">
        <input
          type="text"
          v-model="noteContent"
          placeholder="在想什麼呢？..."
          class="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
        >
        <button
          @click="handleQuickNote"
          class="bg-primary text-white rounded-xl w-10 h-10 shadow-cute active:shadow-none active:translate-y-1 transition-all"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold text-text font-rounded">今日焦點</h2>
        <button
          @click="emit('change-view', 'calendar')"
          class="text-sm text-primary"
        >查看全部</button>
      </div>
      <div class="space-y-3">
        <div
          v-if="todayTasks.length === 0"
          class="text-center py-8 text-gray-400 bg-white rounded-3xl"
        >
          <i class="fas fa-mug-hot mb-2 text-2xl"></i>
          <p>今天沒有安排特別的任務，放鬆一下吧！</p>
        </div>
        <div
          v-for="task in todayTasks"
          :key="task.id"
          class="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between"
        >
          <div class="flex items-center gap-3 w-full overflow-hidden">
            <input
              type="checkbox"
              class="cute-checkbox"
              :checked="task.completed"
              @change="toggleTask(task)"
            >
            <div class="flex-1 min-w-0">
              <p class="font-bold text-text truncate">{{ task.title }}</p>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  :class="['w-2 h-2 rounded-full shrink-0', task.urgency && task.importance ? 'bg-red-400' : 'bg-green-400']"
                ></span>
                <span class="text-xs text-subtext flex items-center gap-1">
                  <i class="fas fa-bolt text-yellow-400 text-[10px]"></i> {{ task.estimatedEnergy }}
                  <span class="ml-2 text-[10px] text-gray-300">
                    {{ generateTaskTime(task) }}
                  </span>
                  <i
                    v-if="task.recurrence"
                    class="fas fa-repeat text-secondary text-[10px] ml-1"
                  ></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDate, formatDateTime } from '../../utils/date'

defineOptions({
  name: 'DashboardView'
})
const props = defineProps({
  tasks: Array,
  notes: Array
})

const emit = defineEmits(['add-note', 'update-task', 'change-view'])
const noteContent = ref('')
const todayStr = formatDate(new Date())

const todayTasks = computed(() => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

  return props.tasks.filter(t => {
    if (t.completed) return false
    if (!t.startDate && !t.deadline) return false
    const start = new Date(t.startDate)
    const end = new Date(t.deadline)
    if (t.isAllDay) {
      return todayStr >= formatDate(start) && todayStr <= formatDate(end)
    }
    return start <= todayEnd && end >= todayStart
  })
})

const completedToday = computed(() => props.tasks.filter(t => t.completed && formatDate(t.completedDate) === todayStr).length)
const totalEnergy = computed(() => todayTasks.value.reduce((acc, t) => acc + (parseInt(t.estimatedEnergy) || 0), 0))

const handleQuickNote = () => {
  if (!noteContent.value.trim()) return
  emit('add-note', { content: noteContent.value, mood: 'calm', tags: ['隨手記'], date: new Date().toISOString() })
  noteContent.value = ''
}

const toggleTask = (task) => emit('update-task', task.id, { completed: !task.completed })

function generateTaskTime (task) {
  return task.isAllDay ? '整天' : (task.deadline ? formatDateTime(task.deadline).split(' ')[1] : '')
}
</script>
