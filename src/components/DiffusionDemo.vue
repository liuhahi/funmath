<template>
  <div class="container">
    <h1>Denoising Diffusion Probabilistic Models</h1>

    <div class="controls">
      <input
        type="range"
        :min="0"
        :max="NUM_STEPS - 1"
        v-model="selectedStep"
        class="slider"
      />
      <span class="step-label">Step {{ selectedStep }} ({{ Math.round(selectedStep / (NUM_STEPS - 1) * 100) }}% noise)</span>
    </div>

    <div class="grid">
      <div
        v-for="step in NUM_STEPS"
        :key="step-1"
        class="step-container"
        :class="{ 'selected': selectedStep === step-1 }"
      >
        <div class="step-header">
          <span>Step {{ step-1 }}</span>
          <span class="beta">β = {{ getBeta(step-1).toFixed(4) }}</span>
        </div>
        <canvas
          :ref="'canvas' + (step-1)"
          width="256"
          height="256"
          class="noise-canvas"
        ></canvas>
        <div class="noise-level">
          {{ Math.round((step-1) / (NUM_STEPS - 1) * 100) }}% noise
        </div>
      </div>
    </div>

    <GifGenerator />

    <MathFormula
      :step="selectedStep"
      :beta="getBeta(selectedStep)"
      :noise="getCurrentNoise(selectedStep)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MathFormula from './MathFormula.vue'
import GifGenerator from './GifGenerator.vue'
import { useDDPM } from '../composables/useDDPM'

// Constants for visualization
const imageSize = 256
const canvasRefs = ref<HTMLCanvasElement[]>([])

// Use DDPM state management
const {
  currentStep,
  loadImage,
  getBeta,
  getNoisyImage,
  getCurrentNoise,
  NUM_STEPS
} = useDDPM()

// Create array of all steps
const allSteps = Array.from({ length: NUM_STEPS }, (_, i) => i)

// Handle step selection
const selectedStep = ref(0)
const handleStepSelect = (step: number) => {
  selectedStep.value = step
  currentStep.value = step
  updateCanvases() // Regenerate noise when step changes
}

// Initialize visualization
onMounted(async () => {
  // Create a simple test image using Canvas API
  const canvas = document.createElement('canvas')
  canvas.width = imageSize
  canvas.height = imageSize
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Draw a red circle on white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, imageSize, imageSize)
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(imageSize/2, imageSize/2, imageSize/3, 0, Math.PI * 2)
    ctx.fill()
    // Convert canvas to ImageData
    const imageData = ctx.getImageData(0, 0, imageSize, imageSize)
    await loadImage(imageData)
  }
  // Update all canvases with their respective noise levels
  updateCanvases()
})

// Update all canvas elements with noisy images
const updateCanvases = () => {
  canvasRefs.value.forEach((canvas, step) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const noisyImageData = getNoisyImage(step)
    if (noisyImageData) {
      canvas.width = noisyImageData.width
      canvas.height = noisyImageData.height
      ctx.putImageData(noisyImageData, 0, 0)
    }
  })
}
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin: 2rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 20px;
  -webkit-appearance: none;
  background: #d3d3d3;
  outline: none;
  border-radius: 10px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
  border-radius: 50%;
}

.step-label {
  min-width: 150px;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.step-container {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.step-container.selected {
  border-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.step-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.beta {
  color: #666;
}

.noise-canvas {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.noise-level {
  text-align: center;
  margin-top: 0.5rem;
  color: #666;
}
</style>
