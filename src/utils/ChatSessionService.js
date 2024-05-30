import axios from "axios";


const apiURL = 'http://localhost:3000'

async function getChatSession({ id }) {
    return axios.get(`${apiURL}/chatSession`, { params: { id } })
        .then(response => response.data)
        .catch(error => console.error(error))
}

async function saveChatSession({ id, messages }) {
    return axios.post(`${apiURL}/chatSession`, { id, messages })
        .then(response => console.log(response))
        .catch(error => console.error(error))
}


export { getChatSession, saveChatSession }
