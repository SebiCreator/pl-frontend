<script setup>
import { ref } from "vue";
import { useUserDataStore } from "@/store/userDataStore.js";
import { useCorrectorSubGoalSplitter } from "../utils/chains.js";
const dataStore = useUserDataStore();
const props  = defineProps(["subgoals", "goal"]);
const emits = defineEmits(["done"]);

const goal = ref(props.goal);
const subgoals = ref(props.subgoals);

const changes = ref("");

const done = () => {
  emits("done", subgoals.value);
};

console.log({ goal, subgoals})

const changeSubgoals = async () => {
  const result = await useCorrectorSubGoalSplitter({
    goal: goal.value,
    subgoals: JSON.stringify(subgoals.value),
    changes: changes.value,
  });
  subgoals.value = result.subgoals;
  goal.value = result.goal;
  console.log({ goal, subgoals })
  console.log(result);
  changes.value = "";
};

</script>
<template>
  <div class="max-w-md mx-auto mt-10 space-y-4">
    <h1>Ziel: {{ goal }}</h1>
    <ul class="steps steps-vertical">
      <li v-for="e in subgoals" :key="e.name" class="step">{{ e.name }}</li>
    </ul>
    <div class="flex flex-col justify-between ">
      <button class="btn mb-3" @click="done">Gut so</button>
      <button class="btn mb-3" @click="changeSubgoals">Ändern</button>
      <textarea class="textarea"  placeholder="Änderungen.." v-model="changes" />
    </div>
  </div>
</template>