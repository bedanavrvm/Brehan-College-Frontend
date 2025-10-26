<template>
  <div class="auth-page">
    <div class="register-card">
      <h1 class="section-title">Register</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Account Type</label>
          <select v-model="role" class="form-input" required>
            <option value="student">Student</option>
            <option value="teacher">Lecturer</option>
          </select>
        </div>
        <button type="submit" class="primary-button">Register</button>
        <div v-if="error" class="alert-error" style="margin-top: 1rem;">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const role = ref('student')
const router = useRouter()

const register = async () => {
  error.value = ''
  try {
    await api.post('register/', {
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    router.push('/login')
  } catch (e) {
    error.value = 'Registration failed.'
  }
}
</script>
