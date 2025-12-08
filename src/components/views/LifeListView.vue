<template>
    <div class="pb-24">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-text font-rounded">人生清單</h1>
            <div class="flex gap-2">
                <button @click="openAddTask(null)"
                    class="bg-secondary text-teal-800 px-3 py-2 rounded-xl text-xs font-bold shadow-cute">
                    <i class="fas fa-plus mr-1"></i> 待辦
                </button>
                <button @click="openAddGoal"
                    class="bg-primary text-white px-3 py-2 rounded-xl text-xs font-bold shadow-cute">
                    <i class="fas fa-plus mr-1"></i> 目標
                </button>
            </div>
        </div>

        <!-- Filter -->
        <div class="flex overflow-x-auto gap-2 mb-4 no-scrollbar">
            <button @click="filterCategory = 'All'"
                :class="['px-3 py-1 rounded-full text-xs whitespace-nowrap', filterCategory === 'All' ? 'bg-text text-white' : 'bg-gray-100 text-subtext']">全部</button>
            <button v-for="c in categories" :key="c" @click="filterCategory = c"
                :class="['px-3 py-1 rounded-full text-xs whitespace-nowrap', filterCategory === c ? 'bg-primary text-white' : 'bg-gray-100 text-subtext']">{{
                    c }}</button>
        </div>

        <div class="space-y-4">

            <!-- Unscheduled Inbox -->
            <div v-if="unscheduledTasks.length > 0 && filterCategory === 'All'"
                class="bg-white rounded-3xl shadow-soft overflow-hidden">
                <div @click="activeGoal = activeGoal === 'inbox' ? null : 'inbox'"
                    class="p-4 bg-gray-50/50 flex justify-between items-center cursor-pointer">
                    <h3 class="font-bold text-text"><i class="fas fa-inbox text-secondary mr-2"></i>待辦清單 (無目標)</h3>
                    <span class="bg-gray-200 text-xs px-2 py-0.5 rounded-full">{{ unscheduledTasks.length }}</span>
                </div>
                <div v-if="activeGoal === 'inbox'" class="p-4 space-y-2">
                    <div v-for="task in unscheduledTasks" :key="task.id"
                        class="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <input type="checkbox" class="cute-checkbox" :checked="task.completed"
                                @change="$emit('update-task', task.id, { completed: !task.completed })">
                            <div class="flex flex-col min-w-0">
                                <span
                                    :class="['truncate', task.completed ? 'line-through text-gray-300' : 'text-text']">{{
                                        task.title }}</span>
                                <span class="text-[10px] text-gray-400">
                                    {{ task.isAllDay ? '整天' : (task.deadline ? formatDateTime(task.deadline) : '待排程') }}
                                    <i v-if="task.recurrence" class="fas fa-repeat ml-2 text-secondary"></i>
                                </span>
                            </div>
                        </div>
                        <button @click="openEditTask(task)" class="text-gray-300 hover:text-primary"><i
                                class="fas fa-pen"></i></button>
                    </div>
                </div>
            </div>

            <!-- Goals List -->
            <div v-for="goal in filteredGoals" :key="goal.id"
                class="bg-white rounded-3xl shadow-soft overflow-hidden transition-all duration-300">
                <div @click="activeGoal = activeGoal === goal.id ? null : goal.id"
                    class="p-5 cursor-pointer hover:bg-gray-50 transition">
                    <div class="flex justify-between items-start mb-2">
                        <Badge color="bg-secondary/30 text-teal-700">{{ goal.category }}</Badge>
                        <div class="flex gap-2">
                            <button @click.stop="openEditGoal(goal)" class="text-gray-300 hover:text-primary"><i
                                    class="fas fa-pen"></i></button>
                            <button @click.stop="$emit('delete-goal', goal.id)"
                                class="text-gray-300 hover:text-red-400"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-text mb-2">{{ goal.title }}</h3>
                    <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-500"
                            :style="{ width: getGoalProgress(goal.id) + '%' }"></div>
                    </div>
                    <div class="flex justify-between text-xs text-subtext">
                        <span>期限: {{ formatDate(goal.deadline) || '無' }}</span>
                        <span>{{ getGoalProgress(goal.id) }}% 達成</span>
                    </div>
                </div>

                <div v-if="activeGoal === goal.id" class="bg-gray-50/50 p-4 border-t border-gray-100">
                    <div class="space-y-2 mb-4">
                        <div v-for="task in props.tasks.filter(t => t.goalId === goal.id)" :key="task.id"
                            class="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <input type="checkbox" class="cute-checkbox" :checked="task.completed"
                                    @change="$emit('update-task', task.id, { completed: !task.completed })">
                                <div class="flex flex-col min-w-0">
                                    <span
                                        :class="['truncate', task.completed ? 'line-through text-gray-300' : 'text-text']">{{
                                            task.title }}</span>
                                    <span class="text-[10px] text-gray-400">
                                        {{ task.isAllDay ? '整天' : (task.deadline ? formatDateTime(task.deadline) :
                                            '待排程') }}
                                        <i v-if="task.recurrence" class="fas fa-repeat ml-2 text-secondary"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <span v-if="task.urgency" class="text-red-400 text-xs font-bold">急</span>
                                <span v-if="task.importance" class="text-orange-400 text-xs font-bold">重</span>
                                <button @click="openEditTask(task)" class="text-gray-300 hover:text-primary"><i
                                        class="fas fa-pen text-xs"></i></button>
                                <button @click="$emit('delete-task', task.id)"
                                    class="text-gray-300 hover:text-red-400"><i
                                        class="fas fa-times text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                    <button @click="openAddTask(goal.id)"
                        class="w-full py-2 text-primary border border-primary border-dashed rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition">
                        <i class="fas fa-plus"></i> 新增細項任務
                    </button>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <Modal :is-open="isAddGoalOpen" :title="tempGoal.id ? '編輯目標' : '新增目標'" @close="isAddGoalOpen = false">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">目標標題</label>
                    <input type="text" v-model="tempGoal.title"
                        class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50">
                </div>
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">分類</label>
                    <select v-model="tempGoal.category" class="w-full bg-gray-50 p-3 rounded-xl outline-none">
                        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">截止日期 (可選)</label>
                    <input type="date" v-model="tempGoal.deadline"
                        class="w-full bg-gray-50 p-3 rounded-xl outline-none">
                </div>
                <button @click="handleGoalSave"
                    class="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-cute mt-4">儲存目標</button>
            </div>
        </Modal>

        <Modal :is-open="isAddTaskOpen" :title="tempTask.id ? '編輯任務' : '新增任務'" @close="isAddTaskOpen = false">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">任務內容</label>
                    <input type="text" v-model="tempTask.title"
                        class="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50">
                    <span v-if="taskErrors.title" class="text-red-400 text-xs">{{ taskErrors.title }}</span>
                </div>
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">所屬目標</label>
                    <select v-model="tempTask.goalId" class="w-full bg-gray-50 p-3 rounded-xl outline-none">
                        <option value="">(無目標 - 待辦事項)</option>
                        <option v-for="g in props.goals" :key="g.id" :value="g.id">{{ g.title }}</option>
                    </select>
                </div>

                <!-- Date & Time -->
                <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-subtext">時間設定</label>
                    <div class="flex items-center gap-2">
                        <label class="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" v-model="tempTask.isAllDay" class="accent-primary">
                            <span class="text-xs">整天</span>
                        </label>
                        <button v-if="tempTask.startDate" @click="tempTask.startDate = null; tempTask.deadline = null"
                            class="text-xs text-red-400 border border-red-200 px-2 py-0.5 rounded">清除</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4" :class="{ 'opacity-50': !tempTask.startDate }">
                    <div>
                        <label class="block text-xs text-subtext mb-1">開始</label>
                        <input :type="tempTask.isAllDay ? 'date' : 'datetime-local'"
                            :value="tempTask.isAllDay ? (tempTask.startDate ? tempTask.startDate.split('T')[0] : '') : toInputDateTime(tempTask.startDate)"
                            @input="e => { const val = e.target.value; const iso = tempTask.isAllDay ? (val ? val + 'T00:00:00.000Z' : '') : (val ? new Date(val).toISOString() : ''); tempTask.startDate = iso; if (iso && !tempTask.deadline) tempTask.deadline = iso; }"
                            class="w-full bg-gray-50 p-3 rounded-xl outline-none text-xs">
                    </div>
                    <div>
                        <label class="block text-xs text-subtext mb-1">結束</label>
                        <input :type="tempTask.isAllDay ? 'date' : 'datetime-local'"
                            :value="tempTask.isAllDay ? (tempTask.deadline ? tempTask.deadline.split('T')[0] : '') : toInputDateTime(tempTask.deadline)"
                            @input="e => { const val = e.target.value; const iso = tempTask.isAllDay ? (val ? val + 'T23:59:59.999Z' : '') : (val ? new Date(val).toISOString() : ''); tempTask.deadline = iso; }"
                            class="w-full bg-gray-50 p-3 rounded-xl outline-none text-xs">
                    </div>
                </div>
                <span v-if="taskErrors.date" class="text-red-400 text-xs">{{ taskErrors.date }}</span>

                <!-- Recurrence -->
                <div class="bg-gray-50 p-3 rounded-xl">
                    <div @click="toggleRecurrence" class="flex justify-between items-center cursor-pointer">
                        <span class="text-sm font-bold" :class="tempTask.recurrence ? 'text-primary' : 'text-subtext'">
                            <i class="fas fa-repeat mr-1"></i> 重複設定
                        </span>
                        <i v-if="tempTask.recurrence" class="fas fa-check text-primary"></i>
                    </div>
                    <div v-if="tempTask.recurrence" class="mt-3 space-y-2 text-sm border-t border-gray-200 pt-2">
                        <div class="flex gap-2">
                            <span>每</span>
                            <input type="number" min="1" v-model.number="tempTask.recurrence.interval"
                                class="w-12 text-center border rounded">
                            <select v-model="tempTask.recurrence.frequency" class="border rounded bg-white">
                                <option value="daily">天</option>
                                <option value="weekly">週</option>
                                <option value="monthly">月</option>
                                <option value="yearly">年</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="flex items-center gap-2"><input type="radio" value="forever"
                                    v-model="tempTask.recurrence.type"> 永遠</label>
                            <label class="flex items-center gap-2">
                                <input type="radio" value="count" v-model="tempTask.recurrence.type"> 重複
                                <input type="number" min="1" v-model.number="tempTask.recurrence.count"
                                    class="w-12 text-center border rounded"> 次
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" value="until" v-model="tempTask.recurrence.type"> 直到
                                <input type="date" v-model="tempTask.recurrence.endDate" class="border rounded">
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Energy & Matrix -->
                <div>
                    <label class="block text-sm font-bold text-subtext mb-1">預估能量 (1-10)</label>
                    <div class="flex items-center gap-3">
                        <input type="range" min="1" max="10" v-model.number="tempTask.estimatedEnergy"
                            class="flex-1 accent-primary">
                        <div class="w-10 text-center text-primary font-bold">{{ tempTask.estimatedEnergy }} ⚡</div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2 bg-gray-50 p-3 rounded-xl flex-1 cursor-pointer">
                        <input type="checkbox" v-model="tempTask.urgency" class="cute-checkbox"> <span
                            class="text-sm">🔥 緊急</span>
                    </label>
                    <label class="flex items-center gap-2 bg-gray-50 p-3 rounded-xl flex-1 cursor-pointer">
                        <input type="checkbox" v-model="tempTask.importance" class="cute-checkbox"> <span
                            class="text-sm">⭐ 重要</span>
                    </label>
                </div>
                <button @click="handleTaskSave"
                    class="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-cute mt-4">{{ tempTask.id ?
                        "更新" : "加入" }}</button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../atoms/Modal.vue'
import Badge from '../atoms/Badge.vue'
import { formatDate, formatDateTime, toInputDateTime } from '../../utils/date'


defineOptions({
    name: 'LifeListView'
})
const props = defineProps({
    goals: Array,
    tasks: Array,
    categories: Array
})

const emit = defineEmits(['add-goal', 'update-goal', 'delete-goal', 'add-task', 'update-task', 'delete-task'])

const activeGoal = ref(null)
const filterCategory = ref('All')


// modal states
const isAddGoalOpen = ref(false)
const isAddTaskOpen = ref(false)
const tempGoal = ref({})
const tempTask = ref({})
const taskErrors = ref({})

const unscheduledTasks = computed(() => props.tasks.filter(t => !t.goalId))
const filteredGoals = computed(() => filterCategory.value === 'All' ? props.goals : props.goals.filter(g => g.category === filterCategory.value))

const openAddGoal = () => { tempGoal.value = { title: '', category: props.categories[0] || '生活', deadline: '' }; isAddGoalOpen.value = true }
const openEditGoal = (g) => { tempGoal.value = { ...g }; isAddGoalOpen.value = true }

const openAddTask = (goalId) => {
    const now = new Date()
    const end = new Date(now.getTime() + 60 * 60 * 1000)
    tempTask.value = {
        goalId: goalId || '', title: '', urgency: false, importance: false,
        estimatedEnergy: 3, startDate: now.toISOString(), deadline: end.toISOString(), isAllDay: false, recurrence: null
    }
    taskErrors.value = {}
    isAddTaskOpen.value = true
}
const openEditTask = (t) => {
    tempTask.value = { ...t, goalId: t.goalId || '' }
    taskErrors.value = {}
    isAddTaskOpen.value = true
}

const handleGoalSave = () => {
    if (!tempGoal.value.title) return
    if (tempGoal.value.id) emit('update-goal', tempGoal.value.id, tempGoal.value)
    else emit('add-goal', tempGoal.value)
    isAddGoalOpen.value = false
}

const handleTaskSave = () => {
    const errors = {}
    if (!tempTask.value.title) errors.title = '請輸入標題'
    if (tempTask.value.startDate && tempTask.value.deadline && new Date(tempTask.value.startDate) > new Date(tempTask.value.deadline)) {
        errors.date = '結束時間不能早於開始時間'
    }
    taskErrors.value = errors
    if (Object.keys(errors).length > 0) return

    const t = { ...tempTask.value }
    if (!t.startDate) t.startDate = null
    if (!t.deadline) t.deadline = null

    if (t.id) emit('update-task', t.id, t)
    else emit('add-task', t)
    isAddTaskOpen.value = false
}

const toggleRecurrence = () => {
    if (tempTask.value.recurrence) tempTask.value.recurrence = null
    else tempTask.value.recurrence = { frequency: 'weekly', interval: 1, type: 'forever', count: 1, endDate: '' }
}

const getGoalProgress = (gid) => {
    const sub = props.tasks.filter(t => t.goalId === gid)
    if (sub.length === 0) return 0
    return Math.round((sub.filter(t => t.completed).length / sub.length) * 100)
}
</script>
