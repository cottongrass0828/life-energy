<template>
  <div class="pb-24 space-y-6">
    <h1 class="text-2xl font-bold text-text font-rounded">心情隨筆</h1>

    <div
      class="bg-white p-5 rounded-3xl shadow-soft border-2 transition-colors"
      :class="editingId ? 'border-primary/50' : 'border-transparent'"
    >
      <div
        v-if="editingId"
        class="flex justify-between"
      >
        <div class="text-xs text-primary font-bold mb-2">正在編輯筆記...</div>
        <button
          @click="$emit('delete-note', noteForm.id)"
          class="text-red-400 px-3 py-2 text-sm"
        >刪除</button>
      </div>
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
          :class="['text-xl px-2 py-1 rounded-full transition', noteForm.mood === m ? 'bg-secondary transform scale-110' : 'bg-gray-50']"
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
        >{{ editingId ? '更新' : '紀錄' }}</button>
      </div>
    </div>

    <div class="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-1">
      <div class="flex-1">
        <button
          @click="filterTag = ''"
          :class="['whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold', filterTag === '' ? 'bg-text text-white' : 'bg-white text-subtext']"
        >全部</button>
        <button
          v-for="t in allTags"
          :key="t"
          @click="filterTag = t"
          :class="['whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold', filterTag === t ? 'bg-primary text-white' : 'bg-white text-subtext']"
        >#{{ t }}</button>
      </div>
      <button
        @click="exportTodayNotes"
        class="text-xs bg-white border border-secondary text-dark px-3 py-1.5 rounded-lg shadow-sm font-bold hover:bg-secondary hover:border-transparent transition flex items-center gap-1"
      >
        <i class="fa-solid fa-calendar-day text-secondary group-hover:text-dark"></i> 匯出今日
      </button>
    </div>
    <div class="flex gap-2 mb-4">
      <div class="relative flex-1">
        <i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="noteSearch"
          type="text"
          placeholder="搜尋筆記內容或標籤..."
          class="cute-input pl-10 py-2 text-sm border-white shadow-sm"
        >
        <button
          v-if="noteSearch"
          @click="noteSearch = ''"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="filteredNotes.length === 0"
        class="text-center text-gray-400 py-10 flex flex-col items-center"
      >
        <i class="fa-solid fa-wind text-2xl mb-2 opacity-50"></i>
        <span>沒有符合的筆記</span>
        <button
          v-if="noteSearch"
          @click="noteSearch = ''"
          class="text-primary text-sm underline mt-2"
        >清除搜尋</button>
      </div>
      <div class="space-y-6">
        <div
          v-for="group in groupedNotes"
          :key="group.title"
        >
          <!-- Month Header -->
          <div class="sticky-header">
            <span
              class="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm"
            >
              {{ group.title }}
            </span>
          </div>
          <div class="space-y-3">
            <div
              v-for="note in group.items"
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
      </div>
    </div>

    <Modal
      :is-open="isExportOpen"
      title="匯出選項"
      @close="isExportOpen = false"
    >
      <p class="text-sm text-gray-500 mb-6">您想要如何匯出這些內容？</p>
      <div class="space-y-3">
        <button
          @click="handleExportAction('clipboard')"
          class="w-full py-3 bg-secondary text-dark rounded-xl font-bold hover:shadow-md transition flex items-center justify-center gap-2"
        >
          <i class="fa-regular fa-copy"></i> 複製文字到剪貼簿
        </button>
        <button
          @click="handleExportAction('file')"
          class="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-download"></i> 下載文字檔 (.txt)
        </button>
      </div>
    </Modal>
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
const noteSearch = ref('');

const allTags = computed(() => [...new Set(props.notes.flatMap(n => n.tags))])
const filteredNotes = computed(() => {
  let filteredNotes = props.notes;
  if (filterTag.value) {
    filteredNotes = filteredNotes.filter(n => n.tags.includes(filterTag.value))
  }
  if (noteSearch.value.trim()) {
    const term = noteSearch.value.toLowerCase();
    filteredNotes = filteredNotes.filter(note =>
      note.content.toLowerCase().includes(term)
    );
  }
  return filteredNotes
})
const groupedNotes = computed(() => {
  const groups = {};
  // Newest first
  const sorted = [...filteredNotes.value].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(note => {
    const d = new Date(note.date);
    const key = `${d.getFullYear()}年 ${d.getMonth() + 1}月`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(note);
  });

  return Object.keys(groups).map(key => ({ title: key, items: groups[key] }));
});

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

const exportTodayNotes = () => {
  const todayISO = new Date().toISOString().split('T')[0];
  const todays = notes.value.filter(n => n.date.startsWith(todayISO));
  if (todays.length === 0) return alert('今天還沒有筆記喔！');

  todays.sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest to newest

  let textContent = `隨手筆記匯出 - ${todayISO}\n\n`;
  todays.forEach(n => {
    const dt = new Date(n.date);
    const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    textContent += `[${timeStr}] (${getMoodIcon(n.mood)})\n${n.content}\n\n-------------------\n\n`;
  });

  downloadTextFile(textContent, `journal_${todayISO}.txt`);
};
</script>

<style scoped>
.pl-10 {
  padding-left: 2.5rem !important;
}
</style>
