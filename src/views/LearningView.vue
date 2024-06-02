<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
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
import { useUserDataStore } from "../store/userDataStore.js";

const userDataStore = useUserDataStore();

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

const subgoal = ref(route.params.subgoalTopic);
const goalTopic = ref(route.params.goalTopic);


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
  const conv = chatHistory.value
  if(conv.length === 0){
    return
  }
  const formatted = conv.map(chatMessageToJson)
  if(chatHistoryId.value){
    await saveChatSession({ id: chatHistoryId.value, messages: formatted })
  }
  else{
    const id = uuidv4()
    await saveChatSession({ id, messages: formatted })
    chatHistoryId.value = id
    subgoalData.value.chatSessionId = id
    updateSubgoal()
  }
};

const subgoalData = ref()

const loadSubgoalData = () => {
  const goals = userDataStore.userGoals
  const goal = goals.find(g => g.topic === goalTopic.value)
  const _subgoal = goal.subgoals.find(s => s.topic === subgoal.value)
  subgoalData.value = _subgoal
}

const loadChatHistory = async () => {
  if(subgoalData.value.chatSessionId){
    const chatSession = await getChatSession({id: subgoalData.value.chatSessionId})
    chatHistoryId.value  = subgoalData.value.chatSessionId
    const cs  = (chatSession.messages.map(m => {
      if(m.role === "human"){
        return new HumanMessage(m.content)
      } else if (m.role === "ai"){
        return new AIMessage(m.content)
      } else if (m.role === "system"){
        return new SystemMessage(m.content)
      }
    }))
    
    chatHistory.value = cs
  }
}


const updateSubgoal = async () => {
 const result = await axios.post("http://localhost:3000/subgoal",{
   email : userDataStore.userPersonalData.email,
   topic: goalTopic.value,
   subgoalTopic : subgoal.value,
   count: subgoalData.value.count,
   maxCount : subgoalData.value.maxCount,
   chatSessionId : chatHistoryId.value,
   difficulty : subgoalData.value.difficulty
 }) 
}

const callModel = async (user,save=true) => {
  save ? chatHistory.value.push(new HumanMessage(user)) : null
  const response = await agent.value.invoke({
    input: user,
    topic: subgoal.value,
    chat_history: chatHistory.value,
  });
  chatHistory.value.push(new AIMessage(response.output));
  saveChatHistory()
};

const userCall = async (user) => {
  await callModel(user);
};

const firstCall = async () => {
  await callModel("Hallo",false);
};


const questionLoading = ref(false);

const isHumanMessage = (msg) => {
  return msg instanceof HumanMessage;
};
const isAIMessage = (msg) => {
  return msg instanceof AIMessage;
};
const isSystemMessage = (msg) => {
  return msg instanceof SystemMessage;
};

const messages = computed(() => {
  return chatHistory.value.map((msg) => {
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
  await callModel(prompt.value);
  prompt.value = "";
};


const startConversation = async () => {
    try{
      loadSubgoalData()
      await loadChatHistory()
      if (chatHistory.value.length === 0) {
        await firstCall();
      }
    } catch (error) {
        await firstCall()
    }

}

const resetConversation = async () => {
  chatHistory.value = []
  chatHistoryId.value = uuidv4()
  subgoalData.value.chatSessionId = chatHistoryId.value
  await updateSubgoal()
  startConversation()
}



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
    <div class="flex flex-row justify-around items-center">
      <h1 class="text-lg m-3 border p-2">
        Thema: {{ subgoal || "No subgoal" }}
      </h1>
      <button @click="resetConversation" class="btn">Reset Conversation</button>
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
        <div class="w-full   flex flex-col items-center  h-full m-4" >
          <div class="border  h-3/4 overflow-scroll mx-2">
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
            class="mt-3 flex flex-row justify-evenly items-center flex-wrap"
          >
            <button
              v-for="a in actions"
              :key="a"
              class="btn mx-1"
              @click="submitAction(a)"
            >
              {{ a }}
            </button>
          </div>
          <div class="mt-3 flex flex-row justify-center">
          <input
            type="text"
            v-model="prompt"
            placeholder="Type here"
            class="input input-bordered w-full max-w-xs mr-2"
            @keypress.enter="sendMessage"
          />
          <button class="btn" @click="sendMessage">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
