<template>
  <div>
    <div v-if="loading" class="loading-text">Loading...</div>
    <div v-else-if="lesson">
      <h1 class="lesson-detail-title">{{ lesson.title }}</h1>
      <div class="lesson-content-area" v-html="lesson.rendered_content"></div>
      <div class="lesson-actions">
        <button
          v-if="!completed && canMark"
          @click="markComplete"
          class="mark-complete-btn"
        >Mark as complete</button>
        <span v-else-if="completed" class="completed-badge">Completed</span>
        <span v-else class="enroll-notice">Enroll to track progress.</span>
      </div>
    </div>
    <div v-else class="not-found-text">Lesson not found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils'

const route = useRoute()
const lesson = ref(null)
const loading = ref(true)
const drfCourseId = ref(null)
const enrollmentId = ref(null)
const completed = ref(false)
const canMark = ref(false)

onMounted(async () => {
  try {
    const res = await api.get(`cms/lessons/${route.params.id}/`)
    lesson.value = res.data
    // Resolve DRF course by CMS id then load enrollment and progress
    if (lesson.value.course_cms_id) {
      try {
        const cr = await api.get(`courses/by-cms/${lesson.value.course_cms_id}/`)
        drfCourseId.value = cr.data.id
        await loadEnrollment()
        await loadProgress()
      } catch {}
    }
  } catch (e) {
    lesson.value = null
  } finally {
    loading.value = false
  }
})

const loadEnrollment = async () => {
  try {
    const enr = await api.get('enrollments/')
    const match = enr.data.find(x => x.course === drfCourseId.value)
    enrollmentId.value = match ? match.id : null
    canMark.value = !!enrollmentId.value
  } catch {
    enrollmentId.value = null
    canMark.value = false
  }
}

const loadProgress = async () => {
  try {
    const pr = await api.get('progress/')
    completed.value = !!pr.data.find(x => x.cms_lesson_id === Number(route.params.id))
  } catch {
    completed.value = false
  }
}

const markComplete = async () => {
  if (!enrollmentId.value) return
  try {
    await api.post('progress/', { enrollment: enrollmentId.value, cms_lesson_id: Number(route.params.id) })
    completed.value = true
  } catch {}
}
</script>
