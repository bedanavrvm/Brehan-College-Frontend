<template>
  <div class="quiz-container">
    <div v-if="loading" class="loading">Loading quiz...</div>

    <!-- Quiz Intro -->
    <div v-else-if="!currentAttempt" class="quiz-intro">
      <h1>{{ quiz.title }}</h1>
      <p>{{ quiz.description }}</p>
      
      <div class="quiz-info">
        <div><strong>Questions:</strong> {{ quiz.question_count }}</div>
        <div><strong>Points:</strong> {{ quiz.total_points }}</div>
        <div><strong>Passing:</strong> {{ quiz.passing_score }}%</div>
        <div v-if="quiz.time_limit"><strong>Time:</strong> {{ quiz.time_limit }} min</div>
        <div><strong>Attempts Left:</strong> {{ attemptsRemaining }}</div>
      </div>

      <button @click="startQuiz" class="btn-primary" :disabled="attemptsRemaining <= 0">
        {{ attemptsRemaining > 0 ? 'Start Quiz' : 'No Attempts Left' }}
      </button>
      <button @click="$emit('close')" class="btn-secondary">Cancel</button>
    </div>

    <!-- Taking Quiz -->
    <div v-else-if="currentAttempt.status === 'in_progress'" class="quiz-taking">
      <div class="quiz-header">
        <div>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</div>
        <div v-if="timeRemaining">⏱️ {{ formatTime(timeRemaining) }}</div>
      </div>

      <div v-if="currentQuestion" class="question">
        <h2>{{ currentQuestion.question_text }}</h2>
        
        <!-- Multiple Choice / True False -->
        <div v-if="['multiple_choice', 'true_false'].includes(currentQuestion.question_type)">
          <div v-for="answer in currentQuestion.answers" :key="answer.id" 
               class="answer-option"
               :class="{ selected: userAnswers[currentQuestion.id]?.selected_answer === answer.id }"
               @click="selectAnswer(currentQuestion.id, answer.id)">
            <input type="radio" :checked="userAnswers[currentQuestion.id]?.selected_answer === answer.id" />
            <label>{{ answer.answer_text }}</label>
          </div>
        </div>

        <!-- Short Answer -->
        <input v-else-if="currentQuestion.question_type === 'short_answer'"
               v-model="userAnswers[currentQuestion.id].text_answer"
               type="text" placeholder="Your answer..." class="text-input" />

        <!-- Essay -->
        <textarea v-else-if="currentQuestion.question_type === 'essay'"
                  v-model="userAnswers[currentQuestion.id].text_answer"
                  rows="8" placeholder="Your essay..." class="textarea-input"></textarea>
      </div>

      <div class="quiz-nav">
        <button @click="previousQuestion" :disabled="currentQuestionIndex === 0">← Prev</button>
        <button @click="saveProgress">Save Progress</button>
        <button v-if="currentQuestionIndex < quiz.questions.length - 1" @click="nextQuestion">Next →</button>
        <button v-else @click="confirmSubmit" class="btn-primary">Submit</button>
      </div>
    </div>

    <!-- Results -->
    <div v-else class="quiz-results">
      <h1>Quiz Results</h1>
      <div class="score" :class="{ passed: currentAttempt.passed }">
        <div class="score-value">{{ currentAttempt.score?.toFixed(1) }}%</div>
        <div>{{ currentAttempt.passed ? 'PASSED ✓' : 'FAILED ✗' }}</div>
      </div>

      <div class="stats">
        <div>Points: {{ currentAttempt.points_earned }} / {{ currentAttempt.total_points }}</div>
        <div>Time: {{ formatDuration(currentAttempt.time_taken) }}</div>
        <div>Attempt: {{ currentAttempt.attempt_number }}</div>
      </div>

      <button v-if="attemptsRemaining > 0" @click="retakeQuiz" class="btn-primary">
        Retake ({{ attemptsRemaining }} left)
      </button>
      <button @click="$emit('close')" class="btn-secondary">Close</button>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="modal" @click="showConfirmModal = false">
      <div class="modal-content" @click.stop>
        <h2>Submit Quiz?</h2>
        <p>You cannot change answers after submission.</p>
        <p v-if="unansweredCount > 0" class="warning">⚠️ {{ unansweredCount }} unanswered</p>
        <button @click="submitQuiz" class="btn-primary">Submit</button>
        <button @click="showConfirmModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../utils'

const props = defineProps({ quizId: Number })
const emit = defineEmits(['close', 'completed'])

const quiz = ref(null)
const currentAttempt = ref(null)
const loading = ref(true)
const currentQuestionIndex = ref(0)
const userAnswers = ref({})
const timeRemaining = ref(null)
const timerInterval = ref(null)
const showConfirmModal = ref(false)
const myStats = ref(null)

const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value])
const attemptsRemaining = computed(() => myStats.value?.attempts_remaining || 0)
const unansweredCount = computed(() => 
  quiz.value?.questions.filter(q => !isQuestionAnswered(q.id)).length || 0
)

const loadQuiz = async () => {
  try {
    const [quizRes, statsRes, attemptsRes] = await Promise.all([
      api.get(`quizzes/${props.quizId}/`),
      api.get(`quizzes/${props.quizId}/my-stats/`),
      api.get(`quizzes/${props.quizId}/my-attempts/`)
    ])
    quiz.value = quizRes.data
    myStats.value = statsRes.data
    const inProgress = attemptsRes.data.find(a => a.status === 'in_progress')
    if (inProgress) await loadAttempt(inProgress.id)
  } finally {
    loading.value = false
  }
}

const loadAttempt = async (id) => {
  const res = await api.get(`quiz-attempts/${id}/`)
  currentAttempt.value = res.data
  res.data.responses?.forEach(r => {
    userAnswers.value[r.question] = {
      selected_answer: r.selected_answer,
      text_answer: r.text_answer || ''
    }
  })
  if (quiz.value.time_limit) startTimer()
}

const startQuiz = async () => {
  const res = await api.post(`quizzes/${props.quizId}/start-attempt/`)
  currentAttempt.value = res.data
  quiz.value.questions.forEach(q => {
    userAnswers.value[q.id] = { selected_answer: null, text_answer: '' }
  })
  if (quiz.value.time_limit) startTimer()
}

const startTimer = () => {
  const elapsed = Math.floor((new Date() - new Date(currentAttempt.value.started_at)) / 1000)
  timeRemaining.value = quiz.value.time_limit * 60 - elapsed
  timerInterval.value = setInterval(() => {
    if (--timeRemaining.value <= 0) {
      clearInterval(timerInterval.value)
      submitQuiz()
    }
  }, 1000)
}

const selectAnswer = (qId, aId) => {
  if (!userAnswers.value[qId]) userAnswers.value[qId] = {}
  userAnswers.value[qId].selected_answer = aId
}

const isQuestionAnswered = (qId) => {
  const a = userAnswers.value[qId]
  return !!(a?.selected_answer || a?.text_answer)
}

const nextQuestion = () => currentQuestionIndex.value++
const previousQuestion = () => currentQuestionIndex.value--

const saveProgress = async () => {
  const responses = Object.entries(userAnswers.value).map(([qId, ans]) => ({
    question_id: parseInt(qId), ...ans
  }))
  await api.post(`quiz-attempts/${currentAttempt.value.id}/save-progress/`, { responses })
}

const confirmSubmit = () => { showConfirmModal.value = true }

const submitQuiz = async () => {
  showConfirmModal.value = false
  const responses = Object.entries(userAnswers.value).map(([qId, ans]) => ({
    question_id: parseInt(qId), ...ans
  }))
  const res = await api.post(`quiz-attempts/${currentAttempt.value.id}/submit/`, { responses })
  currentAttempt.value = res.data
  if (timerInterval.value) clearInterval(timerInterval.value)
  const statsRes = await api.get(`quizzes/${props.quizId}/my-stats/`)
  myStats.value = statsRes.data
  emit('completed', currentAttempt.value)
}

const retakeQuiz = () => {
  currentAttempt.value = null
  currentQuestionIndex.value = 0
  userAnswers.value = {}
  startQuiz()
}

const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
const formatDuration = (s) => s ? `${Math.floor(s/60)}m ${s%60}s` : 'N/A'

onMounted(loadQuiz)
onUnmounted(() => timerInterval.value && clearInterval(timerInterval.value))
</script>

<style scoped>
.quiz-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
.loading { text-align: center; padding: 3rem; }
.quiz-intro, .quiz-taking, .quiz-results { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.quiz-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0; padding: 1rem; background: #f9fafb; border-radius: 8px; }
.quiz-header { display: flex; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
.question { margin-bottom: 2rem; }
.question h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
.answer-option { padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem; }
.answer-option:hover { border-color: #3b82f6; background: #eff6ff; }
.answer-option.selected { border-color: #3b82f6; background: #eff6ff; }
.text-input, .textarea-input { width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; }
.textarea-input { resize: vertical; font-family: inherit; }
.quiz-nav { display: flex; gap: 1rem; justify-content: space-between; }
.score { text-align: center; padding: 2rem; border-radius: 12px; background: #fee2e2; margin: 1rem 0; }
.score.passed { background: #d1fae5; }
.score-value { font-size: 3rem; font-weight: 700; color: #dc2626; }
.score.passed .score-value { color: #059669; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; padding: 1rem; background: #f9fafb; border-radius: 8px; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; }
.modal-content h2 { margin-bottom: 1rem; }
.modal-content p { margin-bottom: 1rem; }
.warning { color: #dc2626; font-weight: 600; }
.btn-primary { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
.btn-secondary { background: #6b7280; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; margin-left: 0.5rem; }
.btn-secondary:hover { background: #4b5563; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
