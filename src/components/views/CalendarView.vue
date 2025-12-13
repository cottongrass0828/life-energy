<template>
  <div class="pb-24">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text font-rounded">行事曆</h1>
    </div>

    <!-- <div class="bg-gray-100 p-1 rounded-xl flex mb-6">
      <button
        v-for="v in ['month', 'week', '3day', 'day']"
        :key="v"
        @click="viewType = v; currentDate = new Date()"
        :class="['flex-1 py-1.5 text-xs font-bold rounded-lg transition-all', viewType === v ? 'bg-white text-primary shadow-sm' : 'text-gray-400']"
      >
        {{ v === 'month' ? '月' : (v === 'week' ? '週' : (v === '3day' ? '三日' : '日')) }}
      </button>
    </div> -->

    <div class="flex justify-between items-center mb-4 px-2">
      <button
        @click="changeTime(-1)"
        class="p-2 text-primary hover:bg-white rounded-full"
      ><i class="fas fa-chevron-left"></i></button>
      <span class="font-bold text-lg font-rounded">{{ viewType === 'month' ? currentDate.getFullYear() +
        '年' + (currentDate.getMonth() + 1) + '月' : formatDate(currentDate) }}</span>
      <button
        @click="changeTime(1)"
        class="p-2 text-primary hover:bg-white rounded-full"
      ><i class="fas fa-chevron-right"></i></button>
    </div>

    <!-- Month -->
    <div v-if="viewType === 'month'">
      <div class="bg-white p-4 rounded-3xl shadow-soft mb-6">
        <div class="grid grid-cols-7 gap-1 text-center mb-2">
          <span
            v-for="d in ['日', '一', '二', '三', '四', '五', '六']"
            :key="d"
            class="text-xs text-subtext"
          >{{ d
          }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, i) in monthGrid"
            :key="i"
            class="h-12 border-t border-gray-100 flex flex-col items-center pt-1"
            :class="getDayTasks(day).length > 0 ? 'bg-primary/5' : ''"
            @click="day && (selectedDate = day)"
          >
            <span
              v-if="day"
              :class="['text-xs', formatDate(day) === formatDate(new Date()) ? 'bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center' : '']"
            >
              {{ day.getDate() }}
            </span>
            <div
              v-if="day"
              class="flex gap-0.5 mt-1"
            >
              <div
                v-for="n in Math.min(getDayTasks(day).length, 3)"
                :key="n"
                class="w-1 h-1 bg-primary rounded-full"
              ></div>
            </div>
            <div
              v-if="day && getDayEnergy(day) > 0"
              class="text-[10px] text-orange-400 font-bold mt-auto mb-1"
            >
              <i class="fa-solid fa-bolt mr-1"></i>{{ getDayEnergy(day) }}
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 space-y-3">
        <h3 class="font-bold text-text mb-3 font-rounded">{{ formatDate(selectedDate) }} 詳細行程</h3>
        <div
          v-if="getDayTasks(selectedDate).length === 0"
          class="text-center text-gray-400 text-sm"
        >這一天是空白的畫布
        </div>
        <div
          v-for="task in getDayTasks(selectedDate)"
          :key="task.id"
          class="bg-white p-3 rounded-xl border-l-4 border-primary shadow-sm flex items-center gap-3"
        >
          <input
            type="checkbox"
            class="cute-checkbox"
            :checked="task.completed"
            @change="$emit('update-task', task.id, { completed: !task.completed })"
          >
          <div class="flex-1">
            <span :class="['font-bold text-sm', task.completed ? 'line-through text-gray-300' : 'text-text']">
              {{ task.title }}
            </span>
            <div
              v-if="task.isAllDay"
              class="text-[10px] text-gray-400"
            >
              整天
            </div>
            <div
              v-else
              class="text-[10px] text-gray-400"
            >
              {{ formatDateTime(task.startDate).split(' ')[1] }} - {{ formatDateTime(task.deadline).split(' ')[1] }}
            </div>
          </div>
          <div class="text-right text-sm">
            <i class="fa-solid fa-bolt text-yellow-400 mr-1"></i>
            <span class="text-orange-400">{{ task.estimatedEnergy }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="flex flex-col bg-white rounded-3xl shadow-soft h-[600px] overflow-hidden"
    >
      <div class="flex border-b border-gray-100 pl-12">
        <div
          v-for="date in displayDates"
          :key="date.toString()"
          class="flex-1 text-center py-2 border-l border-gray-50"
        >
          <div class="text-xs text-subtext">{{ ['日', '一', '二', '三', '四', '五', '六'][date.getDay()] }}</div>
          <div :class="['font-bold', formatDate(date) === formatDate(new Date()) ? 'text-primary' : 'text-text']">
            {{ date.getDate() }}</div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto relative">
        <div class="relative min-h-[1440px]">
          <div
            v-for="h in 24"
            :key="h"
            class="flex h-[60px] border-b border-gray-50 box-border"
          >
            <div class="w-12 text-right pr-2 text-xs text-gray-300 relative -top-2">{{ h - 1 }}:00</div>
          </div>
          <div class="absolute top-0 left-12 right-0 bottom-0 flex">
            <div
              v-for="date in displayDates"
              :key="date.toString()"
              class="flex-1 border-l border-gray-50 relative h-full"
            >
              <div
                v-for="task in getDayTasks(date, true)"
                :key="task.id"
                class="absolute left-0.5 right-0.5 rounded bg-primary/20 border-l-2 border-primary text-[10px] p-1 overflow-hidden hover:z-10 hover:bg-primary/30 cursor-pointer"
                :style="getTaskStyle(task, date)"
                @click="$emit('update-task', task.id, { completed: true })"
              >
                <div class="font-bold truncate">{{ task.title }}</div>
                <div class="text-gray-500">{{ formatDateTime(task.startDate).split(' ')[1] }}</div>
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

const props = defineProps({ tasks: Array, notes: Array })
const emit = defineEmits(['update-task'])

const viewType = ref('month')
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const changeTime = (offset) => {
  const d = new Date(currentDate.value)
  if (viewType.value === 'month') d.setMonth(d.getMonth() + offset)
  else if (viewType.value === 'week') d.setDate(d.getDate() + offset * 7)
  else if (viewType.value === '3day') d.setDate(d.getDate() + offset * 3)
  else d.setDate(d.getDate() + offset)
  currentDate.value = d
}

const displayDates = computed(() => {
  const start = new Date(currentDate.value); start.setHours(0, 0, 0, 0)
  const arr = []
  if (viewType.value === 'month') return []
  if (viewType.value === 'week') {
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); arr.push(d) }
  } else if (viewType.value === '3day') {
    for (let i = 0; i < 3; i++) { const d = new Date(start); d.setDate(start.getDate() + i); arr.push(d) }
  } else {
    arr.push(new Date(start))
  }
  return arr
})

const monthGrid = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const arr = new Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) arr.push(new Date(year, month, i))
  return arr
})

const getDayTasks = (date, isTimeGrid = false) => {
  if (!date) return []
  const dStr = formatDate(date)
  return props.tasks.filter(t => {
    if (!t.startDate || !t.deadline) return false
    if (isTimeGrid) {
      // if (t.isAllDay || t.completed) return false
      const tStart = new Date(t.startDate)
      const tEnd = new Date(t.deadline)
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)
      return tStart < dayEnd && tEnd > dayStart
    } else {
      return formatDate(t.startDate) <= dStr && formatDate(t.deadline) >= dStr
    }
  })
}

const getTaskStyle = (task, date) => {
  const tStart = new Date(task.startDate)
  const tEnd = new Date(task.deadline)
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)

  let startMins = (tStart.getHours() * 60) + tStart.getMinutes()
  let durationMins = (tEnd - tStart) / 60000

  if (tStart < dayStart) {
    startMins = 0
    durationMins -= (dayStart - tStart) / 60000
  }
  if (startMins + durationMins > 1440) durationMins = 1440 - startMins

  return { top: startMins + 'px', height: Math.max(20, durationMins) + 'px' }
}

const getDayEnergy = (date) => {
  if (!date) return 0;
  const dStr = formatDate(date);
  const dayTasks = props.tasks.filter(t => {
    if (!t.startDate || !t.deadline) return false;
    return formatDate(t.startDate) <= dStr && formatDate(t.deadline) >= dStr;
  });
  return dayTasks.reduce((acc, t) => acc + (parseInt(t.estimatedEnergy) || 0), 0);
};

</script>
