<template>
  <div class="account-container">
    <h1 class="account-title">Account</h1>
    <div class="account-field">
      <span class="field-label">Username:</span>
      <span class="field-value">{{ username }}</span>
    </div>
    <div class="account-field">
      <span class="field-label">Account Type:</span>
      <span class="field-value">{{ accountType }}</span>
    </div>
    <p class="account-note">More account details coming soon.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils'

const username = ref('')
const accountType = ref('')

const fallbackFromToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      username.value = payload.username || ''
      const role = payload.role || payload.type || payload.account_type || 'Unknown'
      accountType.value = role.charAt(0).toUpperCase() + role.slice(1)
    } catch {
      username.value = ''
      accountType.value = 'Unknown'
    }
  } else {
    username.value = ''
    accountType.value = 'Unknown'
  }
}

onMounted(async () => {
  try {
    const res = await api.get('me/')
    username.value = res.data.username || ''
    accountType.value = (res.data.role || 'Unknown').charAt(0).toUpperCase() + (res.data.role || 'Unknown').slice(1)
  } catch (err) {
    // If API call fails (even after token refresh), fall back to token data
    fallbackFromToken()
  }
})
</script>

