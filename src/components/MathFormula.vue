<template>
  <div class="math-formula-container">
    <!-- Forward Process Section -->
    <div class="formula-section">
      <h3>Forward Process (q)</h3>
      <div class="formula markov-chain" :class="{ active: step > 0 }">
        x₀ → x₁ → x₂ → ... → x_{t-1} → x_t
      </div>
      <div class="formula transition" :class="{ active: step > 0 }">
        q(x_t|x_{t-1}) = 𝒩(x_t; √(1-βt)x_{t-1}, βtI)
      </div>
      <div class="parameters">
        β_t = {{ beta.toFixed(4) }}
      </div>
    </div>

    <!-- Noise Schedule Section -->
    <div class="formula-section">
      <h3>Noise Schedule</h3>
      <div class="formula schedule">
        0 ≤ β₁ < β₂ < ... < βₜ < 1
      </div>
      <div class="formula cosine-schedule">
        βₜ = 1 - cos((t/T + s)/(1 + s)×π/2)²/cos(s/(1 + s)×π/2)²
      </div>
      <div class="noise-value">
        t = {{ step }}
        noise = {{ noise.toFixed(4) }}
      </div>
    </div>

    <!-- Reverse Process Section -->
    <div class="formula-section">
      <h3>Reverse Process (p)</h3>
      <div class="formula reverse" :class="{ active: step < 9 }">
        p(x_{t-1}|x_t) = 𝒩(x_{t-1}; μ_θ(x_t,t), σ_t²I)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  step: number
  beta: number
  noise: number
}>()

const isForwardHighlighted = computed(() => props.step > 0)
</script>

<style scoped>
.math-formula-container {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 1rem 0;
  background: #fff;
  font-family: 'Times New Roman', serif;
}

.formula-section {
  margin-bottom: 1.5rem;
}

.formula-section:last-child {
  margin-bottom: 0;
}

.formula {
  font-size: 1.2rem;
  padding: 0.75rem;
  border-radius: 4px;
  background: #f8f9fa;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
}

.formula.active {
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.markov-chain {
  font-style: italic;
}

.transition, .reverse {
  font-size: 1.1rem;
}

.schedule, .cosine-schedule {
  font-size: 1rem;
  color: #666;
}

.parameters, .noise-value {
  font-family: monospace;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

h3 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.noise-value {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}
</style>
