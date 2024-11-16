<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Image Radon Transform</h1>
    
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <!-- Image Upload -->
      <div class="mb-6">
        <label class="block mb-2">
          <span class="text-gray-700">Upload Image:</span>
          <input 
            type="file" 
            @change="handleImageUpload" 
            accept="image/*"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- Original Image -->
        <div class="border border-gray-200 rounded-lg p-2">
          <h2 class="text-lg font-semibold mb-2">Original Image</h2>
          <canvas ref="originalCanvas" class="w-full aspect-square"></canvas>
        </div>

        <!-- Processed Image -->
        <div class="border border-gray-200 rounded-lg p-2">
          <h2 class="text-lg font-semibold mb-2">Edge Detection</h2>
          <canvas ref="processedCanvas" class="w-full aspect-square"></canvas>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-6 space-y-4">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="showEdges">
            <span>Show Edges</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="showRadon">
            <span>Show Radon Transform</span>
          </label>
        </div>
        <div class="flex items-center gap-4">
          <label>Angle:</label>
          <input
            type="range"
            min="0"
            max="360"
            v-model="angle"
            class="w-48"
          />
          <span>{{ angle }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const angle = ref(0)
const shapePath = ref('M100,100 L300,100 L300,300 L100,300 Z')
const isDragging = ref(false)
const lineStart = ref({ x: 200, y: 0 })
const lineEnd = ref({ x: 200, y: 400 })
const showEdges = ref(false)
const showRadon = ref(false)

// Update line position based on angle
watch(angle, (newAngle) => {
  const rad = (newAngle * Math.PI) / 180
  const centerX = 200
  const centerY = 200
  const radius = 200

  lineStart.value = {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad)
  }
  lineEnd.value = {
    x: centerX - radius * Math.cos(rad),
    y: centerY - radius * Math.sin(rad)
  }
})

function handleMouseMove(event) {
  if (isDragging.value) {
    const rect = event.target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    shapePath.value = `M${lineStart.value.x},${lineStart.value.y} L${x},${y} L${lineEnd.value.x},${lineEnd.value.y} Z`
  }
}

function handleMouseDown(event) {
  isDragging.value = true
}

function handleMouseUp(event) {
  isDragging.value = false
}

function resetCanvas() {
  angle.value = 0
  shapePath.value = 'M100,100 L300,100 L300,300 L100,300 Z'
}
</script>

<style scoped>
</style>