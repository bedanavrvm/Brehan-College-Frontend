<template>
  <div class="code-block-wrapper">
    <div class="code-block-header">
      <span v-if="language" class="code-language">{{ language }}</span>
      <button @click="copyCode" class="copy-button" :class="{ 'copied': copied }">
        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="ml-1">{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <pre class="code-content"><code ref="codeElement" :class="`language-${language}`"><slot></slot></code></pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'plaintext'
  },
  code: {
    type: String,
    default: ''
  }
})

const codeElement = ref(null)
const copied = ref(false)

const copyCode = async () => {
  const code = codeElement.value?.textContent || props.code
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

onMounted(() => {
  // Future: Add syntax highlighting library like Prism.js or Highlight.js
  // For now, basic styling with language-specific classes
})
</script>

<style scoped>
.code-block-wrapper {
  margin: 1.5rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #1e293b;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border-bottom: 1px solid #334155;
}

.code-language {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.copy-button {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.copy-button:hover {
  background: #475569;
  border-color: #64748b;
  color: #f1f5f9;
}

.copy-button.copied {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.code-content {
  margin: 0;
  padding: 1.25rem;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e2e8f0;
  background: #1e293b;
}

.code-content code {
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  padding: 0;
  color: inherit;
}

/* Basic syntax highlighting colors */
.code-content :deep(.keyword) {
  color: #c792ea;
}

.code-content :deep(.string) {
  color: #c3e88d;
}

.code-content :deep(.function) {
  color: #82aaff;
}

.code-content :deep(.comment) {
  color: #546e7a;
  font-style: italic;
}

.code-content :deep(.number) {
  color: #f78c6c;
}

.code-content :deep(.operator) {
  color: #89ddff;
}

/* Language-specific styles */
.language-python :deep(.keyword) {
  color: #ff79c6;
}

.language-javascript :deep(.keyword) {
  color: #c792ea;
}

.language-html :deep(.tag) {
  color: #f07178;
}

.language-css :deep(.property) {
  color: #82aaff;
}
</style>
