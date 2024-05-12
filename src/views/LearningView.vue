<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { helloUserChain } from "@/utils/chains.js";
import { Agent } from "@/utils/agents.js";
import axios from "axios";
import { defineProps } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

const subgoal = ref(route.params.topic);


const chatConversation = ref([]);

const questionLoading = ref(false);

const isHumanMessage = (msg) => {
  return msg instanceof HumanMessage;
};
const isAIMessage = (msg) => {
  return msg instanceof AIMessage;
};

const messages = computed(() => {
  return chatConversation.value.map((msg) => {
    if (isHumanMessage(msg)) {
      return {
        text: msg.text,
        loc: "start",
      };
    } else {
      return {
        text: msg.text,
        loc: "end",
      };
    }
  });
});
const actions = ref([]);
const codeView = ref("");
const prompt = ref("");

const sendMessage = () => {
  console.log("sending message");
};

const submitAction = (msg) => { 
  console.log("submitting action", msg);
};

const helloUser = async () => {
  questionLoading.value = true;
  const result = await helloUserChain.invoke({
    topic: "classes in java",
    language: "de",
    name: "Max",
  });
  questionLoading.value = false;
  console.log(result);
  chatConversation.value.push(new AIMessage(result));
  actions.value = ["mit dem lernen beginnen"];
};

const loadConversation = async () => {
  try {
    throw new Error("Not implemented");
    const result = axios.get("");
    chatConversation.value = result;
  } catch (e) {
    await helloUser();
  }
};

onBeforeMount(async () => {
  await loadConversation();
});
</script>
<template>
  <div class="flex justify-center h-screen">
  {{ subgoal || "No subgoal" }}
    <div
      class="w-1/2 border flex items-center justify-center overflow-hidden rounded-lg"
    >
      <div class="border h-3/4 w-3/4">
        {{ codeView }}
      </div>
    </div>

    <div
      class="w-1/2 flex flex-col justify-between items-center border rounded-lg"
    >
      <div class="border w-3/4 h-1/2 overflow-scroll mt-10">
        <div
          v-for="msg in messages"
          :key="msg"
          :class="{
            chat: true,
            'chat-start ': msg.loc === 'start',
            'chat-end': msg.loc !== 'start',
          }"
        >
          <div
            :class="{
              'chat-bubble text-black': true,
              'bg-blue-400': msg.loc === 'start',
              'bg-green-400': msg.loc !== 'start',
            }"
          >
            {{ msg.text }}
          </div>
        </div>
        <div v-if="questionLoading" class="chat chat-end">
          <div class="chat-bubble text-black bg-blue-400">......</div>
        </div>
      </div>
      <div class="flex flex-row w-3/4 justify-around items-center">
        <button
          v-for="a in actions"
          :key="a"
          class="btn"
          @click="submitAction(a)"
        >
          {{ a }}
        </button>
      </div>
      <input
        type="text"
        v-model="prompt"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
      />
      <button class="btn" @click="sendMessage">Send</button>
    </div>
  </div>
</template>
