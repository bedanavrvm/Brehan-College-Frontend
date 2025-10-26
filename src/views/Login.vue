<template>
  <div class="auth-page">
    <div class="login-card">
      <h1 class="section-title">Login</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" required />
        </div>
        <div class="form-group">
          <input id="rememberMe" v-model="rememberMe" type="checkbox" style="margin-right: 0.5rem;" />
          <label for="rememberMe" class="field-label" style="display: inline;">Remember me</label>
        </div>
        <button type="submit" class="primary-button">Login</button>
        <div v-if="error" class="alert-error" style="margin-top: 1rem;">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')

const error = ref('')
const rememberMe = ref(true)
const router = useRouter()

const login = async () => {
  console.log('Login method triggered');
  error.value = ''
  try {
    const res = await api.post('token/', {
      username: username.value,
      password: password.value,
    })
    if (rememberMe.value) {
      localStorage.setItem('token', res.data.access)
      localStorage.setItem('refreshToken', res.data.refresh)
    } else {
      sessionStorage.setItem('token', res.data.access)
      sessionStorage.setItem('refreshToken', res.data.refresh)
    }
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
    error.value = 'Invalid credentials.'
  }
}

// Auto-login if token exists
onMounted(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})
</script>
