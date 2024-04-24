<script setup>
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
</script>


<template>
  <div>
    <input type="text" v-model="text" />
    <button @click="addToIndex()">Add</button>
    <button @click="search()">Suchen</button>
    {{ output }}
  </div>
</template>