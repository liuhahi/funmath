<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MathFormula from './MathFormula.vue'
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
  // Load the initial dog image
  await loadImage('/sample-dog.jpg')
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
        <canvas
          :ref="el => { if (el) canvasRefs[step] = el }"
          class="noise-image"
        />

        <!-- Step Progress Indicator -->
        <div class="step-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${(step / (NUM_STEPS - 1)) * 100}%` }"
            />
          </div>
          <span class="progress-label">
            {{ Math.round((step / (NUM_STEPS - 1)) * 100) }}% noise
          </span>
        </div>
      </div>
    </div>

    <div class="formula-container">
      <MathFormula
        :step="selectedStep"
        :beta="getBeta(selectedStep)"
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

.step-progress {
  margin-top: 1rem;
  padding: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s ease;
}

.progress-label {
  display: block;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
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
