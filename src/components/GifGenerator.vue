<template>
  <div class="gif-generator">
    <button @click="startRecording" :disabled="isRecording" class="generate-btn">
      {{ isRecording ? 'Recording...' : 'Generate Animation' }}
    </button>
    <div v-if="recordingUrl" class="animation-preview">
      <video :src="recordingUrl" controls loop autoplay muted></video>
      <a :href="recordingUrl" download="ddpm-animation.webm" class="download-btn">
        Download Animation
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDDPM } from '../composables/useDDPM'

const recordingUrl = ref('')
const isRecording = ref(false)
const frameDelay = 500 // 500ms between frames

const {
  NUM_STEPS,
  getNoisyImage,
} = useDDPM()

const startRecording = async () => {
  isRecording.value = true
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 256
  canvas.height = 300 // Extra height for text

  // Set up MediaRecorder
  const stream = canvas.captureStream(30) // 30 FPS
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000,
  })

  const chunks: Blob[] = []
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    recordingUrl.value = URL.createObjectURL(blob)
    isRecording.value = false
  }

  mediaRecorder.start()

  // Generate and draw frames
  let currentFrame = 0
  const animate = async () => {
    if (currentFrame >= NUM_STEPS) {
      mediaRecorder.stop()
      return
    }

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the noisy image
    const noisyImage = getNoisyImage(currentFrame)
    if (noisyImage) {
      ctx.putImageData(noisyImage, 0, 0)
    }

    // Add percentage text
    const percentage = Math.round((currentFrame / (NUM_STEPS - 1)) * 100)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    const text = `${percentage}% noise`
    const textY = 280

    // Draw text background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

    // Draw text
    ctx.fillStyle = 'white'
    ctx.fillText(text, canvas.width / 2, textY)

    currentFrame++
    await new Promise(resolve => setTimeout(resolve, frameDelay))
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
</script>

<style scoped>
.gif-generator {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.generate-btn {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.generate-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.animation-preview {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.animation-preview video {
  width: 100%;
  height: auto;
  display: block;
}

.download-btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #2196F3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.download-btn:hover {
  background-color: #1976D2;
}
</style>
