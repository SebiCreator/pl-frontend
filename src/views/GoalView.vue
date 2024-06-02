<script setup>
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useUserDataStore } from "../store/userDataStore.js";

const route = useRoute();
const router = useRouter();
const store = useUserDataStore();
const goalName = route.params.topic;

const fullGoal = store.userGoals.find((goal) => goal.topic === goalName);
const goalTopic = fullGoal.topic;
const subGoals = fullGoal.subgoals;
const learn = (subgoalTopic) => {
  console.log("----")
  console.log({ s:subgoalTopic, g: goalTopic })
  router.push({ name: "Learning", params: { subgoalTopic, goalTopic } });
};
console.log(fullGoal);
</script>


<template>
  <div class="flex flex-row">
    <div class="w-1/2 m-2 overflow-hidden rounded-lg">
      {{ goalName }}
      <div>
        <ul class="steps steps-vertical">
          <li
            v-for="s in subGoals"
            :key="s"
            :class="{ step: true, 'step-primary': s.done }"
            @click="learn(s.topic)"
          >
            <span>{{ s.topic }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="w-1/2 overflow-hidden rounded-lg"></div>
  </div>
</template>
