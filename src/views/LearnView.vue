<template>
  <div v-if="loading" class="learn-loading-container">
    <div class="learn-loading-text">Loading course...</div>
  </div>

  <div v-else-if="course" class="learn-layout">
    <!-- Top Progress Bar -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="h-1 bg-gray-200">
        <div
          class="h-1 bg-green-500 transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      
      <!-- Breadcrumb Navigation -->
      <div class="px-6 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <router-link to="/courses" class="hover:text-indigo-600 transition-colors">Courses</router-link>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="font-medium text-gray-900 truncate max-w-xs">{{ course.title }}</span>
          <span v-if="currentLesson" class="flex items-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="ml-2 truncate max-w-xs">{{ currentLesson.title }}</span>
          </span>
        </div>
        <div class="text-sm font-medium text-gray-700">
          {{ completedCount }} / {{ totalLessons }} completed
        </div>
      </div>
    </div>

    <!-- Overlay for mobile when sidebar is open -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="mobile-overlay"
    ></div>

    <!-- Sidebar Toggle Button (Mobile/Tablet) -->
    <button
      @click="sidebarOpen = !sidebarOpen"
      class="sidebar-toggle-btn"
    >
      <svg v-if="!sidebarOpen" class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
      <svg v-else class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <!-- Main Content Area -->
    <div class="content-area" style="padding-top: 65px;">
      <!-- Content Display Area -->
      <div class="content-display">
        <!-- Video/Content Area - Responsive height -->
        <div class="video-container-area">
          <div v-if="activeTab === 'video'">
            <div v-if="currentLesson && hasVideo(currentLesson)" class="video-content aspect-video-container" style="position: relative;">
              <div v-html="renderVideoContent(currentLesson)"></div>
               
            </div>
            <div v-else class="no-video-placeholder">
              <svg class="placeholder-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
              </svg>
              <p class="placeholder-title">No video available for this lesson</p>
              <p class="placeholder-subtitle">Check the Notes tab for lesson content</p>
            </div>

            <!-- Phase 3: Enhanced Video Controls -->
              <VideoControls
                :currentSpeed="playbackSpeed"
                :isPiPActive="isPiPActive"
                :currentQuality="videoQuality"
                @setSpeed="setPlaybackSpeed"
                @togglePiP="togglePictureInPicture"
                @setQuality="setVideoQuality"
              />
          </div>

          <div v-else-if="activeTab === 'notes'" class="notes-container" :class="{ 'reading-mode': readingMode }">
            <div v-if="currentLesson" class="notes-content-wrapper" :class="{ 'reading-mode-content': readingMode }">
              <!-- Reading Mode Controls -->
              <div class="content-controls">
                <button @click="readingMode = !readingMode" class="control-btn" :class="{ 'active': readingMode }" title="Reading Mode">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </button>
                <div class="font-size-controls">
                  <button @click="fontSize = 'small'" class="font-size-btn" :class="{ 'active': fontSize === 'small' }">A</button>
                  <button @click="fontSize = 'medium'" class="font-size-btn medium" :class="{ 'active': fontSize === 'medium' }">A</button>
                  <button @click="fontSize = 'large'" class="font-size-btn large" :class="{ 'active': fontSize === 'large' }">A</button>
                </div>
              </div>
              
              <h1 class="notes-title">{{ currentLesson.title }}</h1>
              <div class="lesson-content enhanced-content" :style="{ fontSize: fontSizes[fontSize] }" v-html="renderNotesContent(currentLesson)"></div>
            </div>
          </div>

          <div v-else-if="activeTab === 'quiz'" class="notes-container">
            <div v-if="currentLesson && currentLesson.quizzes && currentLesson.quizzes.length > 0">
              <div v-if="!selectedQuiz" class="quiz-list">
                <h2 class="notes-title">Available Quizzes</h2>
                <div v-for="quiz in currentLesson.quizzes" :key="quiz.id" class="quiz-card" @click="selectQuiz(quiz.id)">
                  <h3>{{ quiz.title }}</h3>
                  <p>{{ quiz.description }}</p>
                  <div class="quiz-meta">
                    <span>{{ quiz.question_count }} questions</span>
                    <span>{{ quiz.total_points }} points</span>
                    <span>Pass: {{ quiz.passing_score }}%</span>
                  </div>
                </div>
              </div>
              <QuizView v-else :quizId="selectedQuiz" @close="selectedQuiz = null" @completed="onQuizCompleted" />
            </div>
            <div v-else class="notes-content-wrapper" style="text-align: center;">
              <svg class="placeholder-icon" style="width: 6rem; height: 6rem; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h2 class="notes-title" style="font-size: 1.5rem;">No Quizzes</h2>
              <p class="placeholder-subtitle" style="color: #9ca3af;">No quizzes available for this lesson</p>
            </div>
          </div>

          <!-- Slides Tab Content -->
          <div v-else-if="activeTab === 'slides'" class="slides-area">
            <div v-if="currentLesson && currentLesson.slides_content && currentLesson.slides_content.length">
              <div v-for="(slideBlock, index) in currentLesson.slides_content" :key="index" class="slide-item">
                <template v-if="slideBlock.value">
                  <h3 v-if="slideBlock.value.document && slideBlock.value.document.title">{{ slideBlock.value.document.title }}</h3>
                  <div v-if="slideBlock.value.document && slideBlock.value.document.url">
                    <template v-if="isPdf(slideBlock.value.document.url)">
                      <iframe :src="slideBlock.value.document.url" class="slide-iframe" frameborder="0"></iframe>
                    </template>
                    <template v-else-if="isPowerPoint(slideBlock.value.document.url)">
                      <iframe :src="getOfficeWebViewerUrl(slideBlock.value.document.url)" class="slide-iframe" frameborder="0"></iframe>
                    </template>
                    <template v-else>
                      <a :href="slideBlock.value.document.url" target="_blank" rel="noopener noreferrer" class="download-link">
                        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Download {{ slideBlock.value.document.title || 'Slide Document' }}
                      </a>
                    </template>
                  </div>
                  <p v-else>No slide document available.</p>
                </template>
                <p v-else>Invalid slide data.</p>
              </div>
            </div>
            <p v-else class="notes-content-wrapper" style="text-align: center; color: #9ca3af;">No slides available for this lesson.</p>
          </div>

        </div>

        

        

      </div>

      <!-- Previous/Next Navigation -->
        <div class="lesson-navigation" v-if="currentLesson">
          <button
            @click="goToPreviousLesson"
            :disabled="!hasPreviousLesson"
            class="nav-button nav-button-prev"
            :class="{ 'opacity-50 cursor-not-allowed': !hasPreviousLesson }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Previous Lesson</span>
          </button>
          
          <div class="lesson-position">
            <span class="text-sm text-gray-600">
              Lesson {{ currentLessonIndex + 1 }} of {{ allLessons.length }}
            </span>
          </div>
          
          <button
            @click="goToNextLesson"
            :disabled="!hasNextLesson"
            class="nav-button nav-button-next"
            :class="{ 'opacity-50 cursor-not-allowed': !hasNextLesson }"
          >
            <span>Next Lesson</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            @click="activeTab = 'video'"
            :class="activeTab === 'video' ? 'tab-button-active' : 'tab-button'"
          >
            <span class="tab-icon-wrapper">
              <svg class="tab-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
              </svg>
              <span>Video</span>
            </span>
          </button>
          <button
            @click="activeTab = 'notes'"
            :class="activeTab === 'notes' ? 'tab-button-active' : 'tab-button'"
          >
            <span class="tab-icon-wrapper">
              <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Notes</span>
            </span>
          </button>
          <button
            @click="activeTab = 'quiz'"
            :class="activeTab === 'quiz' ? 'tab-button-active' : 'tab-button'"
          >
            <span class="tab-icon-wrapper">
              <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Quiz</span>
            </span>
          </button>
          <button
            @click="activeTab = 'slides'"
            :class="activeTab === 'slides' ? 'tab-button-active' : 'tab-button'"
          >
            <span class="tab-icon-wrapper">
              <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0-4h.01M12 12h.01"/>
              </svg>
              <span>Slides</span>
            </span>
          </button>
        </div>

    </div>

    

    <!-- Sidebar: Course Outline -->
    <div
      :class="[
        'course-sidebar',
        sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'
      ]"
    >
      <div class="sidebar-header">
        <h2 class="sidebar-course-title">{{ course.title }}</h2>
        
        <!-- Overall Progress with Percentage -->
        <div class="flex items-center justify-between mt-3 mb-2">
          <div class="sidebar-progress-text">
            {{ completedCount }} / {{ totalLessons }} lessons
          </div>
          <div class="text-sm font-bold text-green-600">
            {{ progressPercentage }}%
          </div>
        </div>
        
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <div class="sidebar-modules-area">
        <div v-for="(module, mIndex) in course.modules" :key="module.id" class="sidebar-module-container">
          <button
            @click="toggleModule(mIndex)"
            class="sidebar-module-toggle"
          >
            <div class="sidebar-module-info">
              <div class="sidebar-module-title">{{ module.title }}</div>
              <div class="flex items-center justify-between mt-1">
                <div class="sidebar-module-progress">
                  {{ getModuleCompletedCount(module) }} / {{ module.lessons.length }} lessons
                </div>
                <div class="module-progress-badge">
                  {{ getModuleProgressPercentage(module) }}%
                </div>
              </div>
            </div>
            <svg
              class="chevron-icon"
              :class="{ 'transform rotate-180': expandedModules[mIndex] }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="expandedModules[mIndex]" class="sidebar-lessons-container">
            <button
              v-for="lesson in module.lessons"
              :key="lesson.id"
              @click="selectLesson(lesson)"
              :class="currentLesson && currentLesson.id === lesson.id ? 'sidebar-lesson-active' : 'sidebar-lesson-button'"
            >
              <div class="lesson-button-content">
                <!-- Lesson Type Icon -->
                <div class="lesson-type-icon">
                  <svg v-if="getLessonType(lesson) === 'video'" class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                  </svg>
                  <svg v-else-if="getLessonType(lesson) === 'quiz'" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                
                <div class="lesson-info flex-1">
                  <div class="lesson-button-title">{{ lesson.title }}</div>
                  <div v-if="lesson.duration" class="lesson-duration">
                    <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ formatDuration(lesson.duration) }}
                  </div>
                </div>
                
                <!-- Completion Checkbox -->
                <div class="lesson-checkbox-wrapper">
                  <svg
                    v-if="isLessonCompleted(lesson.id)"
                    class="lesson-checkbox-checked"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div v-else class="lesson-checkbox-unchecked"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Future Features -->
    <div class="features-panel">
      <div class="features-panel-content">
        <div class="features-placeholder">
          <svg class="w-16 h-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
          <p class="text-sm text-gray-400 mt-4">Future Features</p>
          <p class="text-xs text-gray-300 mt-1">Coming Soon</p>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Help Overlay -->
    <div v-if="showKeyboardHelp" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click="showKeyboardHelp = false">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
          <button @click="showKeyboardHelp = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Next Lesson</span>
            <div class="flex space-x-2">
              <kbd class="keyboard-key">N</kbd>
              <span class="text-gray-400">or</span>
              <kbd class="keyboard-key">→</kbd>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Previous Lesson</span>
            <div class="flex space-x-2">
              <kbd class="keyboard-key">P</kbd>
              <span class="text-gray-400">or</span>
              <kbd class="keyboard-key">←</kbd>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Toggle Sidebar</span>
            <kbd class="keyboard-key">B</kbd>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Picture-in-Picture</span>
            <kbd class="keyboard-key">I</kbd>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Show/Hide Help</span>
            <div class="flex space-x-2">
              <kbd class="keyboard-key">?</kbd>
              <span class="text-gray-400">or</span>
              <kbd class="keyboard-key">H</kbd>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Close Help</span>
            <kbd class="keyboard-key">Esc</kbd>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          Shortcuts work when not typing in text fields
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found-container">
    <div class="not-found-text">Course not found or not enrolled.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils'
import QuizView from './QuizView.vue'
import VideoControls from '../components/VideoControls.vue'

const route = useRoute()
const course = ref(null)
const loading = ref(true)
const currentLesson = ref(null)
const activeTab = ref('video')
const expandedModules = ref({})
const completedLessons = ref(new Set())
const enrollmentId = ref(null)
const sidebarOpen = ref(true)
const selectedQuiz = ref(null)
const showKeyboardHelp = ref(false)

// Helper functions for slide display
const getFileExtension = (url) => {
  const parts = url.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

const isPdf = (url) => {
  return getFileExtension(url) === 'pdf'
}

const isPowerPoint = (url) => {
  const ext = getFileExtension(url)
  return ext === 'ppt' || ext === 'pptx'
}

const getOfficeWebViewerUrl = (docUrl) => {
  // Microsoft Office Web Viewer URL for embedding documents
  // Ensure the docUrl is absolute and publicly accessible
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(docUrl)}`
}

// Phase 3: Video Player Enhancements
const videoElement = ref(null)
const showVideoControls = ref(false)
const playbackSpeed = ref(1)
const showSpeedMenu = ref(false)
const isPiPActive = ref(false)
const videoQuality = ref('auto')
const showQualityMenu = ref(false)

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const qualityOptions = ['auto', '1080p', '720p', '480p', '360p']

// Phase 5: Content Enhancements
const readingMode = ref(false)
const fontSize = ref('medium') // 'small', 'medium', 'large'
const fontSizes = {
  small: '0.875rem',
  medium: '1rem',
  large: '1.125rem'
}

// Load course data
onMounted(async () => {
  try {
    const res = await api.get(`cms/courses/${route.params.id}/`)
    course.value = res.data
    
    // Expand all modules by default
    course.value.modules.forEach((_, index) => {
      expandedModules.value[index] = true
    })
    
    // Load enrollment and progress
    await loadEnrollmentAndProgress()
    
    // Select first lesson if available
    if (course.value.modules.length > 0 && course.value.modules[0].lessons.length > 0) {
      currentLesson.value = course.value.modules[0].lessons[0]
      await loadLessonDetails(currentLesson.value.id)
    }
  } catch (e) {
    console.error('Failed to load course:', e)
    course.value = null
  } finally {
    loading.value = false
  }
})

const loadEnrollmentAndProgress = async () => {
  try {
    // Find enrollment for this course
    const drfCourseId = course.value.drf_course_id
    if (!drfCourseId) return
    
    const enrRes = await api.get('enrollments/')
    const enrollment = enrRes.data.find(x => x.course === drfCourseId)
    enrollmentId.value = enrollment ? enrollment.id : null
    
    // Load progress ONLY for this enrollment
    if (enrollmentId.value) {
      const progressRes = await api.get('progress/')
      // Clear previous progress
      completedLessons.value.clear()
      // Only add progress for THIS enrollment
      progressRes.data.forEach(p => {
        if (p.enrollment === enrollmentId.value && p.cms_lesson_id) {
          completedLessons.value.add(p.cms_lesson_id)
        }
      })
      console.log(`Loaded ${completedLessons.value.size} completed lessons for enrollment ${enrollmentId.value}`)
    }
  } catch (e) {
    console.error('Failed to load enrollment/progress:', e)
  }
}

const loadLessonDetails = async (lessonId) => {
  try {
    const res = await api.get(`cms/lessons/${lessonId}/`)
    currentLesson.value = res.data
    
    console.log('Loaded lesson:', currentLesson.value)
    console.log('Lesson content type:', typeof currentLesson.value.content)
    console.log('Lesson rendered_content type:', typeof currentLesson.value.rendered_content)
    
    // Auto-switch to notes if no video
    if (!hasVideo(currentLesson.value)) {
      activeTab.value = 'notes'
    } else {
      activeTab.value = 'video'
    }
  } catch (e) {
    console.error('Failed to load lesson details:', e)
  }
}

const selectLesson = async (lesson) => {
  await loadLessonDetails(lesson.id)
  // Close sidebar on mobile after selecting lesson
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

const toggleModule = (index) => {
  expandedModules.value[index] = !expandedModules.value[index]
}

const isLessonCompleted = (lessonId) => {
  return completedLessons.value.has(lessonId)
}

const getModuleCompletedCount = (module) => {
  return module.lessons.filter(l => isLessonCompleted(l.id)).length
}

const getModuleProgressPercentage = (module) => {
  if (!module.lessons.length) return 0
  const completed = getModuleCompletedCount(module)
  return Math.round((completed / module.lessons.length) * 100)
}

const getLessonType = (lesson) => {
  // Determine lesson type based on content
  if (!lesson) return 'text'
  
  // Check for quizzes
  if (lesson.quizzes && lesson.quizzes.length > 0) return 'quiz'
  
  // Check for video in rendered_content
  if (lesson.rendered_content && typeof lesson.rendered_content === 'string') {
    if (lesson.rendered_content.includes('<video')) return 'video'
  }
  
  // Check content array
  if (lesson.content && Array.isArray(lesson.content)) {
    const hasVideo = lesson.content.some(block => block.type === 'video')
    if (hasVideo) return 'video'
  }
  
  // Default to text
  return 'text'
}

const formatDuration = (seconds) => {
  if (!seconds) return '0m'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

const hasVideo = (lesson) => {
  if (!lesson) return false
  // Check if rendered_content contains video tags
  if (lesson.rendered_content && typeof lesson.rendered_content === 'string') {
    return lesson.rendered_content.includes('<video')
  }
  // Fallback: check content array if it exists
  if (lesson.content && Array.isArray(lesson.content)) {
    return lesson.content.some(block => block.type === 'video')
  }
  return false
}

const renderVideoContent = (lesson) => {
  if (!lesson) return ''

  if (lesson.rendered_content && typeof lesson.rendered_content === 'string') {
    const videoMatch = lesson.rendered_content.match(/<video[^>]*>[\s\S]*?<\/video>/i)
    if (videoMatch) {
      let videoHTML = videoMatch[0]

      // 🔧 Remove any inline styles (width/max-width/height)
      videoHTML = videoHTML.replace(/style="[^"]*"/gi, '')

      // 🔧 Add your own class for consistent styling
      videoHTML = videoHTML.replace(
        /<video/i,
        '<video class="video-container-area"'
      )

      return videoHTML
    }
  }

  // Fallback: content array (works fine as-is)
  if (lesson.content && Array.isArray(lesson.content)) {
    const videoBlock = lesson.content.find(block => block.type === 'video')
    if (videoBlock && videoBlock.value?.video_file) {
      const videoUrl = videoBlock.value.video_file
      return `
        <video controls class="lesson-video">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `
    }
  }

  return ''
}


const renderNotesContent = (lesson) => {
  if (!lesson) return '<p class="text-gray-400">No lesson selected.</p>'
  
  console.log('renderNotesContent called')
  console.log('lesson:', lesson)
  console.log('rendered_content type:', typeof lesson.rendered_content)
  console.log('rendered_content value:', lesson.rendered_content)
  
  // Check if rendered_content exists and is a string
  if (!lesson.rendered_content) {
    console.log('No rendered_content found')
    return '<p class="text-gray-400">No content available for this lesson.</p>'
  }
  
  if (typeof lesson.rendered_content !== 'string') {
    console.log('rendered_content is not a string, it is:', typeof lesson.rendered_content)
    return '<p class="text-gray-400">Content format error.</p>'
  }
  
  // Remove video elements using regex (simpler than DOM manipulation)
  let cleanedHtml = lesson.rendered_content
    .replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '') // Remove video tags
    .trim()
  
  console.log('Cleaned HTML:', cleanedHtml)
  
  return cleanedHtml || '<p class="text-gray-400">No additional notes for this lesson. Check the Video tab.</p>'
}

const totalLessons = computed(() => {
  if (!course.value) return 0
  return course.value.modules.reduce((sum, module) => sum + module.lessons.length, 0)
})

const completedCount = computed(() => {
  return completedLessons.value.size
})

const progressPercentage = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedCount.value / totalLessons.value) * 100)
})

// Watch for lesson completion
watch(currentLesson, () => {
  if (currentLesson.value && !isLessonCompleted(currentLesson.value.id) && enrollmentId.value) {
    // Mark as complete after 3 seconds of viewing
    setTimeout(async () => {
      try {
        await api.post('progress/', {
          enrollment: enrollmentId.value,
          cms_lesson_id: currentLesson.value.id
        })
        completedLessons.value.add(currentLesson.value.id)
      } catch (e) {
        // Silently handle error - likely already marked complete
        if (e.response?.status === 400) {
          // Already completed, add to local set
          completedLessons.value.add(currentLesson.value.id)
        }
      }
    }, 3000)
  }
})

// Quiz methods
const selectQuiz = (quizId) => {
  selectedQuiz.value = quizId
}

const onQuizCompleted = (attempt) => {
  console.log('Quiz completed:', attempt)
  selectedQuiz.value = null
  // Could show a success notification here
}

// Navigation: Get all lessons in order
const allLessons = computed(() => {
  if (!course.value) return []
  const lessons = []
  course.value.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      lessons.push(lesson)
    })
  })
  return lessons
})

const currentLessonIndex = computed(() => {
  if (!currentLesson.value || !allLessons.value.length) return -1
  return allLessons.value.findIndex(l => l.id === currentLesson.value.id)
})

const hasNextLesson = computed(() => {
  return currentLessonIndex.value >= 0 && currentLessonIndex.value < allLessons.value.length - 1
})

const hasPreviousLesson = computed(() => {
  return currentLessonIndex.value > 0
})

const goToNextLesson = async () => {
  if (hasNextLesson.value) {
    const nextLesson = allLessons.value[currentLessonIndex.value + 1]
    await selectLesson(nextLesson)
  }
}

const goToPreviousLesson = async () => {
  if (hasPreviousLesson.value) {
    const prevLesson = allLessons.value[currentLessonIndex.value - 1]
    await selectLesson(prevLesson)
  }
}

// Keyboard shortcuts
const handleKeyPress = (e) => {
  // Don't trigger shortcuts when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  
  // Show keyboard help
  if (e.key === '?' || e.key === 'h') {
    showKeyboardHelp.value = !showKeyboardHelp.value
    return
  }
  
  // Close help
  if (e.key === 'Escape' && showKeyboardHelp.value) {
    showKeyboardHelp.value = false
    return
  }
  
  // Navigation shortcuts
  if (e.key === 'n' || e.key === 'ArrowRight') {
    e.preventDefault()
    goToNextLesson()
  } else if (e.key === 'p' || e.key === 'ArrowLeft') {
    e.preventDefault()
    goToPreviousLesson()
  } else if (e.key === 'b') {
    e.preventDefault()
    sidebarOpen.value = !sidebarOpen.value
  } else if (e.key === 'i') {
    // Picture-in-Picture toggle
    e.preventDefault()
    togglePictureInPicture()
  }
}

// Video player controls
const setPlaybackSpeed = (speed) => {
  playbackSpeed.value = speed
  const video = document.querySelector('.video-content video')
  if (video) {
    video.playbackRate = speed
  }
  showSpeedMenu.value = false
}

const togglePictureInPicture = async () => {
  const video = document.querySelector('.video-content video')
  if (!video) return
  
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
      isPiPActive.value = false
    } else {
      await video.requestPictureInPicture()
      isPiPActive.value = true
    }
  } catch (error) {
    console.error('Picture-in-Picture failed:', error)
  }
}

const setVideoQuality = (quality) => {
  videoQuality.value = quality
  showQualityMenu.value = false
  // Quality switching would need backend support for multiple sources
  console.log('Quality set to:', quality)
}

// Watch for video element changes
watch(currentLesson, () => {
  // Reset playback speed when lesson changes
  setTimeout(() => {
    const video = document.querySelector('.video-content video')
    if (video) {
      video.playbackRate = playbackSpeed.value
      
      // Add event listeners
      video.addEventListener('enterpictureinpicture', () => {
        isPiPActive.value = true
      })
      video.addEventListener('leavepictureinpicture', () => {
        isPiPActive.value = false
      })
    }
  }, 100)
})

// Setup keyboard shortcuts
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
/* Custom styling for lesson content - Light Theme */
.lesson-content :deep(h2) {
  @apply text-2xl font-bold mt-8 mb-4 text-gray-900;
}

.lesson-content :deep(h3) {
  @apply text-xl font-semibold mt-6 mb-3 text-gray-900;
}

.lesson-content :deep(p) {
  @apply mb-4 text-gray-700 leading-relaxed;
}

.lesson-content :deep(ul), .lesson-content :deep(ol) {
  @apply mb-4 ml-6 text-gray-700;
}

.lesson-content :deep(li) {
  @apply mb-2;
}

.lesson-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-6;
}

.lesson-content :deep(a) {
  @apply text-indigo-600 hover:text-indigo-700 underline;
}

.lesson-content :deep(code) {
  @apply bg-gray-100 px-2 py-1 rounded text-sm text-indigo-600 font-mono;
}

.lesson-content :deep(pre) {
  @apply bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto;
}

.lesson-content :deep(blockquote) {
  @apply border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-4 bg-indigo-50 py-2;
}

.lesson-content :deep(video) {
  @apply w-full rounded-lg my-6;
}

/* Quiz styling - Light Theme */
.quiz-list {
  padding: 2rem;
}

.quiz-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #e5e7eb;
}

.quiz-card:hover {
  background: #f9fafb;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.quiz-card h3 {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.quiz-card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.quiz-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.quiz-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Slides Area */
.slides-area {
  @apply p-6 flex flex-col gap-8;
  flex-grow: 1;
  overflow-y: auto; /* Enable scrolling for multiple slides */
}

.slide-item {
  @apply bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200;
}

.slide-item h3 {
  @apply text-xl font-semibold text-gray-800 mb-4;
}

.slide-iframe {
  @apply w-full rounded-md border border-gray-300;
  min-height: 600px; /* Ensure iframe has a decent height */
}

.download-link {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.download-link svg {
  @apply -ml-1 mr-2 h-5 w-5;
}

/* Aspect Ratio for Video Player */
.aspect-video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.aspect-video-container :deep(video),
.aspect-video-container :deep(iframe) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* or contain if you want full frame */
  display: block;
}




</style>
