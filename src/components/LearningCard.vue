
<script setup>
import { defineProps, toRefs } from 'vue';
const props = defineProps([
    'title',
    'content',
    'subgoals',
]);

const { title, content, subgoals } = toRefs(props);

const maxTasks = subgoals.value.length;
const currentTasksDone = subgoals.value.filter((subgoal) => subgoal.count === subgoal.max).length;

const deleteGoal = () => alert('delete goal');


</script>

<template>
<div class="card w-96 bg-base-100 shadow-xl">
  <div class="card-body">
  <div class="flex flex-row justify-between">
    <h2 class="card-title">{{ title }}</h2>
    <button @click.prevent="deleteGoal" class="rounded-btn w-[15px] h-[15px] bg-red-700"></button>
  </div>
    <progress class="progress progress-info w-56" :value="currentTasksDone" :max="maxTasks"></progress>
    <p class="whitespace-normal">{{ content }}</p>
    <div class="card-actions justify-end mt-5">
      <button class="btn btn-primary">Weiter Lernen</button>
    </div>
  </div>
</div>
</template>