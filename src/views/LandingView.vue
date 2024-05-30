<script setup>
/*
import { ref } from "vue";
import BackendConnectionBadge from "@/components/BackendConnectionBadge.vue";
import LearningCard from "@/components/LearningCard.vue";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { similarity } from "ml-distance";
import { computed } from "vue";
import  DocStore  from "@/utils/VDBService.js";

const text = ref("");
const output = ref("");

let sto = null;

DocStore.create("user123")
.then(res => {
  sto = res;
})
const addToIndex = () => sto.addDocument(text.value);
const search = () => sto.queryDocuments({query: text.value});
*/

import { ref } from "vue";
import { useUserDataStore } from "@/store/userDataStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();

const goToWelcomeQuestions = () => {
  router.push("/w-questions");
};

const userDataStore = useUserDataStore();

const { userPreferences, userGoals, userPersonalData } =
  storeToRefs(userDataStore);
</script>


<template>
  <div>
    <div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Hello there</h1>
      <p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
      <button class="btn btn-primary" @click="goToWelcomeQuestions">Willkommensfragen beantworten</button>
    </div>
  </div>
</div>
    <!--
    <input type="text" v-model="text" />
    <button @click="addToIndex()">Add</button>
    <button @click="search()">Suchen</button>
    {{ output }}
    -->
  </div>
</template>