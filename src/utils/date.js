export const generateId = () => '_' + Math.random().toString(36).substr(2, 9)

export const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const toInputDateTime = (dateStr) => {
    if (!dateStr) return ''
    // If it ends with Z (legacy data), convert to local ISO. If not (new data), just use it.
    if (dateStr.endsWith('Z')) {
        const d = new Date(dateStr);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }
    return dateStr.slice(0, 16);
}
export const getMoodIcon = (mood) => {
    const moods = {
        happy: '😊',
        calm: '😌',
        sad: '😢',
        tired: '😫'
    }
    return moods[mood] || '😌'
}

// --- Timezone Helpers (Client Local Time) ---
export const toLocalISOString = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d)) throw new Error(`Invalid date input: ${dateInput}`);

    const offset = -d.getTimezoneOffset(); // 單位：分鐘（台北會是 -480）
    const sign = offset >= 0 ? '+' : '-';
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');

    const hours = pad(offset / 60);
    const minutes = pad(offset % 60);

    const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .replace('Z', `${sign}${hours}:${minutes}`);

    return localISO;
};
