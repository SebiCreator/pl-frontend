
<script setup>
import { ref } from "vue";
import { useSubGoalSplitter } from "../utils/chains.js";
import { useUserDataStore } from "@/store/userDataStore.js";
import { storeToRefs } from "pinia";

const userDataStore = useUserDataStore();

const { userPreferences, userGoals, userPersonalData } =
  storeToRefs(userDataStore);

const language = ref(userPersonalData.language || "de");

const topic = ref("");
const focus = ref("");
const showInput = ref(true);
const steps = ref([]);

async function submitForm() {
  const result = await useSubGoalSplitter({
    goal: topic.value,
    description: focus.value,
    language: language.value,
  });
  const { subgoals } = result;
  steps.value = subgoals;
  showInput.value = false;
}

async function saveGoal() {
  const goal = {
    email: userPersonalData.email,
    topic: topic.value,
    focus: focus.value,
    dont: false,
    subgoals: steps.value,
  };
  userGoals.value.push(goal);
  await userDataStore.setGoal(goal);
}
</script>

<template>
  <div>
    <div v-if="showInput" class="max-w-md mx-auto mt-10 space-y-4">
      <div>
        <label for="input" class="block text-sm font-medium text-gray-700"
          >Thema</label
        >
        <input
          id="input"
          v-model="topic"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="focus" class="block text-sm font-medium text-gray-700"
          >Beschreibe so genau wie möglich was du genau lernen willst</label
        >
        <textarea
          class="w-full textarea textarea-bordered"
          v-model="focus"
        ></textarea>
      </div>
      <button
        @click="submitForm"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </div>
    <div v-else class="max-w-md mx-auto mt-10 space-y-4">
      <ul class="steps steps-vertical">
        <li v-for="e in steps" :key="e.name" class="step">{{ e.name }}</li>
      </ul>
      <div class="flex flex-row justify-between items-center">
        <button class="btn">Gut so</button>
        <button class="btn">Ich will noch etwas ändern</button>
      </div>
    </div>
  </div>
</template>