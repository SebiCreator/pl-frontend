<script setup>
import { computed, ref, watch } from "vue";
import { createOpenAI, JsonAsker } from "../utils/LLMService.js";
import {
  summarizerPrompt,
  correctorPrompt,
  personalInfoOutputParser,
} from "../utils/prompts.js";
import ChatInterface from "../components/ChatInterface.vue";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getEmptyKeys } from "../utils/special.js";
import JsonViewer from "../components/JsonViewer.vue";
import UserDataInputs from "../components/UserDataInputs.vue";

const steps = ref([
  {
    title: "Personal",
    status: "todo",
    question: "Erzähle mir von dir als Person",
    reqInfos: ["name", "age", "occupation", "motivation"],
  },
  {
    title: "Ziele",
    status: "todo",
    question: "Was willst du können?",
    reqInfos: ["goals"],
  },
  {
    title: "Weg",
    status: "todo",
    question: "Wie willst du es lernen?",
    reqInfos: [],
  },
  {
    title: "Lerntechniken",
    status: "todo",
    question: "Welche Lerntechniken magst du?",
    reqInfos: [],
  },
]);

const jsonAsker1 = new JsonAsker(
  "Erzähle etwas über dich als Person",
  personalInfoOutputParser,
  { user: "end", ai: "start" }
);

const chatConversation = ref(jsonAsker1.getConversationHistory());
const data = ref({});
const userInput = ref("");

const submit = async () => {
  const newMessage = userInput.value;
  if (newMessage) {
    jsonAsker1.addUserMsgToConversation(newMessage);
    chatConversation.value = jsonAsker1.getConversationHistory();
    await jsonAsker1.nextQuestion(newMessage, { pushBefore: true });
    console.log("data is now", jsonAsker1.getJson());
    data.value = jsonAsker1.getJson();
    userInput.value = "";
    chatConversation.value = jsonAsker1.getConversationHistory();
  }
};

const useLLM = ref(false);

const updateUseLLM = (value) => {
  useLLM.value = value;
};

const jsonFields = [
  "email",
  "name",
  "age",
  "occupation",
  "motivation",
  "sex",
  "motivationForUsingTheApp",
  "langugage",
];
</script>

<template>
  <div>
    <!--
   <label for="useLLM" class="font-medium">Use LLM:</label>
    <input type="radio" id="useLLM" name="radio-1" class="radio" v-model="useLLM" :value="true" />
    <label for="useLLM">Yes</label>
    <input type="radio" id="notUseLLM" name="radio-1" class="radio" v-model="useLLM" :value="false" />
    <label for="notUseLLM">No</label> -->
    <div v-if="useLLM">
      <div class="flex flex-row justify-center my-20">
        <ul class="steps steps-vertical lg:steps-horizontal">
          <li
            :class="{
              step: step.status === 'todo',
              'step step-primary': step.status === 'done',
            }"
            v-for="step in steps"
            :key="step.title"
          >
            {{ step.title }}
          </li>
        </ul>
      </div>
      <JsonViewer :fields="jsonFields" :data="data" />
      <div
        class="flex flex-col items-center mt-5 mx-auto w-6/12"
        @keyup.enter="submit"
      >
        <div
          class="flex flex-row justify-between w-full mb-5 pb-5 border-b border-b-black"
        >
          <input
            type="text"
            placeholder="Type here"
            class="input input-bordered w-full max-w-xs"
            v-model="userInput"
          />
          <button class="btn" @click="submit">Bestätigen</button>
        </div>
        <div class="w-full">
          <div
            v-for="statement in chatConversation.slice().reverse()"
            :key="statement.msg"
            :class="`chat ${
              statement.position === 'start' ? 'chat-start' : 'chat-end'
            }`"
          >
            <div
              :class="`chat-bubble ${
                statement.position === 'start' ? 'bg-amber-800' : 'chat-end'
              }`"
            >
              {{ statement.msg }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
    <div class="flex flex-col items-center">
      <h1 class="text-2xl font-bold mb-6">Willkommensfragen</h1>
      <h2>Um dir ein besseres Lernerlebnis zu bieten, möchten wir dich besser kennenlernen.</h2>
      <h2>Bitte beantworte die folgenden Fragen:</h2>
    </div>

      <UserDataInputs />
    </div>
  </div>
</template>
