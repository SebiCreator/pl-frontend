<script setup>
import { ref } from "vue";
import ChatInterface from "../components/ChatInterface.vue";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const apiKey = "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"
console.log({ apiKey });

const prompt = ChatPromptTemplate.fromTemplate(
    "Aufgabe: Gegeben ist ein User Input. Fasse die Informationen des Users als JSON-Datei zusammen\n",
    "UserInput: {userInput}\n",
);

const model = new OpenAI({ openAIApiKey: apiKey, model: "gpt-4"});

const steps = ref([
  { title: "Why App", status: "todo", question: "Warum benutzt du diese App?", reqInfos: ["motivation"]},
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

const questionAnsweredTemplate = ChatPromptTemplate.fromTemplate(
    "UserInput: {userInput}\n" + 
    "Frage: {question}\n" + 
    "Benötigte Informationen: {reqInfos}\n" + 
    "Du bist ein freundlicher Agent der dem User hilft seine Informationen zu sammeln\n",
    "Aufgabe: Ein User hat eine Frage beantwortet. Bitte überprüfe ob alle Informationen vorhanden sind\n" + 
    "Wenn nicht alle Informationen vorhanden sind stelle eine Frage mit der der User die fehlende Information beantworten kann\n" + 
    "Wenn alle Informationen vorhanden sind oder es keine benötigten Informationen gibt, gibt nur ferig aus\n",
);

const questionAnswered = async (userInput,question,reqInfos) => {
    if (reqInfos.length === 0) {
        return "Danke für deine Information"
    }
    const chain = questionAnsweredTemplate.pipe(model);
    const result = await chain.invoke({ userInput, question, reqInfos });
    return result
}

const handleUserMessage = async (userMessage) => {
    const {question , reqInfos} = steps.value.find((step) => step.status === "todo");
    const res = await questionAnswered(userMessage, question, reqInfos);
    addMessage(res, "start");
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
