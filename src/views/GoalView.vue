<script setup>
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { useUserDataStore } from "../store/userDataStore.js";

const route = useRoute();
const router = useRouter();
const store = useUserDataStore();
const goalName = route.params.topic;

const fullGoal = store.userGoals.find((goal) => goal.topic === goalName);
const goalTopic = fullGoal.topic;
const subGoals = fullGoal.subgoals;
const learn = (subgoalTopic) => {
  console.log("----");
  console.log({ s: subgoalTopic, g: goalTopic });
  router.push({ name: "Learning", params: { subgoalTopic, goalTopic } });
};

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
};

</script>


<template>
  <div>
    <div class="flex flex-col items-center mb-6">
      <h1 class="text-2xl bold underline my-4">{{ toTitleCase(goalName) }}</h1>
      <p>{{ fullGoal.description }}</p>
    </div>
    <div class="flex flex-row">
      <div class="w-1/2 m-2 overflow-hidden rounded-lg ml-6">
        <div class="flex flex-row">
          <ul
            class="steps steps-vertical cursor-pointer border border-black border-solid p-4 rounded-lg"
          >
            <li
              v-for="s in subGoals"
              :key="s"
              :class="{
                step: true,
                'hover:bg-primary-content': true,
                'hover:underline': true,
                'rounded-2xl': true,
                'step-primary': s.chatSessionId,
              }"
              @click="learn(s.topic)"
            >
              <span>{{ s.topic }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="w-1/2 overflow-hidden rounded-lg">
        <div class="w-full h-full flex flex-col items-center">
          <div class="flex">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
