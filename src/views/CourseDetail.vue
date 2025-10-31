<template>
  <div class="modern-course-detail">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading course...</p>
      </div>
    </div>
    
    <!-- Course Content -->
    <div v-else-if="course">
      <!-- Modern Course Header -->
      <div class="modern-course-header">
        <div class="max-w-7xl mx-auto px-6 py-12">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left: Course Info -->
            <div class="lg:col-span-2">
              <div class="mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Course
                </span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4">{{ course.title }}</h1>
              <div class="text-lg text-indigo-100 mb-6 prose-invert" v-html="course.description"></div>
              
              <!-- Course Stats -->
              <div class="flex items-center space-x-6 text-sm text-indigo-200">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  <span>{{ course.modules.length }} Modules</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ totalLessons }} Lessons</span>
                </div>
                <div v-if="course.price > 0" class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  <span>${{ course.price }}</span>
                </div>
              </div>
            </div>

            
            <!-- Right: Action Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-xl p-6 sticky top-24">
                <div class="text-center mb-6">
                  <div class="text-3xl font-bold text-gray-900 mb-2">
                    {{ course.price > 0 ? `$${course.price}` : 'Free' }}
                  </div>
                  <p class="text-sm text-gray-600">Full course access</p>
                </div>
                
                <button
                  v-if="enrolled"
                  @click="startCourse"
                  class="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 mb-3"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                  </svg>
                  <span>Continue Learning</span>
                </button>
                <button
                  v-else
                  @click="enroll"
                  class="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-3"
                >Enroll Now</button>
                
                <div v-if="enrolled" class="flex items-center justify-center text-sm text-green-600 bg-green-50 rounded-lg py-2">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="font-medium">You're enrolled!</span>
                </div>
                
                <div class="border-t border-gray-200 mt-6 pt-6 space-y-3 text-sm">
                  <div class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Learn at your own pace</span>
                  </div>
                  <div class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <span>Mobile friendly</span>
                  </div>
                  <div class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Content Section -->
      <div class="bg-gray-50 py-12">
        <div class="max-w-7xl mx-auto px-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          <div class="space-y-3">
            <div v-for="(module, index) in course.modules" :key="module.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-200 transition-colors">
              <button
                @click="toggleModule(index)"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ module.title }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ module.lessons.length }} lessons</p>
                </div>
                <svg
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expandedModules[index] }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div v-if="expandedModules[index]" class="border-t border-gray-200 bg-gray-50">
                <ul class="divide-y divide-gray-200">
                  <li v-for="lesson in module.lessons" :key="lesson.id" class="px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <svg class="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm text-gray-700">{{ lesson.title }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="reviews-section">
        <h3 class="reviews-title">Reviews</h3>
        <div v-if="reviews.length === 0" class="reviews-empty">No reviews yet.</div>
        <ul class="reviews-list">
          <li v-for="r in reviews" :key="r.id" class="review-card">
            <div class="review-rating">Rating: {{ r.rating }}/5</div>
            <div class="review-comment">{{ r.comment }}</div>
            <div class="review-timestamp">{{ new Date(r.created_at).toLocaleString() }}</div>
          </li>
        </ul>
        <div v-if="drfCourseId" class="review-form-container">
          <h4 class="review-form-title">Add a review</h4>
          <form @submit.prevent="submitReview" class="review-form">
            <div class="review-form-group">
              <label class="form-label">Rating</label>
              <select v-model.number="newReview.rating" class="form-input">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
              </select>
            </div>
            <div class="review-form-group">
              <label class="form-label">Comment</label>
              <textarea v-model="newReview.comment" class="form-input" rows="3"></textarea>
            </div>
            <button type="submit" class="review-submit-btn">Submit</button>
            <div v-if="reviewError" class="alert-error" style="font-size: 0.875rem;">{{ reviewError }}</div>
          </form>
        </div>
      </div>
    </div>
    <div v-else class="not-found-text">Course not found.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../utils'

const route = useRoute()
const router = useRouter()
const course = ref(null)
const loading = ref(true)
const drfCourseId = ref(null)
const enrolled = ref(false)
const reviews = ref([])
const reviewError = ref('')
const newReview = ref({ rating: 5, comment: '' })
const expandedModules = ref({})

const totalLessons = computed(() => {
  if (!course.value) return 0
  return course.value.modules.reduce((sum, module) => sum + module.lessons.length, 0)
})

const toggleModule = (index) => {
  expandedModules.value[index] = !expandedModules.value[index]
}

const startCourse = () => {
  router.push(`/learn/${route.params.id}`)
}

onMounted(async () => {
  console.log('CourseDetail mounted, loading course:', route.params.id)
  try {
    const res = await api.get(`cms/courses/${route.params.id}/`)
    course.value = res.data
    console.log('Course loaded:', course.value)
    
    // Resolve DRF course by CMS id for LMS actions
    try {
      console.log('Fetching DRF course ID...')
      const drfRes = await api.get(`courses/by-cms/${route.params.id}/`)
      drfCourseId.value = drfRes.data.id
      console.log('DRF Course ID:', drfCourseId.value)
      
      await Promise.all([
        loadEnrollmentStatus(),
        loadReviews()
      ])
    } catch (e) {
      console.error('Failed to load DRF course data:', e)
      console.log('Note: Enrollment features may not work without DRF course')
    }
  } catch (e) {
    console.error('Failed to load course:', e)
    course.value = null
  } finally {
    loading.value = false
  }
})

const loadEnrollmentStatus = async () => {
  try {
    const enr = await api.get('enrollments/')
    enrolled.value = !!enr.data.find(x => x.course === drfCourseId.value)
  } catch {}
}

const loadReviews = async () => {
  try {
    const r = await api.get(`reviews/?course=${drfCourseId.value}`)
    reviews.value = r.data
  } catch { reviews.value = [] }
}

const enroll = async () => {
  console.log('Enroll button clicked!')
  console.log('drfCourseId:', drfCourseId.value)
  console.log('route.params.id:', route.params.id)
  
  // If not authenticated, redirect to login before attempting enrollment
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) {
    router.push({ path: '/login', query: { next: `/courses/${route.params.id}` } })
    return
  }

  if (!drfCourseId.value) {
    console.error('Cannot enroll: drfCourseId is not set. The course may not have a corresponding DRF course.')
    alert('Unable to enroll at this time. Please try refreshing the page.')
    return
  }
  
  try {
    console.log('Sending enrollment request...')
    await api.post('enrollments/', { course: drfCourseId.value })
    console.log('Enrollment successful!')
    enrolled.value = true
    // Redirect to learning interface immediately after enrollment
    router.push(`/learn/${route.params.id}`)
  } catch (e) {
    console.error('Enrollment failed:', e)
    alert('Enrollment failed. Please try again.')
  }
}

const submitReview = async () => {
  reviewError.value = ''
  try {
    await api.post('reviews/', { course: drfCourseId.value, rating: newReview.value.rating, comment: newReview.value.comment })
    newReview.value = { rating: 5, comment: '' }
    await loadReviews()
  } catch {
    reviewError.value = 'Failed to submit review.'
  }
}
</script>
