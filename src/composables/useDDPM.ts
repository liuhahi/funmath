import { ref, computed } from 'vue'

// Constants
const NUM_STEPS = 10
const MIN_NOISE = 0.01
const MAX_NOISE = 0.5

export function useDDPM() {
  // State
  const currentStep = ref(0)

  // Implement cosine beta schedule as per reference
  const getBeta = (t: number) => {
    const s = 0.008
    const steps = NUM_STEPS + 1
    const x = t / NUM_STEPS
    const alphas_cumprod = Math.cos(((x) + s) / (1 + s) * Math.PI * 0.5) ** 2
    const alpha_start = Math.cos((s / (1 + s)) * Math.PI * 0.5) ** 2
    return 1 - (alphas_cumprod / alpha_start)
  }

  // Compute current noise level
  const noiseLevel = computed(() => {
    const beta = getBeta(currentStep.value)
    return MIN_NOISE + beta * (MAX_NOISE - MIN_NOISE)
  })

  // Generate noise parameters for SVG filter
  const noiseParams = computed(() => ({
    baseFrequency: noiseLevel.value,
    numOctaves: 4,
    seed: currentStep.value * 10,
    scale: 1 - getBeta(currentStep.value)
  }))

  // Compute noise schedule path
  const getNoiseSchedulePath = (width: number, height: number) => {
    const points = Array.from({ length: 100 }, (_, i) => {
      const t = i / 99
      const x = t * width
      const y = height * (1 - getBeta(t * NUM_STEPS))
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  // Get step coordinates for visualization
  const getStepCoordinates = (step: number, width: number, height: number) => ({
    x: (step / NUM_STEPS) * width,
    y: height * (1 - getBeta(step))
  })

  // Update current step
  const setStep = (step: number) => {
    currentStep.value = Math.max(0, Math.min(step, NUM_STEPS - 1))
  }

  return {
    currentStep,
    noiseLevel,
    noiseParams,
    getBeta,
    getNoiseSchedulePath,
    getStepCoordinates,
    setStep,
    NUM_STEPS,
    MIN_NOISE,
    MAX_NOISE
  }
}
