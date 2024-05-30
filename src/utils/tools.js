import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";



const exampleDyanmicTool = new DynamicTool({
    name: "FOO",
    description: "call this to get the value of foo. input should be an empty string.",
    func: async () => "baz",
})
const defaultMessageTool = new DynamicTool({
    name: "defaultMessage",
    description: "call this if you dont know what to answer or if the user types some random or unclear message and you dont know what to do. input should be an empty string.",
    func: async () => "I dont know what you mean :(",
})
const exampleDyanmicStructuredTool = new DynamicStructuredTool({
    name: "random-number-generator",
    description: "generates a random number between two input numbers",
    schema: z.object({
        low: z.number().describe("The lower bound of the generated number"),
        high: z.number().describe("The upper bound of the generated number"),
    }),
    func: async ({ low, high }) =>
        (Math.random() * (high - low) + low).toString(), 
})


export {
    exampleDyanmicTool,
    defaultMessageTool,
    exampleDyanmicStructuredTool
}
