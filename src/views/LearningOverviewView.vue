<script setup>
import LearningCard from "@/components/LearningCard.vue";
import { ref } from "vue";
import { useUserDataStore } from "@/store/userDataStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();
const userDataStore = useUserDataStore();
const { userGoals } = storeToRefs(userDataStore);

const toNewGoal = () => router.push("/newGoal");

const toGoal = (topic) => {
  router.push({ name: "Goal", params: { topic } });
};
const toNewPdfGoal = () => router.push("/newPdfGoal");
const toCodeReview = () => router.push("/codeReview");
</script>


<template>
  <div>
    <button class="btn mb-5 ml-5" @click="toNewGoal">Neues Lernziel</button>
    <button class="btn mb-5 ml-5" @click="toNewPdfGoal">Lernziel aus Pdf</button>
    <button class="btn mb-5 ml-5" @click="toCodeReview">Code Review</button>
    <div v-if="userGoals" class="flex flex-wrap justify-left">
      <div v-for="goal in userGoals" :key="goal.title" class="m-4">
        <LearningCard
          :title="goal.topic"
          :content="goal.description"
          @click="toGoal(goal.topic)"
        />
      </div>
    </div>
  </div>
</template>
