<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
            <p class="text-gray-600">Explore our collection of expertly crafted courses</p>
          </div>
          <div v-if="isTeacher" class="filter-toggle-group">
            <button 
              :class="filterMode==='all' ? 'filter-toggle-active' : 'filter-toggle-button'" 
              @click="setMode('all')"
            >
              All Courses
            </button>
            <button 
              :class="filterMode==='mine' ? 'filter-toggle-active' : 'filter-toggle-button'" 
              @click="setMode('mine')"
            >
              My Courses
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Grid -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="course-card-skeleton"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="courses.length === 0" class="text-center py-16">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
        <p class="text-gray-600">{{ filterMode === 'mine' ? 'You haven\'t created any courses yet.' : 'No courses available at the moment.' }}</p>
      </div>

      <!-- Course Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link 
          v-for="(course, index) in courses" 
          :key="course.id" 
          :to="`/courses/${course.id}`" 
          class="modern-course-card card-interactive card-glow animate-fade-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <!-- Course Image Placeholder -->
          <div class="course-card-image">
            <div class="aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          </div>
          
          <!-- Course Content -->
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ course.title }}
            </h3>
            <div class="text-sm text-gray-600 mb-4 line-clamp-2 course-description" v-html="course.description"></div>
            
            <!-- Course Meta -->
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-4 text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  {{ course.modules?.length || 0 }} modules
                </span>
              </div>
              <span class="font-semibold text-indigo-600">Free</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils'

const courses = ref([])
const loading = ref(true)
const isTeacher = ref(false)
const username = ref('')
const filterMode = ref('all') // 'all' | 'mine'

onMounted(async () => {
  await detectRole()
  // Default to 'mine' for teachers
  if (isTeacher.value) filterMode.value = 'mine'
  await loadCourses()
})

const detectRole = async () => {
  // Attempt to detect role only if a token exists; otherwise, keep page public
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) {
    isTeacher.value = false
    username.value = ''
    return
  }
  try {
    const me = await api.get('me/')
    isTeacher.value = (me.data.role || '').toLowerCase() === 'teacher' || (me.data.role || '').toLowerCase() === 'staff'
    username.value = me.data.username
  } catch {
    isTeacher.value = false
    username.value = ''
  }
}

const setMode = async (mode) => {
  if (filterMode.value === mode) return
  filterMode.value = mode
  await loadCourses()
}

const loadCourses = async () => {
  loading.value = true
  try {
    const url = isTeacher.value && filterMode.value === 'mine' ? `cms/courses/?teacher=${encodeURIComponent(username.value)}` : 'cms/courses/'
    const res = await api.get(url)
    courses.value = res.data
  } finally {
    loading.value = false
  }
}
</script>
