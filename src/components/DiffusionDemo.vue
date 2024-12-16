<script setup lang="ts">
import { ref, computed } from 'vue'

// Constants for visualization
const imageSize = 128
const diagramWidth = 200
const diagramHeight = 100
const NUM_STEPS = 10
const MIN_NOISE = 0.02
const MAX_NOISE = 0.3

// Reactive state
const currentStep = ref(0)
const noiseLevel = computed(() => {
  return MIN_NOISE + (MAX_NOISE - MIN_NOISE) * (currentStep.value / (NUM_STEPS - 1))
})

// Generate diffusion steps with noise levels
const diffusionSteps = computed(() => Array.from({ length: NUM_STEPS }, (_, i) => ({
  timestep: i,
  noiseLevel: MIN_NOISE + (i / (NUM_STEPS - 1)) * (MAX_NOISE - MIN_NOISE),
})))

// Compute noise schedule path using cosine schedule
const getNoiseSchedulePath = (currentStep: number) => {
  const points = Array.from({ length: 100 }, (_, i) => {
    const t = i / 99
    const x = t * diagramWidth
    const y = diagramHeight - (Math.cos((t + 0.008) / 1.008 * Math.PI * 0.5) ** 2) * diagramHeight
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
}

// Get coordinates for step indicators
const getStepX = (step: number) => (step / (NUM_STEPS - 1)) * diagramWidth
const getStepY = (step: number) => {
  const t = step / (NUM_STEPS - 1)
  return diagramHeight - (Math.cos((t + 0.008) / 1.008 * Math.PI * 0.5) ** 2) * diagramHeight
}

// Handle slider changes
const handleStepChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  currentStep.value = parseInt(target.value, 10)
}
</script>

<template>
  <div class="diffusion-demo">
    <div class="visualization-container">
      <div class="image-container">
        <!-- Noise Image Visualization -->
        <svg :width="imageSize" :height="imageSize" class="noise-image">
          <defs>
            <filter :id="'noise-' + currentStep">
              <feTurbulence
                type="fractalNoise"
                :baseFrequency="noiseLevel"
                numOctaves="4"
                :seed="currentStep"
              />
              <feComponentTransfer>
                <feFuncR type="linear" slope="0.5" intercept="0.25"/>
                <feFuncG type="linear" slope="0.5" intercept="0.25"/>
                <feFuncB type="linear" slope="0.5" intercept="0.25"/>
              </feComponentTransfer>
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            :filter="'url(#noise-' + currentStep)"
          />
        </svg>
      </div>

      <div class="formula-container">
        <div class="formula-section">
          <h3>Forward Process (q)</h3>
          <div class="formula" :class="{ active: currentStep > 0 }">
            <p>x_t = √(αt) × x_{t-1} + √(1-αt) × ε</p>
          </div>
        </div>

        <!-- Noise Diagram -->
        <div class="noise-diagram">
          <svg :width="diagramWidth" :height="diagramHeight" class="noise-graph">
            <!-- Noise Schedule Curve -->
            <path
              :d="getNoiseSchedulePath(currentStep)"
              stroke="#2196F3"
              fill="none"
              stroke-width="2"
            />
            <!-- Current Step Indicator -->
            <circle
              :cx="getStepX(currentStep)"
              :cy="getStepY(currentStep)"
              r="4"
              fill="#FF4081"
            />
          </svg>
          <div class="step-label">t = {{ currentStep }}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="slider-container">
        <input
          type="range"
          :min="0"
          :max="NUM_STEPS - 1"
          :value="currentStep"
          @input="handleStepChange"
          class="step-slider"
        >
        <div class="step-info">
          <span>Step: {{ currentStep }}</span>
          <span>Noise Level: {{ noiseLevel.toFixed(3) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diffusion-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.visualization-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.image-container {
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.noise-image {
  width: 100%;
  height: 100%;
  background: #fff;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: #ddd;
}

.formula-container {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.formula-section {
  margin-bottom: 1.5rem;
}

.formula {
  padding: 1rem;
  border-radius: 4px;
  background: #f8f9fa;
  transition: background-color 0.3s ease;
}

.formula.active {
  background: #e3f2fd;
}

.controls {
  margin-top: 2rem;
}

.slider-container {
  width: 100%;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-slider {
  width: 100%;
  margin-bottom: 1rem;
}

.step-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.noise-diagram {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.noise-graph {
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.step-label {
  font-size: 14px;
  color: #666;
}
</style>
