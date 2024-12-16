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
  grid-template-columns: minmax(0, 3fr) minmax(300px, 1fr);
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.step-item {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.step-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.step-item.selected {
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.step-label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.noise-value {
  font-size: 0.9rem;
  color: #2196F3;
  font-weight: 500;
}

.noise-image {
  width: 100%;
  height: auto;
  margin: 0.75rem 0;
  background: #fff;
  border-radius: 8px;
  transition: filter 0.3s ease;
}

.mini-noise-diagram {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.step-item:hover .mini-noise-diagram {
  background: #f0f7ff;
}

.noise-graph {
  background: transparent;
  border-radius: 4px;
  width: 100%;
  height: auto;
}

.formula-container {
  position: sticky;
  top: 1.5rem;
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.formula-container:hover {
  transform: translateY(-2px);
}

@media (max-width: 1200px) {
  .diffusion-demo {
    grid-template-columns: 1fr;
  }

  .formula-container {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 640px) {
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    padding: 1rem;
  }
}
</style>
