<template>
  <div>
    <div v-if="loading" class="loading-text">Loading...</div>
    <div v-else-if="lesson">
      <h1 class="lesson-detail-title">{{ lesson.title }}</h1>
      <div class="lesson-content-area richtext-wrapper" v-html="lesson.rendered_content"></div>
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

<style scoped>
/* Richtext content wrapper styling */
.richtext-wrapper {
  line-height: 1.75;
  color: #374151;
  max-width: 100%;
}

/* Prose/richtext container */
.richtext-wrapper :deep(.prose) {
  max-width: none !important;
}

/* Image alignment and float styles */
.richtext-wrapper :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  display: block;
}

/* Full-width images */
.richtext-wrapper :deep(img.richtext-image),
.richtext-wrapper :deep(img.full-width) {
  width: 100%;
  display: block;
  margin: 1.5rem 0;
}

/* Left-aligned images - FLOAT */
.richtext-wrapper :deep(img.left),
.richtext-wrapper :deep(img.richtext-image.left) {
  float: left !important;
  margin: 0.5rem 1.5rem 1rem 0 !important;
  max-width: 50%;
  display: block;
}

/* Right-aligned images - FLOAT */
.richtext-wrapper :deep(img.right),
.richtext-wrapper :deep(img.richtext-image.right) {
  float: right !important;
  margin: 0.5rem 0 1rem 1.5rem !important;
  max-width: 50%;
  display: block;
}

/* Center-aligned images */
.richtext-wrapper :deep(img.center),
.richtext-wrapper :deep(img.richtext-image.center) {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 80%;
}

/* Figure elements with alignment */
.richtext-wrapper :deep(figure.image-block) {
  margin: 1.5rem 0;
  clear: both;
}

.richtext-wrapper :deep(figure.image-block--left) {
  float: left !important;
  margin: 0.5rem 1.5rem 1rem 0 !important;
  max-width: 50%;
}

.richtext-wrapper :deep(figure.image-block--right) {
  float: right !important;
  margin: 0.5rem 0 1rem 1.5rem !important;
  max-width: 50%;
}

.richtext-wrapper :deep(figure.image-block--center) {
  text-align: center;
  margin: 1.5rem auto;
}

.richtext-wrapper :deep(figure.image-block img) {
  max-width: 100%;
  height: auto;
  display: block;
}

.richtext-wrapper :deep(figcaption) {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Clear floats after paragraphs with floated images */
.richtext-wrapper :deep(.prose-lg::after),
.richtext-wrapper :deep(p::after) {
  content: "";
  display: table;
  clear: both;
}

/* Headings in richtext */
.richtext-wrapper :deep(h1) {
  font-size: 2.25rem;
  font-weight: 800;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
}

.richtext-wrapper :deep(h2) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1.25rem;
}

.richtext-wrapper :deep(h3) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.75rem;
  margin-bottom: 1rem;
}

/* Lists in richtext */
.richtext-wrapper :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.richtext-wrapper :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.richtext-wrapper :deep(li) {
  display: list-item;
  margin: 0.5rem 0;
}

/* Links in richtext */
.richtext-wrapper :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
  font-weight: 500;
}

.richtext-wrapper :deep(a:hover) {
  color: #4338ca;
  text-decoration-thickness: 2px;
}
</style>
