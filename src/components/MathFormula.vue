<template>
  <div class="math-formula-container">
    <!-- Forward Process Section -->
    <div class="formula-section">
      <h3>Forward Process (q)</h3>
      <div class="formula markov-chain" :class="{ active: step > 0 }" v-html="renderKatex(markovChain)"></div>
      <div class="formula transition" :class="{ active: step > 0 }" v-html="renderKatex(forwardProcess)"></div>
      <div class="parameters" v-html="renderKatex(`\\beta_t = ${beta.toFixed(4)}`)"></div>
    </div>

    <!-- Noise Schedule Section -->
    <div class="formula-section">
      <h3>Noise Schedule</h3>
      <div class="formula schedule" v-html="renderKatex(betaSchedule)"></div>
      <div class="formula cosine-schedule" v-html="renderKatex(cosineSchedule)"></div>
      <div class="noise-value">
        <span v-html="renderKatex(`t = ${step}`)"></span>
        <span v-html="renderKatex(`\\text{noise} = ${noise.toFixed(4)}`)"></span>
      </div>
    </div>

    <!-- Reverse Process Section -->
    <div class="formula-section">
      <h3>Reverse Process (p)</h3>
      <div class="formula reverse" :class="{ active: step < 9 }" v-html="renderKatex(reverseProcess)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps<{
  step: number
  beta: number
  noise: number
}>()

const renderKatex = (formula: string) => {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    })
  } catch (e) {
    console.error('KaTeX error:', e)
    return formula
  }
}

// LaTeX formulas from reference implementation
const markovChain = 'x_0 \\rightarrow x_1 \\rightarrow x_2 \\rightarrow \\cdots \\rightarrow x_{t-1} \\rightarrow x_t'
const forwardProcess = 'q(x_t|x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1-\\beta_t}x_{t-1}, \\beta_tI)'
const betaSchedule = '0 \\leq \\beta_1 < \\beta_2 < \\cdots < \\beta_t < 1'
const cosineSchedule = '\\beta_t = 1 - \\cos\\left(\\frac{t/T + s}{1 + s}\\times\\frac{\\pi}{2}\\right)^2/\\cos\\left(\\frac{s}{1 + s}\\times\\frac{\\pi}{2}\\right)^2'
const reverseProcess = 'p(x_{t-1}|x_t) = \\mathcal{N}(x_{t-1}; \\mu_\\theta(x_t,t), \\sigma_t^2I)'

const isForwardHighlighted = computed(() => props.step > 0)
</script>

<style scoped>
.math-formula-container {
  padding: 2rem;
  border-radius: 12px;
  margin: 0;
  background: #fff;
  font-family: 'Times New Roman', serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.formula-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.formula-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.formula {
  font-size: 1.25rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  margin: 0.75rem 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.formula.active {
  background: #e3f2fd;
  border-left-color: #2196F3;
  transform: translateX(4px);
}

.markov-chain {
  font-style: italic;
  color: #1a1a1a;
}

.transition, .reverse {
  font-size: 1.2rem;
  letter-spacing: 0.01em;
}

.schedule, .cosine-schedule {
  font-size: 1.1rem;
  color: #424242;
  line-height: 1.6;
}

.parameters, .noise-value {
  font-family: 'SF Mono', 'Consolas', monospace;
  margin-top: 0.75rem;
  color: #2196F3;
  font-size: 0.95rem;
  font-weight: 500;
}

h3 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.noise-value {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f0f7ff;
  border-radius: 8px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Add KaTeX specific overrides */
:deep(.katex-display) {
  margin: 0.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(.katex) {
  font-size: 1.1em;
}
</style>
