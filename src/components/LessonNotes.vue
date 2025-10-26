<template>
  <div class="lesson-notes-panel">
    <!-- Notes Header -->
    <div class="notes-header">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <h3 class="notes-title">My Notes</h3>
        <span class="notes-count">({{ notes.length }})</span>
      </div>
      
      <button @click="showNewNote = true" class="add-note-btn">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Add Note</span>
      </button>
    </div>

    <!-- Search Notes -->
    <div v-if="notes.length > 0" class="notes-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search notes..."
        class="search-input"
      />
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>

    <!-- New Note Form -->
    <div v-if="showNewNote" class="note-form">
      <textarea
        v-model="newNoteText"
        placeholder="Write your note here..."
        class="note-textarea"
        rows="4"
        autofocus
      ></textarea>
      <div class="note-form-actions">
        <label v-if="hasVideo" class="timestamp-checkbox">
          <input type="checkbox" v-model="includeTimestamp" />
          <span>Include video timestamp ({{ currentTime }})</span>
        </label>
        <div class="flex gap-2">
          <button @click="cancelNewNote" class="btn-secondary">Cancel</button>
          <button @click="saveNote" class="btn-primary" :disabled="!newNoteText.trim()">
            Save Note
          </button>
        </div>
      </div>
    </div>

    <!-- Notes List -->
    <div class="notes-list">
      <div v-if="filteredNotes.length === 0 && !showNewNote" class="empty-notes">
        <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <p class="empty-text">No notes yet</p>
        <p class="empty-subtext">Start taking notes to remember key points</p>
      </div>

      <div v-for="note in filteredNotes" :key="note.id" class="note-card">
        <div v-if="editingNote === note.id" class="note-form">
          <textarea
            v-model="editNoteText"
            class="note-textarea"
            rows="4"
          ></textarea>
          <div class="note-form-actions">
            <div class="flex gap-2 ml-auto">
              <button @click="cancelEdit" class="btn-secondary">Cancel</button>
              <button @click="updateNote(note.id)" class="btn-primary">Save</button>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="note-header-row">
            <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            <div class="note-actions">
              <button @click="startEdit(note)" class="action-btn" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button @click="deleteNote(note.id)" class="action-btn text-red-600" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="note.timestamp !== undefined" class="note-timestamp" @click="$emit('seekTo', note.timestamp)">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ formatTimestamp(note.timestamp) }}</span>
          </div>

          <p class="note-content">{{ note.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  lessonId: {
    type: [String, Number],
    required: true
  },
  hasVideo: {
    type: Boolean,
    default: false
  },
  currentVideoTime: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['seekTo'])

// State
const notes = ref([])
const showNewNote = ref(false)
const newNoteText = ref('')
const includeTimestamp = ref(true)
const searchQuery = ref('')
const editingNote = ref(null)
const editNoteText = ref('')

// Computed
const currentTime = computed(() => {
  return formatTimestamp(props.currentVideoTime)
})

const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value
  const query = searchQuery.value.toLowerCase()
  return notes.value.filter(note => 
    note.text.toLowerCase().includes(query)
  )
})

// Load notes from localStorage
const loadNotes = () => {
  const key = `lesson_notes_${props.lessonId}`
  const stored = localStorage.getItem(key)
  if (stored) {
    notes.value = JSON.parse(stored)
  }
}

// Save notes to localStorage
const saveNotesToStorage = () => {
  const key = `lesson_notes_${props.lessonId}`
  localStorage.setItem(key, JSON.stringify(notes.value))
}

// Add new note
const saveNote = () => {
  if (!newNoteText.value.trim()) return

  const note = {
    id: Date.now(),
    text: newNoteText.value.trim(),
    createdAt: new Date().toISOString(),
    lessonId: props.lessonId
  }

  if (includeTimestamp.value && props.hasVideo) {
    note.timestamp = Math.floor(props.currentVideoTime)
  }

  notes.value.unshift(note)
  saveNotesToStorage()

  // Reset form
  newNoteText.value = ''
  showNewNote.value = false
  includeTimestamp.value = true
}

const cancelNewNote = () => {
  newNoteText.value = ''
  showNewNote.value = false
}

// Edit note
const startEdit = (note) => {
  editingNote.value = note.id
  editNoteText.value = note.text
}

const updateNote = (noteId) => {
  const note = notes.value.find(n => n.id === noteId)
  if (note && editNoteText.value.trim()) {
    note.text = editNoteText.value.trim()
    note.updatedAt = new Date().toISOString()
    saveNotesToStorage()
    cancelEdit()
  }
}

const cancelEdit = () => {
  editingNote.value = null
  editNoteText.value = ''
}

// Delete note
const deleteNote = (noteId) => {
  if (confirm('Are you sure you want to delete this note?')) {
    notes.value = notes.value.filter(n => n.id !== noteId)
    saveNotesToStorage()
  }
}

// Format functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString()
}

const formatTimestamp = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Watch lesson changes
watch(() => props.lessonId, () => {
  loadNotes()
  showNewNote.value = false
  searchQuery.value = ''
}, { immediate: true })
</script>

<style scoped>
.lesson-notes-panel {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.notes-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.notes-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.add-note-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.add-note-btn:hover {
  background: #4338ca;
}

.notes-search {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  ring: 2px;
  ring-color: rgba(79, 70, 229, 0.2);
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.note-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.note-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.note-textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.note-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.timestamp-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.empty-notes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-text {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.empty-subtext {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.note-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.note-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.note-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.note-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem;
  color: #6b7280;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #4f46e5;
  background: #f3f4f6;
}

.note-timestamp {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.note-timestamp:hover {
  background: #e0e7ff;
}

.note-content {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
