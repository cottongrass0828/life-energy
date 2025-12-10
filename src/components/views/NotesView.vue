<template>
  <div class="pb-24 space-y-6">
    <h1 class="text-2xl font-bold text-text font-rounded">心情隨筆</h1>

    <div
      class="bg-white p-5 rounded-3xl shadow-soft border-2 transition-colors"
      :class="editingId ? 'border-primary/50' : 'border-transparent'"
    >
      <div
        v-if="editingId"
        class="text-xs text-primary font-bold mb-2"
      >正在編輯筆記...</div>
      <textarea
        v-model="noteForm.content"
        class="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none resize-none h-24 mb-3"
        placeholder="今天發生了什麼好玩的事？..."
      ></textarea>
      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="m in ['happy', 'calm', 'tired', 'sad']"
          :key="m"
          @click="noteForm.mood = m"
          :class="['text-xl p-2 rounded-full transition', noteForm.mood === m ? 'bg-secondary transform scale-110' : 'bg-gray-50']"
        >
          {{ getMoodIcon(m) }}
        </button>
      </div>
      <div class="flex gap-2">
        <input
          type="text"
          v-model="noteForm.tags"
          placeholder="標籤 (用逗號分隔)"
          class="flex-1 bg-gray-50 rounded-xl px-3 text-sm outline-none"
        >
        <button
          v-if="editingId"
          @click="cancelEdit"
          class="text-gray-400 px-3 py-2 text-sm"
        >取消</button>
        <button
          @click="handleSave"
          class="bg-secondary text-teal-800 px-6 py-2 rounded-xl font-bold shadow-cute text-sm"
        >{{ editingId ?
          '更新' : '紀錄' }}</button>
      </div>
    </div>

    <div class="flex overflow-x-auto no-scrollbar gap-2 pb-2">
      <button
        @click="filterTag = ''"
        :class="['whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold', filterTag === '' ? 'bg-text text-white' : 'bg-white text-subtext']"
      >全部</button>
      <button
        v-for="t in allTags"
        :key="t"
        @click="filterTag = t"
        :class="['whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold', filterTag === t ? 'bg-primary text-white' : 'bg-white text-subtext']"
      >#{{
        t }}</button>
    </div>

    <div class="space-y-4">
      <div
        v-for="note in filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date))"
        :key="note.id"
        class="bg-white p-4 rounded-3xl shadow-soft flex gap-4 group"
      >
        <div class="flex flex-col items-center">
          <span class="text-2xl">{{ getMoodIcon(note.mood) }}</span>
          <div class="h-full w-0.5 bg-gray-100 mt-2 rounded-full"></div>
        </div>
        <div class="flex-1 pb-2">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs text-subtext">{{ formatDateTime(note.date) }}</span>
            <div class="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                @click="startEdit(note)"
                class="text-gray-300 hover:text-primary text-xs"
              ><i class="fas fa-pen"></i></button>
              <button
                @click="$emit('delete-note', note.id)"
                class="text-gray-300 hover:text-red-400 text-xs"
              ><i class="fas fa-times"></i></button>
            </div>
          </div>
          <p class="text-text text-sm mb-2 leading-relaxed whitespace-pre-wrap">{{ note.content }}</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in note.tags"
              :key="t"
              class="text-[10px] bg-gray-100 text-subtext px-2 py-0.5 rounded-md"
            >#{{ t }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getMoodIcon, formatDateTime } from '../../utils/date'

const props = defineProps({
  notes: Array
})
const emit = defineEmits(['add-note', 'update-note', 'delete-note'])

const noteForm = ref({ content: '', mood: 'happy', tags: '', date: new Date().toISOString() })
const editingId = ref(null)
const filterTag = ref('')

const allTags = computed(() => [...new Set(props.notes.flatMap(n => n.tags))])
const filteredNotes = computed(() => filterTag.value ? props.notes.filter(n => n.tags.includes(filterTag.value)) : props.notes)

const startEdit = (n) => { editingId.value = n.id; noteForm.value = { ...n, tags: n.tags.join(', ') } }
const cancelEdit = () => { editingId.value = null; noteForm.value = { content: '', mood: 'happy', tags: '', date: new Date().toISOString() } }

const handleSave = () => {
  if (!noteForm.value.content) return
  const tagsArray = noteForm.value.tags.split(/,|，/).map(t => t.trim()).filter(t => t)
  const payload = { ...noteForm.value, tags: tagsArray }

  if (editingId.value) emit('update-note', editingId.value, payload)
  else emit('add-note', payload)
  cancelEdit()
}
</script>
