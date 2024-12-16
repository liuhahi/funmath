import { ref } from 'vue'

// Constants for the diffusion process
const NUM_STEPS = 10
const MAX_BETA = 0.02

export function useDDPM() {
  // State management
  const currentStep = ref(0)
  const imageData = ref<ImageData | null>(null)

  // Calculate beta schedule using cosine function from reference
  const getBeta = (t: number) => {
    // Following the reference implementation's schedule
    const T = NUM_STEPS
    const t_normalized = t / T
    return MAX_BETA * (1 - Math.cos((t_normalized * Math.PI) / 2))
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
        const size = 256 // Fixed size for consistent visualization
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Draw image maintaining aspect ratio
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

    const alpha_t = getAlphaCumprod(step)
    const sigma_t = Math.sqrt(1 - alpha_t)

    // Apply noise following the reference implementation's formula
    for (let i = 0; i < newImageData.data.length; i += 4) {
      // Generate Gaussian noise using Box-Muller transform
      const u1 = Math.random()
      const u2 = Math.random()
      const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

      // Apply noise to each color channel
      for (let c = 0; c < 3; c++) {
        const pixel = newImageData.data[i + c]
        // q(x_t | x_t-1) = sqrt(alpha_t) * x_t-1 + sqrt(1 - alpha_t) * ε
        newImageData.data[i + c] = Math.min(255, Math.max(0,
          pixel * Math.sqrt(alpha_t) + 255 * noise * sigma_t
        ))
      }
    }

    return newImageData
  }

  return {
    currentStep,
    imageData,
    loadImage,
    getBeta,
    getAlphaCumprod,
    getNoisyImage,
    NUM_STEPS
  }
}
