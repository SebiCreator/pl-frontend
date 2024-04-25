import { StructuredOutputParser } from "langchain/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { late, z } from "zod"
import { MessagesPlaceholder } from "@langchain/core/prompts";



const personalInfoOutputParser = StructuredOutputParser.fromZodSchema(
    z.object({
        email: z.string().describe("Email of the user").default(""),
        name: z.string().describe("Name of the user").default(""),
        age: z.number().describe("Age of the user").default(-1),
        motivationForUsingTheApp: z.string().describe("Motivation of the user").default(""),
        occupation: z.string().describe("Occupation of the user").default(""),
        sex: z.string().describe("Sex of the user").default(""),
        language: z.string().describe("Language of the user").default(""),
    })
)


/* ------ Prompt Templates ------ */

const summarizerPrompt = ChatPromptTemplate.fromTemplate(`
  Aufgabe: Fasse die Informationen des Users als JSON-Datei zusammen
  Falls die Information aus der UserInput nicht vorhanden ist, oder nicht sinvoll ist, schreibe bitte nichts
  Formatting Instructions : {format_instructions}
  UserInput: {userInput}
  Previous conversation: {chat_history}
`);


const s2prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Aufgabe: Fasse die Informationen des Users als JSON-Datei zusammen Falls die Information aus der UserInput nicht vorhanden ist, oder nicht sinvoll ist, schreibe bitte nichts Formatting Instructions : { format_instructions }",
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", "{userInput}"],
]);

const correctorPrompt = ChatPromptTemplate.fromTemplate(`
    Aufgabe: Du bist ein freundlicher und höflicher  Chatbot der Informationen über den User sammelt. 
    Die unten Angegebene Information hat der User noch nicht angegeben. 
    Bitte frage den User freundlich nach dieser Information über Ihn aber sage nicht direkt dass wir diese Daten brauche um Information über Ihn zu sammeln.
    Die Nachricht soll ich folgendem Stil geschrieben sein: 
    Als Output soll nur der Satz stehen, den der Chatbot an den User senden soll.
    Nenne den User mit du.
    Information: {information}
`)






export {
    personalInfoOutputParser,
    summarizerPrompt,
    correctorPrompt
}