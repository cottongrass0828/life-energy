<template>
  <div
    class="min-h-screen bg-cream font-sans text-text max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col"
  >
    <!-- Main -->
    <main class="flex-1 p-6 box-border overflow-y-auto no-scrollbar max-h-[90vh] relative">
      <component
        :is="currentViewComponent"
        :tasks="tasks"
        :goals="goals"
        :notes="notes"
        :categories="categories"
        @add-note="addNote"
        @update-note="updateNote"
        @delete-note="deleteNote"
        @add-task="addTask"
        @update-task="updateTask"
        @delete-task="deleteTask"
        @add-goal="addGoal"
        @update-goal="updateGoal"
        @delete-goal="deleteGoal"
        @set-categories="(c) => (categories = c)"
        @import-data="handleImport"
        @change-view="(v) => (view = v)"
      />
    </main>

    <!-- Bottom Navigation -->
    <nav
      class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 h-20 pb-4 px-6 flex justify-between items-center z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]"
    >
      <NavItem
        icon="fa-home"
        label="首頁"
        :active="view === 'dashboard'"
        @click="view = 'dashboard'"
      />
      <NavItem
        icon="fa-list-check"
        label="清單"
        :active="view === 'lifelist'"
        @click="view = 'lifelist'"
      />
      <NavItem
        icon="fa-pen-nib"
        label="筆記"
        :active="view === 'notes'"
        @click="view = 'notes'"
      />
      <NavItem
        icon="fa-calendar-day"
        label="日曆"
        :active="view === 'calendar'"
        @click="view = 'calendar'"
      />
      <NavItem
        icon="fa-th-large"
        label="象限"
        :active="view === 'matrix'"
        @click="view = 'matrix'"
      />
      <NavItem
        icon="fa-user-cog"
        label="設定"
        :active="view === 'settings'"
        @click="view = 'settings'"
      />
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStorage } from './composables/useStorage'
import { generateId } from './utils/date'

import NavItem from './components/atoms/NavItem.vue'
import DashboardView from './components/views/DashboardView.vue'
import LifeListView from './components/views/LifeListView.vue'
import NotesView from './components/views/NotesView.vue'
import CalendarView from './components/views/CalendarView.vue'
import MatrixView from './components/views/MatrixView.vue'
import SettingsView from './components/views/SettingsView.vue'

const view = ref('dashboard')

// data
const notes = useStorage('le_notes', [])
const goals = useStorage('le_goals', [])
const tasks = useStorage('le_tasks', [])
const categories = useStorage('le_categories', ['生活', '工作', '學習', '健康', '財富'])

// notes
const addNote = (n) => notes.value.unshift({ ...n, id: generateId() })
const updateNote = (id, n) => {
  const idx = notes.value.findIndex(x => x.id === id)
  if (idx !== -1) notes.value[idx] = n
}
const deleteNote = (id) => (notes.value = notes.value.filter(n => n.id !== id))

// goals
const addGoal = (g) => goals.value.push({ ...g, id: generateId() })
const updateGoal = (id, g) => {
  const idx = goals.value.findIndex(x => x.id === id)
  if (idx !== -1) goals.value[idx] = g
}
const deleteGoal = (id) => {
  goals.value = goals.value.filter(g => g.id !== id)
  tasks.value = tasks.value.filter(t => t.goalId !== id)
}

// recurrence helper
function handleRecurrence (task) {
  if (!task.recurrence) return
  const { frequency, interval, type, count, endDate } = task.recurrence
  if (type === 'count' && count <= 1) return
  if (type === 'until' && new Date() > new Date(endDate)) return

  const nextStart = new Date(task.startDate)
  const nextEnd = new Date(task.deadline)
  const addFn = { daily: 'setDate', weekly: 'setDate', monthly: 'setMonth', yearly: 'setFullYear' }
  const getFn = (fn) => 'get' + fn.slice(3)
  const addVal = { daily: interval, weekly: interval * 7, monthly: interval, yearly: interval }

  nextStart[addFn[frequency]](nextStart[getFn(addFn[frequency])]() + addVal[frequency])
  nextEnd[addFn[frequency]](nextEnd[getFn(addFn[frequency])]() + addVal[frequency])

  if (type === 'until' && nextStart > new Date(endDate)) return

  const newTask = {
    ...task,
    id: generateId(),
    startDate: nextStart.toISOString(),
    deadline: nextEnd.toISOString(),
    completed: false,
    completedDate: null,
    recurrence: { ...task.recurrence, count: type === 'count' ? count - 1 : count }
  }
  setTimeout(() => { tasks.value.push(newTask); alert('已自動建立下一個循環任務！') }, 100)
}

// tasks
const addTask = (t) => tasks.value.push({ ...t, id: generateId(), completed: false })
const updateTask = (id, updates) => {
  const idx = tasks.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    const original = tasks.value[idx]
    if (updates.completed && !original.completed && original.recurrence) handleRecurrence(original)
    tasks.value[idx] = {
      ...original,
      ...updates,
      completedDate: updates.completed ? new Date().toISOString() : (updates.completed === false ? null : original.completedDate)
    }
  }
}
const deleteTask = (id) => (tasks.value = tasks.value.filter(t => t.id !== id))

// import
const handleImport = (data) => {
  if (data.notes) notes.value = data.notes
  if (data.goals) goals.value = data.goals
  if (data.tasks) tasks.value = data.tasks
  if (data.categories) categories.value = data.categories
}

const currentViewComponent = computed(() => ({
  dashboard: DashboardView,
  lifelist: LifeListView,
  notes: NotesView,
  calendar: CalendarView,
  matrix: MatrixView,
  settings: SettingsView
}[view.value]))
</script>
