import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createOpenAI } from "./LLMService.js";
import { StructuredOutputParser } from "langchain/output_parsers";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";




const llm = createOpenAI()
const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
        code: z.string().describe("The code example that demonstrates the topic").default(""),
    })
)



const prompt = ChatPromptTemplate.fromTemplate(`
    Based on the following topic create a code example in the following programming language that demonstrates the topic.
    Topic: {topic}
    Text Language: {language}
    Programming Language: {programming_language}
    Formatting Instructions: {format_instructions}
`)


const mainFunc = () => {
    const chain = prompt.pipe(llm).pipe(outputParser)
    const invokeChain = async (topic, language) => chain.invoke({ topic, language, format_instructions: outputParser.getFormatInstructions() })
    return invokeChain

}


const helloUserPrompt = ChatPromptTemplate.fromTemplate(`
    Your are a tutor for coding.
    Please greet the user that wants to learn {topic}.
    Ask him if he has specific questions or if he just wants to start the learning?
    Your name is: {name}.
    In the language {language}.
`)
const helloUserChain = helloUserPrompt.pipe(llm)





const subGoalSplitterParser = StructuredOutputParser.fromZodSchema(
    z.object({
        subgoals: z.array(z.object({
            name: z.string().describe("The subgoal to be achieved").default(""),
            description: z.string().describe("The description of the subgoal").default(""),
        })),
        goal: z.string().describe("The main goal to be achieved").default(""),
    }).describe("The subgoals to be achieved for the main goal").default({})
)
const subGoalSplitterPrompt = ChatPromptTemplate.fromTemplate(`
    Das Ziel des Users : {goal}
    Beschreibung was er dabei genau lernen will: {description}
    Du bist ein Tutor für Programmieren.
    Deine Aufgabe ist es ein Ziel mit der Beschreibung in mindestens 10 kleinere Teilziele zu unterteilen.
    Diese Teilziele sollen Themen enthalten die nacheinander erlernt werden können um das Hauptziel zu erreichen.
    Es sollen keine Lernmethoden oder ähnliches enthalten sein nur die fachlichen Unterthemen.
    Es soll bei allen Teilzielen so gut es geht der Kontext des Ziels und der Beschreibung eingehen
    Wenn der User Input nicht sinnvoll ist soll ein leeres JSON Objekt zurückgegeben werden.
    Format Instructions: {format_instructions}
    Sprace der der Json Datei: {language}
`)

const subGoalSplitterChain = subGoalSplitterPrompt.pipe(llm).pipe(subGoalSplitterParser)


const useSubGoalSplitter = async ({ goal, description, language }) => {
    return subGoalSplitterChain.invoke({ goal, description, language, format_instructions: subGoalSplitterParser.getFormatInstructions() })
}


const correctorSubgoalSplitterPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Der User hat folgendes Ziel: {goal}
    Vorgeschlagene Unterziele von AI waren: {subgoals}
    Der User möchte folgende Änderungen an den Unterzielen vornehmen: {changes}
    Bitte korrigiere die die Unterziele entsprechend sodasss seine Änderungen berücksichtigt werden.
    Wenn der User sein Ziel geändert hat, dann passe Goal im JSON entsprechend an.
    Erstelle mindestens 6 Unterziele
    Format Instructions: {format_instructions}
    Sprace der der Json Datei: {language}
`)

const correctorSubgoalSplitterChain = correctorSubgoalSplitterPrompt.pipe(llm).pipe(subGoalSplitterParser)

const useCorrectorSubGoalSplitter = async ({ goal, subgoals, changes, language }) => {
    return correctorSubgoalSplitterChain.invoke({ goal, subgoals, changes, language, format_instructions: subGoalSplitterParser.getFormatInstructions() })
}



const GoalSummaryPrompt = ChatPromptTemplate.fromTemplate(`
    Deine Aufgabe ist anhand folgender Informationen kurz zusammenzufassen um was es geht.
    Diese soll dem User helfen sein Ziel und seine Unterziele besser zu verstehen.
    Die Nachricht soll neutral sein und nicht Teile wie: "Der User hat das Ziel" , "der User will.." , "Zusammenfassung:" enthalten
    Die Nachricht soll nur Text enthalten keine Sonderzeichen und Punkte
    Die Nachricht soll maximal 20 Wörter enthalten

    Beispiel:
    Ziel: Grundlagen von Java erlernen
    Zusammenfassung: Die Grundlagen von Java verstehen wie Klassen, Vererbung und so weiter

    Der User hat folgendes Ziel: {goal}
    Der User hat folgende Unterziele für das Ziel: {subgoals}
    Der Fokus des Users ist: {focus}


`)

const goalSummaryChain = GoalSummaryPrompt.pipe(llm)

const useGoalSummaryChain = async ({ goal, subgoals, focus  }) => { return goalSummaryChain.invoke({ goal, subgoals, focus }) }












const findErrorPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Für das Thema {topic} sollst du bitte eine Beispiel für den User erstellen in dem ein Fehler ist.
    Der User soll den Fehler finden und korrigieren.
    Die Aufgabe sollte nicht zu einfach sein und nicht zu schwer.
`)

const findErrorChain = findErrorPrompt.pipe(llm)
const useFindErrorChain = async ({ topic }) => findErrorChain.invoke({ topic })


const findErrorTool = new DynamicStructuredTool({
    name: "findError",
    schema: z.object({
        topic: z.string().describe("The topic of the error").default(""),
    }),
    description: "Creates an example with an error for the user to find and correct",
    func: async ({topic}) => await useFindErrorChain({ topic }),
    callbacks: {
        onInvoke: (result) => {
            console.log(result)
        }

    }
})






const resolveFindErrorPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Für das Thema {topic} hast du dem User folgende Aufgabe gestellt: {task}
    Der User hat die Aufgabe so gelöst: {solution}
    Gib dem User Feedback ob er den Fehler gefunden hat und ob er ihn korrigiert hat.
`)

const resolveFindErrorChain = resolveFindErrorPrompt.pipe(llm)
const useResolveFindErrorChain = async ({ topic, task, solution }) => resolveFindErrorChain.invoke({ topic, task, solution })

const resolveFindErrorTool = new DynamicStructuredTool({
    name: "resolveFindError",
    description: "Gives feedback to the user if he found and corrected the error",
    schema: z.object({
        topic: z.string().describe("The topic of the error").default(""),
        task: z.string().describe("The task that was given to the user").default(""),
        solution: z.string().describe("The solution that the user provided").default(""),
    }),
    func: async ({topic, task, solution}) => await useResolveFindErrorChain({ topic, task, solution }),
})







const askQuestionPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Für das Thema {topic} sollst du bitte eine Frage für den User erstellen welche dieser beantworten soll
    Die Frage sollte nicht zu einfach sein und nicht zu schwer.
`)

const askQuestionChain = askQuestionPrompt.pipe(llm)
const useAskQuestionChain = async ({ topic }) => askQuestionChain.invoke({ topic })

const askQuestionTool = new DynamicStructuredTool({
    name: "askQuestion",
    schema: z.object({
        topic: z.string().describe("The topic of the question").default(""),
    }),
    description: "Erstellt eine Frage für den User zum Thema",
    func: async ({topic}) => await useAskQuestionChain({ topic }),
})







const resolveAskQuestionPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Für das Thema {topic} hast du dem User folgende Frage gestellt: {question}
    Der User hat die Frage so beantwortet: {answer}
    Gib dem User Feedback ob er die Frage richtig beantwortet hat.
`)

const resolveAskQuestionChain = resolveAskQuestionPrompt.pipe(llm)
const useResolveAskQuestionChain = async ({ topic, question, answer }) => resolveAskQuestionChain.invoke({ topic, question, answer })


const resolveAskQuestionTool = new DynamicStructuredTool({
    name: "resolveAskQuestion",
    description: "Gives feedback to the user if he answered the question correctly",
    schema: z.object({
        topic: z.string().describe("The topic of the question").default(""),
        question: z.string().describe("The question that was given to the user").default(""),
        answer: z.string().describe("The answer that the user provided").default(""),
    }),
    func: async ({topic, question, answer}) => useResolveAskQuestionChain({ topic, question, answer }),
})






const codeReviewPrompt = ChatPromptTemplate.fromTemplate(`
    Du bist ein Tutor für Programmieren.
    Der User hat dir folgenden Code geschickt: {code}
    Bitte gib dem User Feedback ob der Code richtig ist und wenn nicht was er ändern muss.
`)

const codeReviewChain = codeReviewPrompt.pipe(llm)
const useCodeReviewChain = async ({ code }) => codeReviewChain.invoke({ code })


const codeReviewTool = new DynamicStructuredTool({
    name: "codeReview",
    schema: z.object({
        code: z.string().describe("The code that the user provided").default(""),
    }),
    description: "Reviews the code that the user provided",
    func: async ({code}) => useCodeReviewChain({ code }),
})



const chatAgentTools = [findErrorTool, resolveFindErrorTool, askQuestionTool, resolveAskQuestionTool, codeReviewTool]






export {
    mainFunc,
    helloUserChain,
    useSubGoalSplitter,
    useCorrectorSubGoalSplitter,
    chatAgentTools,
    useGoalSummaryChain,
}