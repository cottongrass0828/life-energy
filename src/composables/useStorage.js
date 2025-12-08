import { ref, watch } from 'vue'

export function useStorage(key, def) {
    const data = ref(def)
    const loaded = localStorage.getItem(key)
    if (loaded) data.value = JSON.parse(loaded)
    watch(data, (v) => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
    return data
}
