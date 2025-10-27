<template>
  <div class="auth-page">
    <div class="register-card">
      <!-- Logo/Header Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p class="text-gray-600">Join Brehan College today</p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="register" class="space-y-5">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-input" placeholder="Choose a username" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="your.email@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" placeholder="Create a strong password" required />
        </div>
        <div class="form-group">
          <label class="form-label">Account Type</label>
          <select v-model="role" class="form-input" required>
            <option value="student">Student</option>
            <option value="teacher">Lecturer</option>
          </select>
        </div>
        <button type="submit" class="primary-button">Create Account</button>
        <div v-if="error" class="alert-error">{{ error }}</div>
      </form>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const role = ref('student')
const router = useRouter()
const toast = useToast()

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validation function
const validateForm = () => {
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

  if (username.value.length > 30) {
    toast.warning('Username must be less than 30 characters')
    return false
  }

  // Check for invalid characters in username
  if (!/^[a-zA-Z0-9_-]+$/.test(username.value)) {
    toast.warning('Username can only contain letters, numbers, hyphens, and underscores')
    return false
  }

  // Email validation
  if (!email.value || email.value.trim() === '') {
    toast.error('Email is required')
    return false
  }

  if (!emailRegex.test(email.value)) {
    toast.error('Please enter a valid email address')
    return false
  }

  // Password validation
  if (!password.value || password.value.trim() === '') {
    toast.error('Password is required')
    return false
  }

  if (password.value.length < 8) {
    toast.warning('Password must be at least 8 characters long')
    return false
  }

  if (password.value.length > 128) {
    toast.warning('Password must be less than 128 characters')
    return false
  }

  // Password strength check
  const hasUpperCase = /[A-Z]/.test(password.value)
  const hasLowerCase = /[a-z]/.test(password.value)
  const hasNumber = /\d/.test(password.value)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    toast.warning('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    return false
  }

  // Role validation
  if (!role.value) {
    toast.error('Please select an account type')
    return false
  }

  return true
}

const register = async () => {
  // Validate form before submitting
  if (!validateForm()) {
    return
  }

  try {
    toast.info('Creating your account...')

    await api.post('register/', {
      username: username.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      role: role.value,
    })

    // Success notification
    toast.success('Account created successfully! Please sign in. ✨')
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 1500)

  } catch (e) {
    console.error('Registration error:', e)

    // Handle different error scenarios
    if (e.response) {
      if (e.response.status === 400) {
        // Check for specific error messages
        const errorData = e.response.data
        if (errorData.username) {
          toast.error('Username already taken. Please choose another.')
        } else if (errorData.email) {
          toast.error('Email already registered. Please use another or sign in.')
        } else {
          toast.error('Invalid registration data. Please check your information.')
        }
      } else if (e.response.status === 409) {
        toast.error('Account already exists. Please sign in instead.')
      } else if (e.response.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } else if (e.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }

    error.value = 'Registration failed'
  }
}
</script>
