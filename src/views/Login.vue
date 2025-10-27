<template>
  <div class="auth-page">
    <div class="login-card">
      <!-- Logo/Header Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p class="text-gray-600">Sign in to continue to Brehan College</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-5">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" required />
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="rememberMe" v-model="rememberMe" type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label for="rememberMe" class="ml-2 text-sm text-gray-700">Remember me</label>
          </div>
        </div>
        <button type="submit" class="primary-button">Sign In</button>
        <div v-if="error" class="alert-error">{{ error }}</div>
      </form>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const username = ref('')
const password = ref('')
const error = ref('')
const rememberMe = ref(true)
const router = useRouter()
const toast = useToast()

// Validation function
const validateForm = () => {
  // Clear previous errors
  error.value = ''

  // Username validation
  if (!username.value || username.value.trim() === '') {
    toast.error('Username is required')
    return false
  }

  if (username.value.length < 3) {
    toast.warning('Username must be at least 3 characters long')
    return false
  }

  // Password validation
  if (!password.value || password.value.trim() === '') {
    toast.error('Password is required')
    return false
  }

  if (password.value.length < 6) {
    toast.warning('Password must be at least 6 characters long')
    return false
  }

  return true
}

const login = async () => {
  console.log('Login method triggered')
  
  // Validate form before submitting
  if (!validateForm()) {
    return
  }

  try {
    toast.info('Signing in...')
    
    const res = await api.post('token/', {
      username: username.value.trim(),
      password: password.value,
    })
    
    if (rememberMe.value) {
      localStorage.setItem('token', res.data.access)
      localStorage.setItem('refreshToken', res.data.refresh)
    } else {
      sessionStorage.setItem('token', res.data.access)
      sessionStorage.setItem('refreshToken', res.data.refresh)
    }
    
    // Success notification
    toast.success(`Welcome back, ${username.value}! 🎉`)
    
    // Notify App.vue to update profile display
    window.dispatchEvent(new Event('login-success'))
    
    // Fetch lecturer's courses after login
    const coursesRes = await api.get('cms/courses/?teacher=' + username.value)
    if (coursesRes.data.length > 0) {
      router.push(`/courses/${coursesRes.data[0].id}`)
    } else {
      router.push('/')
    }
  } catch (e) {
    console.error('Login error:', e)
    
    // Handle different error scenarios
    if (e.response) {
      if (e.response.status === 401) {
        toast.error('Invalid username or password. Please try again.')
      } else if (e.response.status === 400) {
        toast.error('Please check your credentials and try again.')
      } else if (e.response.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } else if (e.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }
    
    error.value = 'Login failed'
  }
}

// Auto-login if token exists
onMounted(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    toast.info('You are already logged in. Redirecting...')
    router.push('/')
  }
})
</script>
