<script setup>
import { ref, onBeforeMount, computed } from "vue";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { helloUserChain, chatAgentTools } from "@/utils/chains.js";
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
import {
  getChatSession,
  saveChatSession,
} from "../utils/ChatSessionService.js";
import { useUserDataStore } from "../store/userDataStore.js";
import { storeToRefs } from "pinia";

const userDataStore = useUserDataStore();

const agent = ref(null);
const chatHistory = ref([]);
const chatHistoryId = ref(null);
const editorCode = ref("");

const { llmModel, temperature } = storeToRefs(userDataStore);

const createAgent = async () => {
  const prompt1 = ChatPromptTemplate.fromMessages([
    ("system", "Du bist ein Informatik Tutor und hilfst bei dem Thema {topic}"),
    ("system",
    "Alle Antworten sollen nur Text beinhalten kein, Code oder Markdown"),
    new MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const tools = [...chatAgentTools];

  const llm = createChatOpenAI({
    model: llmModel.value,
    temperature: temperature.value,
  });

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
      role: "human",
      content: msg.text,
    };
  } else if (msg instanceof AIMessage) {
    return {
      role: "ai",
      content: msg.text,
    };
  } else {
    return {
      role: "system",
      content: msg.text,
    };
  }
};

const saveChatHistory = async () => {
  const conv = chatHistory.value;
  if (conv.length === 0) {
    return;
  }
  const formatted = conv.map(chatMessageToJson);
  if (chatHistoryId.value) {
    await saveChatSession({ id: chatHistoryId.value, messages: formatted });
  } else {
    const id = uuidv4();
    await saveChatSession({ id, messages: formatted });
    chatHistoryId.value = id;
    subgoalData.value.chatSessionId = id;
    updateSubgoal();
  }
};

const subgoalData = ref();

const loadSubgoalData = () => {
  const goals = userDataStore.userGoals;
  const goal = goals.find((g) => g.topic === goalTopic.value);
  const _subgoal = goal.subgoals.find((s) => s.topic === subgoal.value);
  subgoalData.value = _subgoal;
};

const loadChatHistory = async () => {
  if (subgoalData.value.chatSessionId) {
    const chatSession = await getChatSession({
      id: subgoalData.value.chatSessionId,
    });
    chatHistoryId.value = subgoalData.value.chatSessionId;
    const cs = chatSession.messages.map((m) => {
      if (m.role === "human") {
        return new HumanMessage(m.content);
      } else if (m.role === "ai") {
        return new AIMessage(m.content);
      } else if (m.role === "system") {
        return new SystemMessage(m.content);
      }
    });

    chatHistory.value = cs;
  }
};

const updateSubgoal = async () => {
  const result = await axios.post("http://localhost:3000/subgoal", {
    email: userDataStore.userPersonalData.email,
    topic: goalTopic.value,
    subgoalTopic: subgoal.value,
    count: subgoalData.value.count,
    maxCount: subgoalData.value.maxCount,
    chatSessionId: chatHistoryId.value,
    difficulty: subgoalData.value.difficulty,
  });
};

const callModel = async (userMessage, save = true) => {
  if (userMessage === "") {
    return;
  }
  save ? chatHistory.value.push(new HumanMessage(userMessage)) : null;
  const response = await agent.value.invoke({
    input: userMessage,
    topic: subgoal.value,
    chat_history: chatHistory.value,
  });
  console.log({ response });
  chatHistory.value.push(new AIMessage(response.output));
  saveChatHistory();
};

const userCall = async (user) => {
  await callModel(user);
};

const firstCall = async () => {
  await callModel("Hallo", false);
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
const challangeActions = [
  {
    titel: "Aufgabe lösen",
    prompt: "Kannst du mir bitte bei der Aufgabe helfen",
  },
  {
    titel: "Fehler finden",
    prompt: "Kannst du mir bitte bei der Fehleranalyse helfen",
  },
  {
    titel: "Fragen beantworten",
    prompt: "Kannst du mir bitte bei der Frage helfen",
  },
  {
    titel: "Zurück",
    prompt: "",
    isPath: true,
  },
];

const helpActions = [
  {
    titel: "Erklärung",
    prompt: "Erkläre mir bitte das Konzept",
  },
  {
    titel: "Beispiel",
    prompt: "Bitte gib mir hierfür ein Beispiel",
  },
  {
    titel: "Themen",
    prompt: "Zeige mir eine Roadmap zu meinem Ziel",
  },
  {
    titel: "Zurück",
    isPath: true,
  },
];
const codeReviewActions = [
  {
    titel: "Code verbessern",
    prompt: "",
  },
  {
    titel: "Code bewerten",
    prompt: "",
  },
  {
    titel: "Tipps geben",
    prompt: "",
  },
  {
    titel: "Zurück",
    isPath: true,
  },
];
const mainActions = [
  {
    titel: "Aufgabe",
    isPath: true,
  },
  {
    titel: "Hilfe",
    isPath: true,
  },
  {
    titel: "Code Review",
    isPath: true,
  },
];
const actions = ref(mainActions);
const codeView = ref("");
const prompt = ref("");

const sendMessage = async () => {
  await callModel(prompt.value);
  prompt.value = "";
};

const startConversation = async () => {
  try {
    loadSubgoalData();
    await loadChatHistory();
    if (chatHistory.value.length === 0) {
      await firstCall();
    }
  } catch (error) {
    await firstCall();
  }
};

const resetConversation = async () => {
  chatHistory.value = [];
  chatHistoryId.value = uuidv4();
  subgoalData.value.chatSessionId = chatHistoryId.value;
  await updateSubgoal();
  startConversation();
};

const changeActions = (titel) => {
  console.log(titel);
  switch (titel) {
    case "Aufgabe":
      actions.value = challangeActions;
      break;
    case "Hilfe":
      actions.value = helpActions;
      break;
    case "Code Review":
      actions.value = codeReviewActions;
      break;
    default:
      actions.value = mainActions;
  }
};

const submitAction = async (action) => {
  const prompt = action.prompt;
  const titel = action.titel;
  const isPath = action.isPath || false;
  if (isPath) {
    changeActions(titel);
    return;
  } else {
    if (titel === "Code verbessern") {
      const _prompt =
        "Verbessere bitte den folgenden Code: \n" + editorCode.value;
      await callModel(_prompt);
    } else if (titel === "Code bewerten") {
      const _prompt = "Bewerte bitte den folgenden Code: \n" + editorCode.value;
      await callModel(_prompt);

    } else if(titel === "Tipps geben") {
      const _prompt = "Gib mir bitte Tipps zum folgenden Code: \n" + editorCode.value;
      await callModel(_prompt);
    }
     else {
      await callModel(prompt);

    }
  }
};

const handleEditorChange = (newCode) => {
  console.log(newCode);
  editorCode.value = newCode;
};

const temperatures = [0, 0.3, 0.5, 0.7, 1];
const llmModels = [
  {
    name: "GPT-4o",
    model: "gpt-4o",
  },
  {
    name: "GPT-4",
    model: "gpt-4",
  },
  {
    name: "GPT-4-Turbo",
    model: "gpt-4-turbo",
  },
  {
    name: "GPT-4",
    model: "",
  },
  {
    name: "GPT-3.5-Turbo",
    model: "gpt-3.5-turbo",
  },
];
const changeLLM = async (model) => {
  userDataStore.llmModel = model;
  await createAgent();
};
const changeTemperature = async (temp) => {
  userDataStore.temperature = temp;
  await createAgent();
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
      <details class="dropdown">
        <summary class="m-1 btn">Temperature</summary>
        <ul
          class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
        >
          <li
            :class="{
              'bg-gray-200': step === temperature,
              'cursor-pointer': true,
            }"
            v-for="step in temperatures"
            :key="step"
            @click="changeTemperature(step)"
          >
            <a>{{ step }} </a>
          </li>
        </ul>
      </details>
      <details class="dropdown">
        <summary class="m-1 btn">Model</summary>
        <ul
          class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
        >
          <li
            :class="{
              'bg-gray-200': model.model === llmModel,
              'cursor-pointer': true,
            }"
            v-for="model in llmModels"
            :key="model"
            @click="changeLLM(model.model)"
          >
            <a>{{ model.name }}</a>
          </li>
        </ul>
      </details>
    </div>
    <div class="flex justify-center h-screen">
      <div
        class="w-1/2 border flex items-center justify-center overflow-hidden rounded-lg"
      >
        <div class="border h-full w-full p-4 rounded-xl">
          <Editor
            v-model:code="code"
            :vsCodeSync="false"
            @change="handleEditorChange"
          />
        </div>
      </div>

      <div
        class="w-1/2 flex flex-col justify-between items-center border rounded-lg"
      >
        <div class="w-full flex flex-col items-center h-full m-4">
          <div class="border h-3/4 overflow-scroll mx-2">
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
          <div class="mt-3 flex flex-row justify-evenly items-center flex-wrap">
            <button
              v-for="a in actions"
              :key="a"
              class="btn mx-1"
              @click="submitAction(a)"
            >
              {{ a.titel }}
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
