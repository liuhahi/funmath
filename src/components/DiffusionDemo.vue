<script setup lang="ts">
import { computed } from 'vue'
import MathFormula from './MathFormula.vue'
import { useDDPM } from '../composables/useDDPM'

// Constants for visualization
const imageSize = 128
const diagramWidth = 200
const diagramHeight = 100

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

// Handle slider changes
const handleStepChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  setStep(parseInt(target.value, 10))
}

// Get coordinates for step indicators
const getStepX = (step: number) => getStepCoordinates(step, diagramWidth, diagramHeight).x
const getStepY = (step: number) => getStepCoordinates(step, diagramWidth, diagramHeight).y
</script>

<template>
  <div class="diffusion-demo">
    <div class="visualization-container">
      <div class="image-container">
        <!-- Noise Image Visualization with improved noise generation -->
        <svg :width="imageSize" :height="imageSize" class="noise-image">
          <defs>
            <filter :id="'noise-' + currentStep">
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
            :filter="`url(#noise-${currentStep})`"
          />
        </svg>
      </div>

      <div class="formula-container">
        <MathFormula
          :step="currentStep"
          :beta="getBeta(currentStep)"
          :noise="noiseLevel"
        />
      </div>

      <!-- Noise Diagram with proper cosine schedule -->
      <div class="noise-diagram">
        <svg :width="diagramWidth" :height="diagramHeight" class="noise-graph">
          <!-- Noise Schedule Curve -->
          <path
            :d="getNoiseSchedulePath(diagramWidth, diagramHeight)"
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
        <div class="step-label">
          <span>t = {{ currentStep }}</span>
          <span class="noise-value">noise = {{ noiseLevel.toFixed(4) }}</span>
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
          <span>β: {{ getBeta(currentStep).toFixed(4) }}</span>
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
  display: flex;
  gap: 1rem;
}

.noise-value {
  color: #2196F3;
}

.noise-level {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}
</style>
