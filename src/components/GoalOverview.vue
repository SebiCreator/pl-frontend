<script setup>
import { ref } from "vue";
const { subgoals, goal } = defineProps(["subgoals", "goal"]);

const done = () => {};
const change = () => {};

console.log(subgoals);
console.log(goal);
</script>
<template>
  <div class="max-w-md mx-auto mt-10 space-y-4">
    <h1>Ziel: {{ goal }}</h1>
    <ul class="steps steps-vertical">
      <li v-for="e in subgoals" :key="e.name" class="step">{{ e.name }}</li>
    </ul>
    <div class="flex flex-row justify-between items-center">
      <button class="btn" @click="done">Gut so</button>
      <button class="btn" @click="change">Ich will noch etwas ändern</button>
    </div>
  </div>
</template>