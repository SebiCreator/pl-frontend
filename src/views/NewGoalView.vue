
<script setup>
import { ref } from "vue";
import { useSubGoalSplitter, useGoalSummaryChain } from "../utils/chains.js";
import { useUserDataStore } from "@/store/userDataStore.js";
import { storeToRefs } from "pinia";
import GoalOverview from "../components/GoalOverview.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const userDataStore = useUserDataStore();

const { userPreferences, userGoals, userPersonalData } =
  storeToRefs(userDataStore);

const language = ref(userPersonalData.language || "de");

const isLoading = ref(false);

const topic = ref("");
const focus = ref("");
const showInput = ref(true);
const steps = ref([]);

async function submitForm() {
  isLoading.value = true;
  const result = await useSubGoalSplitter({
    goal: topic.value,
    description: focus.value,
    language: language.value,
  });
  const { subgoals, goal } = result;
  topic.value = goal;
  steps.value = subgoals;
  showInput.value = false;
  isLoading.value = false;
}

const goal = ref(null);

async function saveGoal(subgoals) {
  console.log("Save Goal");
  console.log(subgoals);
  console.log(userPersonalData);
  const goalDescription = await useGoalSummaryChain({
    goal: topic.value,
    subgoals: subgoals.map((s) => s.name),
    focus: focus.value,
  });
  console.log({ goalDescription });
  const _subgoals = subgoals.map((s) => ({
    topic: s.name,
    description: s.description,
    count: 0, // TODO
    maxCount: 10, // TODO
    difficulty: "easy", // TODO
  }));
  console.log({ _subgoals });
  const _goal = {
    topic: topic.value,
    description: goalDescription, // TODO!
    focus: focus.value || "",
    email: userPersonalData.value.email,
    subgoals: _subgoals,
  };
  console.log({ _goal });
  userDataStore.setGoal(_goal);
  router.push("/overview");
}
</script>

<template>
  <div>
    <div v-if="!isLoading">
      <div
        v-if="showInput"
        class="max-w-md mx-auto mt-10 space-y-4 border-gray-400"
      >
        <div>
          <label for="input" class="block text-sm font-medium text-gray-700"
            >Thema</label
          >
          <input
            id="input"
            v-model="topic"
            type="text"
            placeholder="Gib dein Thema ein das du Lernen möchtest ...."
            class="input border-2 border-gray-300 w-full"
          />
        </div>
        <div>
          <label for="focus" class="block text-sm font-medium text-gray-700"
            >Beschreibe so genau wie möglich was du genau lernen willst</label
          >
          <textarea
            class="w-full textarea textarea-bordered"
            placeholder="Beschreibe so genau wie möglich was du genau lernen willst am besten mit Programmiersprache ..."
            v-model="focus"
          ></textarea>
        </div>
        <button @click="submitForm" class="btn">Bestätigen</button>
      </div>
      <GoalOverview v-else :subgoals="steps" :goal="goal" @done="saveGoal" />
    </div>
    <div v-else class="flex flex-col items-center justify-center">
      <span class="loading loading-infinity loading-lg"></span>
      <h1 class="text-2xl">Loading</h1>
    </div>
  </div>
</template>