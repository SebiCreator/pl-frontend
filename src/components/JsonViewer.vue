<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  fields: Array,
  data: Object,
});

console.log({ props })
const isEmpty = computed(() => props.data === undefined || Object.keys(props.data).length === 0)
</script>

<template>
<div>
  <div class="overflow-x-auto" v-if="!isEmpty">
  <table class="table">
    <!-- head -->
    <thead>
      <tr>
        <th></th>
        <th>Frage</th>
        <th>Antwort</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="field in fields" :key="field" >
      <td></td>
        <td v-if="data[field] && data[field] != -1">{{ field }}</td>
        <td v-if="data[field] && data[field] != -1">{{ data[field] }}</td>
      </tr>
    </tbody>
  </table>
</div>
</div>
</template>