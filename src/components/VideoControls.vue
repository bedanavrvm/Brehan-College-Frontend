<template>
  <div class="video-controls-wrapper" @mouseenter="showControls = true" @mouseleave="showControls = false">
    <div class="video-controls-overlay" :class="{ 'visible': showControls }">
      <div class="video-controls-bar">
        <!-- Playback Speed Control -->
        <div class="control-group">
          <button 
            @click="toggleSpeedMenu" 
            class="control-btn"
            :class="{ 'active': showSpeedMenu }"
            title="Playback Speed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span class="control-label">{{ currentSpeed }}x</span>
          </button>
          
          <!-- Speed Menu -->
          <div v-if="showSpeedMenu" class="control-menu speed-menu">
            <div class="menu-header">Playback Speed</div>
            <button
              v-for="speed in speeds"
              :key="speed"
              @click="setSpeed(speed)"
              class="menu-item"
              :class="{ 'active': currentSpeed === speed }"
            >
              <span>{{ speed }}x</span>
              <svg v-if="currentSpeed === speed" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Picture-in-Picture -->
        <button 
          @click="$emit('togglePiP')" 
          class="control-btn"
          :class="{ 'active': isPiPActive }"
          title="Picture-in-Picture (i)"
        >
          <svg v-if="!isPiPActive" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
          </svg>
          <span class="control-label sr-only">PiP</span>
        </button>

        <!-- Quality Selector -->
        <div class="control-group">
          <button 
            @click="toggleQualityMenu" 
            class="control-btn"
            :class="{ 'active': showQualityMenu }"
            title="Video Quality"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="control-label">{{ currentQuality }}</span>
          </button>
          
          <!-- Quality Menu -->
          <div v-if="showQualityMenu" class="control-menu quality-menu">
            <div class="menu-header">Video Quality</div>
            <button
              v-for="quality in qualities"
              :key="quality"
              @click="setQuality(quality)"
              class="menu-item"
              :class="{ 'active': currentQuality === quality }"
            >
              <span>{{ quality }}</span>
              <svg v-if="currentQuality === quality" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Keyboard Hint -->
        <div class="keyboard-hint">
          <span class="hint-text">Press <kbd>i</kbd> for Picture-in-Picture</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentSpeed: {
    type: Number,
    default: 1
  },
  isPiPActive: {
    type: Boolean,
    default: false
  },
  currentQuality: {
    type: String,
    default: 'auto'
  }
})

const emit = defineEmits(['setSpeed', 'togglePiP', 'setQuality'])

const showControls = ref(false)
const showSpeedMenu = ref(false)
const showQualityMenu = ref(false)

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const qualities = ['auto', '1080p', '720p', '480p', '360p']

const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value
  showQualityMenu.value = false
}

const toggleQualityMenu = () => {
  showQualityMenu.value = !showQualityMenu.value
  showSpeedMenu.value = false
}

const setSpeed = (speed) => {
  emit('setSpeed', speed)
  showSpeedMenu.value = false
}

const setQuality = (quality) => {
  emit('setQuality', quality)
  showQualityMenu.value = false
}
</script>

<style scoped>
.video-controls-wrapper {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
}

.video-controls-overlay {
  
  padding: 1rem 1.5rem;

  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

.video-controls-overlay.visible {
  opacity: 1;
}

.video-controls-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.control-group {
  position: relative;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.control-btn.active {
  background: rgba(99, 102, 241, 0.8);
  border-color: rgba(99, 102, 241, 1);
}

.control-label {
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.control-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 0.5rem;
  min-width: 10rem;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  background: transparent;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.keyboard-hint {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.hint-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.hint-text kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  margin: 0 0.125rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
