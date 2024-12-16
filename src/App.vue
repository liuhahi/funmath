<template>
  <div class="container">
    <h1>Denoising Diffusion Probabilistic Models</h1>
    <div class="content">
      <DDPMExplanation class="explanation" />
      <DiffusionDemo class="visualization" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DiffusionDemo from './components/DiffusionDemo.vue'
import DDPMExplanation from './components/DDPMExplanation.vue'
</script>

<style>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2196F3;
  margin-bottom: 40px;
  font-size: 2rem;
}

.content {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(600px, 2fr);
  gap: 2rem;
  align-items: start;
}

.explanation {
  position: sticky;
  top: 20px;
}

.visualization {
  width: 100%;
}

@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr;
  }

  .explanation {
    position: static;
  }
}
</style>
