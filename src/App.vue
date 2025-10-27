<template>
  <!-- Full-screen layout for learning page -->
  <div v-if="isLearningPage">
    <router-view />
  </div>
  
  <!-- Normal layout with navbar for other pages -->
  <div v-else class="page-container">
    <nav class="app-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <router-link to="/" class="navbar-logo">Brehan Platform</router-link>
          <router-link to="/" class="navbar-link">Home</router-link>
          <router-link to="/about" class="navbar-link">About</router-link>
          <router-link to="/courses" class="navbar-link">Courses</router-link>
        </div>
        <div>
          <template v-if="isLoggedIn">
            <div class="navbar-right" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <button class="user-dropdown-trigger">
                <span class="user-initials-badge">
                  {{ userInitials }}
                </span>
                <span class="user-name-text">{{ username }}</span>
                <svg class="dropdown-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div v-if="showDropdown" class="user-dropdown-menu">
                <router-link to="/account" class="dropdown-menu-item">Account</router-link>
                <button v-if="isTeacher" @click="openWagtail" class="dropdown-menu-button">Create Course (Wagtail)</button>
                <button @click="logout" class="dropdown-menu-button">Logout</button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="navbar-link" style="margin-right: 1rem;">Login</router-link>
            <router-link to="/register" class="navbar-link">Register</router-link>
          </template>
        </div>
      </div>
    </nav>
    <main class="content-wrapper">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from './utils'

const isLoggedIn = ref(false)
const username = ref('')
const showDropdown = ref(false)
const router = useRouter()
const route = useRoute()
const isTeacher = ref(false)

// Check if current route is the learning page
const isLearningPage = computed(() => route.path.startsWith('/learn/'))

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token')

const getUserFromToken = (token) => {
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.username || ''
  } catch {
    return ''
  }
}

const userInitials = computed(() => {
  if (!username.value) return ''
  return username.value.split(' ').map(n => n[0]).join('').toUpperCase()
})

const checkAuth = async () => {
  const token = getToken()
  if (token) {
    isLoggedIn.value = true
    // Prefer backend user info
    try {
      const res = await api.get('me/')
      username.value = res.data.username || getUserFromToken(token)
      isTeacher.value = (res.data.role || '').toLowerCase() === 'teacher' || (res.data.role || '').toLowerCase() === 'staff'
    } catch {
      username.value = getUserFromToken(token)
      isTeacher.value = false
    }
  } else {
    isLoggedIn.value = false
    username.value = ''
    isTeacher.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('refreshToken')
  isLoggedIn.value = false
  username.value = ''
  isTeacher.value = false
  showDropdown.value = false
  router.push('/')
}



// Proactive token refresh - refresh token every 4 minutes if user is active
let refreshInterval = null

const startTokenRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  
  refreshInterval = setInterval(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
    if (!refreshToken) return
    
    try {
      const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'
      const response = await fetch(`${apiBaseURL}token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', data.access)
        } else {
          sessionStorage.setItem('token', data.access)
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }, 4 * 60 * 1000) // Refresh every 4 minutes
}

onMounted(() => {
  checkAuth()
  window.addEventListener('storage', checkAuth)
  startTokenRefresh() // Start periodic token refresh
})

// Watch for route changes to update isLearningPage
import { watch } from 'vue'
watch(() => route.path, () => {
  // Force reactivity update
})

// Listen for login events from Login.vue
window.addEventListener('login-success', () => {
  checkAuth()
  startTokenRefresh()
})

const openWagtail = () => {
  const token = getToken()
  if (!token) return
  const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'
  const url = `${apiBaseURL}wagtail/sso/?token=${encodeURIComponent(token)}`
  window.open(url, '_blank')
}
</script>
