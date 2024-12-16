<script setup lang="ts">
import { computed, ref } from 'vue'
import MathFormula from './MathFormula.vue'
import { useDDPM } from '../composables/useDDPM'

// Constants for visualization
const imageSize = 128
const diagramWidth = 160
const diagramHeight = 80

// Use DDPM state management
const {
  currentStep,
  noiseLevel,
  noiseParams,
  getBeta,
  getNoiseSchedulePath,
  getStepCoordinates,
  setStep,
  NUM_STEPS
} = useDDPM()

// Create array of all steps
const allSteps = Array.from({ length: NUM_STEPS }, (_, i) => i)

// Get coordinates for step indicators
const getStepX = (step: number) => getStepCoordinates(step, diagramWidth, diagramHeight).x
const getStepY = (step: number) => getStepCoordinates(step, diagramWidth, diagramHeight).y

// Handle step selection
const selectedStep = ref(0)
const handleStepSelect = (step: number) => {
  selectedStep.value = step
  setStep(step)
}
</script>

<template>
  <div class="diffusion-demo">
    <div class="steps-grid">
      <div
        v-for="step in allSteps"
        :key="step"
        class="step-item"
        :class="{ selected: step === selectedStep }"
        @click="handleStepSelect(step)"
      >
        <div class="step-header">
          <span class="step-label">Step {{ step }}</span>
          <span class="noise-value">β = {{ getBeta(step).toFixed(4) }}</span>
        </div>

        <!-- Noise Image -->
        <svg :width="imageSize" :height="imageSize" class="noise-image">
          <defs>
            <filter :id="'noise-' + step">
              <feTurbulence
                type="fractalNoise"
                :baseFrequency="noiseParams.baseFrequency"
                :numOctaves="noiseParams.numOctaves"
                :seed="noiseParams.seed"
              />
              <feComponentTransfer>
                <feFuncR type="linear" :slope="noiseParams.scale" :intercept="0.25"/>
                <feFuncG type="linear" :slope="noiseParams.scale" :intercept="0.25"/>
                <feFuncB type="linear" :slope="noiseParams.scale" :intercept="0.25"/>
              </feComponentTransfer>
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            :filter="`url(#noise-${step})`"
          />
        </svg>

        <!-- Mini Noise Diagram -->
        <div class="mini-noise-diagram">
          <svg :width="diagramWidth" :height="diagramHeight" class="noise-graph">
            <path
              :d="getNoiseSchedulePath(diagramWidth, diagramHeight)"
              stroke="#2196F3"
              fill="none"
              stroke-width="1.5"
            />
            <circle
              :cx="getStepX(step)"
              :cy="getStepY(step)"
              r="3"
              fill="#FF4081"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="formula-container">
      <MathFormula
        :step="selectedStep"
        :beta="getBeta(selectedStep)"
        :noise="noiseLevel"
      />
    </div>
  </div>
</template>

<style scoped>
.diffusion-demo {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.step-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.step-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.step-item.selected {
  border: 2px solid #2196F3;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.step-label {
  font-weight: 600;
  color: #333;
}

.noise-value {
  font-size: 0.9rem;
  color: #666;
}

.noise-image {
  width: 100%;
  height: auto;
  margin: 0.5rem 0;
  background: #fff;
  border-radius: 4px;
}

.mini-noise-diagram {
  margin-top: 0.5rem;
}

.noise-graph {
  background: #f8f9fa;
  border-radius: 4px;
  width: 100%;
  height: auto;
}

.formula-container {
  position: sticky;
  top: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
</template>
