<template>
  <div class="ddpm-explanation">
    <h2>Denoising Diffusion Probabilistic Models (DDPM)</h2>

    <section class="explanation-section">
      <h3>Overview</h3>
      <p>
        DDPM is a type of generative model that gradually adds noise to data and then learns to reverse this process.
        The process consists of two main parts: forward diffusion and reverse denoising.
      </p>
    </section>

    <section class="explanation-section">
      <h3>Forward Process (q)</h3>
      <p>
        The forward process gradually adds Gaussian noise to an image x₀, creating a sequence:
        x₀ → x₁ → x₂ → ... → x_T
      </p>
      <div class="math-block">
        q(x_t|x_{t-1}) = 𝒩(x_t; √(1-βt)x_{t-1}, βtI)
      </div>
      <p>
        where βt is the noise schedule that increases from β₁ to βT.
        We use a cosine schedule for β:
      </p>
      <div class="math-block">
        βt = 1 - cos((t/T + s)/(1 + s)×π/2)²/cos(s/(1 + s)×π/2)²
      </div>
    </section>

    <section class="explanation-section">
      <h3>Reverse Process (p)</h3>
      <p>
        The reverse process learns to gradually denoise the image:
        x_T → x_{T-1} → ... → x₁ → x₀
      </p>
      <div class="math-block">
        p(x_{t-1}|x_t) = 𝒩(x_{t-1}; μ_θ(x_t,t), σ_t²I)
      </div>
      <p>
        where μ_θ is learned by a neural network to predict the mean of the Gaussian distribution.
      </p>
    </section>

    <section class="explanation-section">
      <h3>Noise Schedule Visualization</h3>
      <p>
        The slider above demonstrates how noise is gradually added to the image according to our cosine schedule.
        As you move the slider:
      </p>
      <ul>
        <li>The image shows increasing noise levels</li>
        <li>The noise diagram shows our position in the schedule</li>
        <li>The formulas highlight the current step in the process</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.ddpm-explanation {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
}

.explanation-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

h2 {
  color: #2196F3;
  margin-bottom: 1.5rem;
}

h3 {
  color: #333;
  margin-bottom: 1rem;
}

.math-block {
  font-family: 'Times New Roman', serif;
  background: #fff;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #2196F3;
  font-size: 1.1rem;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

li::before {
  content: "•";
  color: #2196F3;
  position: absolute;
  left: 0;
}
</style>
