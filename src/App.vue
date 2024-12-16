<template>
  <div class="container">
    <h1>DDPM Visualization</h1>

    <!-- Diffusion Process Container -->
    <div class="diffusion-container">
      <div v-for="(step, index) in diffusionSteps" :key="index" class="step-container">
        <div class="image-container">
          <!-- Noisy Image Visualization using SVG -->
          <svg :width="imageSize" :height="imageSize" class="noise-image">
            <defs>
              <filter :id="'noise-' + index">
                <feTurbulence
                  type="fractalNoise"
                  :baseFrequency="step.noiseLevel"
                  numOctaves="4"
                  :seed="index"
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
              :filter="'url(#noise-' + index)"
            />
          </svg>
        </div>

        <!-- Noise Level Diagram -->
        <div class="noise-diagram">
          <svg :width="diagramWidth" :height="diagramHeight" class="noise-graph">
            <!-- Noise Schedule Curve -->
            <path
              :d="getNoiseSchedulePath(index)"
              stroke="#2196F3"
              fill="none"
              stroke-width="2"
            />
            <!-- Current Step Indicator -->
            <circle
              :cx="getStepX(index)"
              :cy="getStepY(index)"
              r="4"
              fill="#FF4081"
            />
          </svg>
          <div class="step-label">t = {{ step.timestep }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Constants for visualization
const imageSize = 128
const diagramWidth = 200
const diagramHeight = 100
const totalSteps = 10

// Generate diffusion steps with noise levels
const diffusionSteps = ref(Array.from({ length: totalSteps }, (_, i) => ({
  timestep: i,
  noiseLevel: 0.02 + (i / totalSteps) * 0.3, // Increasing noise levels
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

// Get x-coordinate for current step indicator
const getStepX = (step: number) => (step / (totalSteps - 1)) * diagramWidth

// Get y-coordinate for current step indicator
const getStepY = (step: number) => {
  const t = step / (totalSteps - 1)
  return diagramHeight - (Math.cos((t + 0.008) / 1.008 * Math.PI * 0.5) ** 2) * diagramHeight
}
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.diffusion-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.noise-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.noise-graph {
  background: #f5f5f5;
  border-radius: 4px;
}

.step-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}
</style>
