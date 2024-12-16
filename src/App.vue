<template>
  <div class="container">
    <h1>DDPM Visualization</h1>
    <DiffusionDemo />
  </div>
</template>

<script setup lang="ts">
import DiffusionDemo from './components/DiffusionDemo.vue'
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}
</style>
