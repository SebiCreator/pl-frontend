<script setup>
import { ref } from "vue";
import { createOpenAI } from "../utils/LLMService.js";
import {  summarizerPrompt,correctorPrompt, personalInfoOutputParser } from "../utils/prompts.js";
import ChatInterface from "../components/ChatInterface.vue";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers"
import { getEmptyKeys } from "../utils/special.js";

const model = createOpenAI()

const steps = ref([
  {
    title: "Personal",
    status: "todo",
    question: "Erzähle mir von dir als Person",
    reqInfos : ["name", "age", "occupation","motivation"]
  },
  { title: "Ziele", status: "todo", question: "Was willst du können?", reqInfos : ["goals"] },
  { title: "Weg", status: "todo", question: "Wie willst du es lernen?", reqInfos: [] },
  {
    title: "Lerntechniken",
    status: "todo",
    question: "Welche Lerntechniken magst du?",
    reqInfos: []
  },
]);



const chatConversation = ref([
  { message: steps.value[0].question, position: "start" },
]);

const userInput = ref("");

const handleUserMessage = async (userMessage) => {
    const {question , reqInfos} = steps.value.find((step) => step.status === "todo");
    const chain = summarizerPrompt.pipe(model).pipe(personalInfoOutputParser)
    const res = await chain.invoke({question, userInput: userMessage, format_instructions: personalInfoOutputParser.getFormatInstructions()})
    console.log(res)
    const emptyKeys = getEmptyKeys(res)
    if (emptyKeys.length === 0) {

    }
    console.log(emptyKeys)
    const nextQuestions = emptyKeys.forEach(async key => {
      const correctorChain = correctorPrompt.pipe(model).pipe(new StringOutputParser())
      const aiResponse = await correctorChain.invoke({ information: key})
      console.log(aiResponse)
    })

    addMessage(res, "start");
    //const resCorr = await correctorChain.invoke({jsonData: JSON.stringify(res)})
    //console.log(resCorr)
}

const addMessage = (message,position) => {
    chatConversation.value.push({ message, position });
}

const submit = async () => {
  const newMessage = userInput.value;
  if (newMessage) {
    addMessage(newMessage, "end")
    handleUserMessage(userInput.value)
    userInput.value = "";
  }
};
</script>

<template>
  <div>
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
        <button class="btn" @click="submit">Submit</button>
      </div>
      <div class="w-full">
        <div
          v-for="statement in chatConversation"
          :key="statement.message"
          :class="`chat ${
            statement.position === 'start' ? 'chat-start' : 'chat-end'
          }`"
        >
          <div
            :class="`chat-bubble ${
              statement.position === 'start' ? 'bg-amber-800' : 'chat-end'
            }`"
          >
            {{ statement.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
