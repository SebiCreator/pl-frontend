
<script setup>
import { defineProps, toRefs,computed } from 'vue';
const props = defineProps([
    'title',
    'content',
    'subgoals',
]);

const { title, content, subgoals } = toRefs(props);

const maxTasks = subgoals.value.length;
const currentTasksDone = computed(() => subgoals.value.filter((subgoal) => subgoal.chatSessionId).length)
console.log(subgoals.value)



</script>

<template>
<div class="card w-96 bg-base-100 shadow-xl">
  <div class="card-body">
  <div class="flex flex-row justify-between">
    <h2 class="card-title">{{ title }}</h2>
  </div>
    <progress class="progress progress-info w-56" :value="currentTasksDone" :max="maxTasks"></progress>
    <p class="whitespace-normal">{{ content }}</p>
    <div class="card-actions justify-end mt-5">
      <button class="btn btn-primary">Weiter Lernen</button>
    </div>
  </div>
</div>
</template>