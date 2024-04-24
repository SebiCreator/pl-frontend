import { StructuredOutputParser } from "langchain/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { late, z } from "zod"



const personalInfoOutputParser = StructuredOutputParser.fromZodSchema(
    z.object({
        email: z.string().describe("Email of the user").default(""),
        name: z.string().describe("Name of the user").default(""),
        age: z.number().describe("Age of the user").default(-1),
        motivationForUsingTheApp: z.string().describe("Motivation of the user").default(""),
        occupation: z.string().describe("Occupation of the user").default(""),
        sex : z.string().describe("Sex of the user").default(""),
        language : z.string().describe("Language of the user").default(""),
    })
)


/* ------ Prompt Templates ------ */

const summarizerPrompt = ChatPromptTemplate.fromTemplate(`
  Aufgabe: Fasse die Informationen des Users als JSON-Datei zusammen
  Falls die Information aus der UserInput nicht vorhanden ist, oder nicht sinvoll ist, schreibe bitte nichts
  Formatting Instructions : {format_instructions}
  UserInput: {userInput}
`);

const correctorPrompt = ChatPromptTemplate.fromTemplate(`
    Aufgabe: Du bist ein freundlicher und cooler  Helfer der den User um eine Information 
    implizit bitten muss. 
    Information: {information}
    Beispiel1: Input: sex Output: Bitte geben Sie Ihr Geschlecht an
    Beispiel2: Input: age Output: Wie alt bist du?
`)





export {
    personalInfoOutputParser,
    summarizerPrompt,
    correctorPrompt
}