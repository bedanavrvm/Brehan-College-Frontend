<template>
  <div>
    <div v-if="loading" class="loading-text">Loading...</div>
    <div v-else-if="module">
      <h1 class="module-detail-title">{{ module.title }}</h1>
      <p class="module-detail-description" v-html="module.description"></p>
      <h2 class="lessons-section-title">Lessons</h2>
      <ul>
        <li v-for="lesson in module.lessons" :key="lesson.id" class="lesson-link-item">
          <router-link :to="`/lessons/${lesson.id}`" class="lesson-link">
            {{ lesson.title }}
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else class="not-found-text">Module not found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils'

const route = useRoute()
const module = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
  const res = await api.get(`cms/modules/${route.params.id}/`)
    module.value = res.data
  } catch (e) {
    module.value = null
  } finally {
    loading.value = false
  }
})
</script>
