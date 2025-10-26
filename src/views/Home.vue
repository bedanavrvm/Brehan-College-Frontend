<template>
  <div class="modern-home">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content animate-fade-in">
        <div class="hero-badge">
          🎓 Welcome to Learning Excellence
        </div>
        <h1 class="hero-title">
          Learn at Your Own Pace
        </h1>
        <p class="hero-description">
          Brehan Platform is your all-in-one solution for online learning. 
          Discover engaging courses, track your progress, and join a vibrant learning community.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="hero-btn-primary btn-hover-lift group">
            Get Started
            <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </router-link>
          <router-link to="/courses" class="hero-btn-secondary btn-hover-lift">
            Browse Courses
          </router-link>
        </div>
      </div>
      
      <!-- Decorative gradient -->
      <div class="hero-gradient"></div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-container">
        <div class="features-header">
          <h2 class="features-title">Why Choose Brehan?</h2>
          <p class="features-subtitle">Everything you need for an exceptional learning experience</p>
        </div>
        
        <div class="features-grid">
          <!-- Feature 1 -->
          <div class="feature-card card-interactive animate-fade-in" style="animation-delay: 0.1s;">
            <div class="feature-icon bg-indigo-100 text-indigo-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="feature-heading">Expert-Led Courses</h3>
            <p class="feature-text">Learn from industry professionals with years of experience</p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card card-interactive animate-fade-in" style="animation-delay: 0.2s;">
            <div class="feature-icon bg-purple-100 text-purple-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="feature-heading">Track Your Progress</h3>
            <p class="feature-text">Monitor your learning journey with detailed analytics and insights</p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card card-interactive animate-fade-in" style="animation-delay: 0.3s;">
            <div class="feature-icon bg-pink-100 text-pink-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="feature-heading">Learning Community</h3>
            <p class="feature-text">Connect with fellow learners and grow together</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Modern home page with hero and features
</script>
