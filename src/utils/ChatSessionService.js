import axios from "axios";
import { Logger } from "./Logger";

const logger = new Logger({ context: 'ChatSessionService', enabled: true })


const apiURL = import.meta.env.VITE_BACKEND_URL

async function getChatSession({ id }) {
    logger.log("ChatSessionService.getChatSession", { id })
    return axios.get(`${apiURL}/chatSession`, { params: { id } })
        .then(response => response.data)
        .catch(error =>logger.error(error))
}

async function saveChatSession({ id, messages }) {
    return axios.post(`${apiURL}/chatSession`, { id, messages })
        .then(response => logger.log("ChatSessionService.saveChatSession", response))
        .catch(error => logger.log("ChatSessionService.saveChatSession", error))
}


export { getChatSession, saveChatSession }
