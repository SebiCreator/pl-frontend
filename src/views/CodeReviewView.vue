<script setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Editor from "../components/Editor.vue";
import { createChatOpenAI } from "../utils/LLMService.js";
import { useUserDataStore } from "../store/userDataStore.js";
import { storeToRefs } from "pinia";
import { StructuredOutputParser } from "langchain/output_parsers";
import { codeReviewChains } from "../utils/chains";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  MessagesPlaceholder,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";

const systemPromptTemplate = `
    Du bist ein Tool das dem User bei Code Reviews hilft.
    Der User wird dir Anweisungen wie:  Code bewerten,Tipps geben,Code verbessern usw geben.
    Du sollst einerseits die Frage des User kurz beantworten um ihm zu sagen was du tust.
    Andererseits sollst du ihm Code ausgeben basierend darauf was er will
    Wenn der User Dingen fragt die nichts mit Code zu tun haben, gib ihm eine Antwort die ihm sagt das du nur Code verstehst.
    Format Instructions : {formatInstructions}
`;
const userQuestion = "hello World";

const testUserCode = "print('hello world')";

const outputParser = new StructuredOutputParser(
  z.object({
    code: z.string().describe("Der Code den du dem User zurück gibst"),
    responseMessage: z.string("Die Nachricht die du dem User zurück gibst"),
  })
);

const promptTemplate = ChatPromptTemplate.fromMessages([
  ("system", systemPromptTemplate),
  ("user", "{userQuestion}"),
  ("user", "{userCode}"),
  new MessagesPlaceholder("chatHistory"),
]);

const { llmModel, temperature } = storeToRefs(useUserDataStore);

const model = createChatOpenAI();

const chain = promptTemplate.pipe(model).pipe(outputParser);
const callChain = async (userCode, userQuestion) =>
  chain.invoke({
    userCode,
    userQuestion,
    formatInstructions: outputParser.getFormatInstructions(),
    chatHistory: chatHistory.value,
  });

const askQuestion = async (question, newCode = false) => {
  questionLoading.value = true;
};

const route = useRoute();
const sessionId = route.params.sessionId || null;

const chatHistory = ref([]);
const code = ref("const a = helloWorld");
const vsCodeSync = ref(false);
const questionLoading = ref(false);
const actions = ref([
  {
    titel: "Code bewerten",
    action: "Bewerte folgenden Code",
    func: codeReviewChains.codeEval,
  },
  {
    titel: "Tipps geben",
    action: "Gib mir Tipps zu folgendem Code",
    func: codeReviewChains.codeFeedback,
  },
  {
    titel: "Code verbessern",
    action: "Verbessere folgenden Code",
    func: codeReviewChains.codeImprove,
  },
  {
    titel: "Fragen stellen",
    action: "Stelle mir eine Frage zu meinem Code",
    func: codeReviewChains.codeQuestion,
  },
]);
const topic = ref("");
const prompt = ref("");

const submitAction = async (action) => {
  const func = action.func;
  chatHistory.value.push(new HumanMessage(action.action));
  const result = await func({ code: code.value });
  if (!(result instanceof Object)) {
    chatHistory.value.push(new AIMessage(result));
  } else {
    const { code: newCode, message } = result;
    chatHistory.value.push(new AIMessage(message));
    code.value = newCode;
  }
  questionLoading.value = false;
};
const handleEditorChange = (newCode) => {
  /* Not used currently */
};
const sendMessage = async () => {
  chatHistory.value.push(new HumanMessage(prompt.value));
  const response = await codeReviewChains.generalQuestion({
    question: prompt.value,
    chatHistory: chatHistoryString.value,
  });
  chatHistory.value.push(new AIMessage(response));
  prompt.value = "";
};

const messages = computed(() => {
  return chatHistory.value.map((msg) => {
    if (msg instanceof HumanMessage) {
      return {
        text: msg.text,
        loc: "end",
      };
    } else if (msg instanceof AIMessage) {
      return {
        text: msg.text,
        loc: "start",
      };
    } else if (msg instanceof SystemMessage) {
      return {
        text: msg.text,
        loc: "start",
      };
    }
  });
});

const chatHistoryString = computed(() => {
  return chatHistory.value.map((msg) => msg.text).join("\n");
});

const userHello = () => {
  chatHistory.value.push(
    new AIMessage(
      "Hallo, ich bin dein Code Review Tool, zeige mir deinen Code dann kann ich dir helfen"
    )
  );
};

const onEmptyTopic = () => {
  console.log({ t: topic.value })
  if (topic.value === "" && true ){
    codeReviewChains
      .sessionSummary({ chatHistory: chatHistoryString.value })
      .then((res) => {
        console.log(res);
        topic.value = res
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

onBeforeMount(userHello);
</script>

<template>
  <div>
    <div class="flex flex-row justify-around items-center">
      <h1 v-if="topic" class="text-lg m-3 border p-2">
        {{ topic }}
      </h1>
    </div>
    <div class="flex justify-center h-screen">
      <div
        class="w-1/2 border flex items-center justify-center overflow-hidden rounded-lg"
      >
        <div class="border h-full w-full p-4 rounded-xl">
          <Editor
            v-model:code="code"
            :vsCodeSync="vsCodeSync"
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
