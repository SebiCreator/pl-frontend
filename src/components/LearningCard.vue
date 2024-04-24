
<script setup>
import { defineProps, toRefs } from 'vue';
const props = defineProps([
    'title',
    'content',
]);

const { title, content } = toRefs(props);
</script>

<template>
<div class="card w-96 bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">{{ title }}</h2>
    <p class="whitespace-normal">{{ content }}</p>
    <div class="card-actions justify-end mt-5">
      <button class="btn btn-primary">Weiter Lernen</button>
    </div>
  </div>
</div>
</template>