import { ref } from 'vue'

// Constants for the diffusion process
const NUM_STEPS = 50 // Increased for smoother progression

export function useDDPM() {
  // State management
  const currentStep = ref(0)
  const imageData = ref<ImageData | null>(null)

  // Calculate beta schedule using cosine function from reference implementation
  const getBeta = (t: number) => {
    const T = NUM_STEPS - 1
    const s = 0.008 // Same as reference implementation
    const t_normalized = t / T
    const alphas_cumprod = Math.cos(((t_normalized + s) / (1 + s) * Math.PI * 0.5)) ** 2
    const alpha_t = alphas_cumprod / Math.cos((s / (1 + s) * Math.PI * 0.5)) ** 2
    const alpha_t_prev = t === 0 ? 1.0 : (
      Math.cos((((t - 1) / T + s) / (1 + s) * Math.PI * 0.5)) ** 2 /
      Math.cos((s / (1 + s) * Math.PI * 0.5)) ** 2
    )
    return Math.min(Math.max(1 - alpha_t / alpha_t_prev, 0.0001), 0.9999)
  }

  // Calculate alpha values
  const getAlpha = (t: number) => 1 - getBeta(t)

  // Calculate cumulative alpha
  const getAlphaCumprod = (t: number) => {
    let alpha_t = 1.0
    for (let s = 0; s <= t; s++) {
      alpha_t *= getAlpha(s)
    }
    return alpha_t
  }

  // Load and process image
  const loadImage = async (src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 256
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const scale = Math.min(size / img.width, size / img.height)
          const x = (size - img.width * scale) / 2
          const y = (size - img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
          imageData.value = ctx.getImageData(0, 0, size, size)
        }
        resolve()
      }
      img.src = src
    })
  }

  // Apply noise to image data for a specific step
  const getNoisyImage = (step: number): ImageData | null => {
    if (!imageData.value) return null

    const canvas = document.createElement('canvas')
    canvas.width = imageData.value.width
    canvas.height = imageData.value.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.value.data),
      imageData.value.width,
      imageData.value.height
    )

    // For the final step, generate completely random noise
    if (step === NUM_STEPS - 1) {
      for (let i = 0; i < newImageData.data.length; i += 4) {
        // Generate completely random values for true noise
        newImageData.data[i] = Math.floor(Math.random() * 256)     // Red
        newImageData.data[i + 1] = Math.floor(Math.random() * 256) // Green
        newImageData.data[i + 2] = Math.floor(Math.random() * 256) // Blue
        newImageData.data[i + 3] = 255                             // Alpha
      }
      return newImageData
    }

    const alpha_t = getAlphaCumprod(step)
    const sigma_t = Math.sqrt(1 - alpha_t)

    // Progressive noise for intermediate steps using Box-Muller transform
    for (let i = 0; i < newImageData.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        // Box-Muller transform for Gaussian noise
        const u1 = Math.random()
        const u2 = Math.random()
        const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

        // Apply noise according to reference implementation formula
        const pixel = newImageData.data[i + c]
        const scaled_pixel = (pixel / 127.5) - 1.0 // Scale to [-1, 1]
        const noisy_value = scaled_pixel * Math.sqrt(alpha_t) + noise * sigma_t
        newImageData.data[i + c] = Math.min(255, Math.max(0,
          (noisy_value + 1.0) * 127.5 // Scale back to [0, 255]
        ))
      }
      newImageData.data[i + 3] = 255 // Keep alpha channel unchanged
    }

    return newImageData
  }

  // Calculate current noise value scaled by step progress
  const getCurrentNoise = (step: number) => {
    const alpha_t = getAlphaCumprod(step)
    return 1 - alpha_t
  }

  return {
    currentStep,
    imageData,
    loadImage,
    getBeta,
    getAlphaCumprod,
    getNoisyImage,
    getCurrentNoise,
    NUM_STEPS
  }
}
