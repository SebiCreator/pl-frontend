<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { helloUserChain,chatAgentTools } from "@/utils/chains.js";
import { Agent } from "@/utils/agents.js";
import axios from "axios";
import { defineProps } from "vue";
import { useRoute } from "vue-router";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createChatOpenAI } from "../utils/LLMService.js";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { exampleDyanmicTool } from "../utils/tools.js";
import {
  createOpenAIFunctionsAgent,
  AgentExecutor,
  createReactAgent,
} from "langchain/agents";
import Editor from "../components/Editor.vue";
import { v4 as uuidv4 } from "uuid";
import { getChatSession , saveChatSession} from "../utils/ChatSessionService.js";

const agent = ref(null);
const chatHistory = ref([]);
const chatHistoryId = ref(null)

const createAgent = async () => {
  const prompt1 = ChatPromptTemplate.fromMessages([
    ("system", "Du bist ein Informatik Tutor und hilfst bei dem Thema {topic}"),
    ("system", "Alle Antworten sollen nur Text beinhalten kein, Code oder Markdown Symbole"),
    new MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const tools = [...chatAgentTools];

  const llm = createChatOpenAI();

  const _agent = await createOpenAIFunctionsAgent({
    llm: llm,
    prompt: prompt1,
    tools: tools,
  });

  agent.value = new AgentExecutor({ agent: _agent, tools });
};

const route = useRoute();

const subgoal = ref(route.params.topic);
const topic = ref(route.params.goalTopic);

const chatMessageToJson = (msg) => {
  if (msg instanceof HumanMessage) {
    return {
      role : "human",
      content : msg.text,
    };
  } else if ( msg instanceof AIMessage) {
    return {
      role : "ai",
      content : msg.text,
    };
  } else {
    return {
      role: "system",
      content : msg.text,
    };
  }
}

const saveChatHistory = async () => {
  const conv = chatConversation.value
  const formatted = conv.map(chatMessageToJson)
  if(chatHistoryId.value){
    await saveChatSession({ id: chatHistoryId.value, messages: formatted })
  }
  else{
    const id = uuidv4()
    await saveChatSession({ id, messages: formatted })
    chatHistoryId.value = id
  }
};

const updateSubgoal = async (subgoal) => {}

const callModel = async (user,save=true) => {
  save ? chatHistory.value.push(new HumanMessage(user)) : null
  save ? chatConversation.value.push(new HumanMessage(user)) : null
  saveChatHistory()
  const response = await agent.value.invoke({
    input: user,
    topic: subgoal.value,
    chat_history: chatHistory.value,
  });
  console.log(response);
  console.log(chatHistory.value);
  chatHistory.value.push(new AIMessage(response.output));
  chatConversation.value.push(new AIMessage(response.output));
};

const userCall = async (user) => {
  chatConversation.value.push(new HumanMessage(user));
  chatHistory.value.push(new HumanMessage(user));
  await callModel(user);
};

const firstCall = async () => {
  await callModel("Hallo",false);
};

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
const questionActions = ["Erklärung", "Beispiel"];
const activeQuestions = ["Aufgabe lösen","Fehler finden","Fragen benatworten"]
const actions = ref([...questionActions, ...activeQuestions]);
const codeView = ref("");
const prompt = ref("");

const sendMessage = async () => {
  console.log("sending message");
  await callModel(prompt.value);
};


const startConversation = async () => {
    try{
      await loadConversation()
      throw new Error("No conversation found")
    } catch (error) {
        await firstCall()
    }

}

const saveConversation = () => {
  const msg = messages.value // Can be saved to a database

  console.log({msg})
}

const loadConversation = async () => {
  // TODO:
};

const submitAction = async (msg) => {
  await callModel(msg) 
};

onBeforeMount(async () => {
  await createAgent();
  await startConversation();
});
</script>
<template>
  <div>
    {{ chatConversation }}
    <div class="flex flex-row justify-around items-center">
      <h1 class="text-lg m-3 border p-2">
        Thema: {{ subgoal || "No subgoal" }}
      </h1>
      <button @click="saveConversation" class="btn">Save</button>
    </div>
    <div class="flex justify-center h-screen">
      <div
        class="w-1/2 border flex items-center justify-center overflow-hidden rounded-lg"
      >
        <div class="border h-full w-full p-4 rounded-xl">
          <Editor vscodeSync />
        </div>
      </div>

      <div
        class="w-1/2 flex flex-col justify-between items-center border rounded-lg"
      >
        <div class="w-full h-full m-4">
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
          <div
            class="flex flex-row w-3/4 justify-around items-center flex-wrap"
          >
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
    </div>
  </div>
</template>
