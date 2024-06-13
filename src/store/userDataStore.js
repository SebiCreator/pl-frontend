import { defineStore } from 'pinia'

import { ref } from 'vue'
import { Logger } from '../utils/Logger'
import axios from 'axios'

const logger = new Logger({ context: 'userDataStore', enabled: false})

const apiURL = import.meta.env.VITE_BACKEND_URL

export const useUserDataStore = defineStore('userDataStore', () => {
  const userPreferences = ref({})
  const userGoals = ref([])
  const userPersonalData = ref({})
  const llmModel = ref("gpt-3.5-turbo")
  const temperature = ref(0.3)


  async function loadAll({ email }) {
    await loadPreferences({ email })
    await loadGoals({ email })
    await loadPersonalData({ email })
  }

  async function loadPreferences({ email }) {
    axios.get(`${apiURL}/preferences`, { params: { email } })
      .then(response => {
        logger.log(response)
        userPreferences.value = response.data
      })
      .catch(error => logger.error(error))
  }

  async function setPreferences({ email, summary, testTypes }) {
    axios.post(`${apiURL}/preferences`, { email, summary, testTypes })
      .then(response => logger.log(response))
      .catch(error => logger.error(error))
  }

  async function loadGoals({ email }) {
    axios.get(`${apiURL}/goals`, { params: { email } })
      .then(response => {
        logger.log(response)
        userGoals.value = response.data
      })
      .catch(error => logger.error(error))
  }
  async function setGoal({ email, topic , description, focus="", subgoals }) {
    userGoals.value.push({ email, topic, description, focus, subgoals })
    axios.post(`${apiURL}/goals`, { email, topic, focus, description,  subgoals })
      .then(response => logger.log(response))
      .catch(error => logger.error(error))
  }
  async function loadPersonalData({ email }) {
    axios.get(`${apiURL}/users`, { params: { email } })
      .then(response => {
        logger.log(response)
        userPersonalData.value = response.data
      })
      .catch(error => logger.error(error))
  }
  async function setPersonalData({ email, name, age, motivation, occupation, sex, language }) {
    axios.post(`${apiURL}/users`, { email, name, age, motivation, occupation, sex, language })
      .then(response => logger.log(response))
      .catch(error => logger.error(error))
  }

  return { userPreferences, userGoals, userPersonalData,llmModel,temperature, loadPreferences, setPreferences, loadGoals, setGoal, loadPersonalData, setPersonalData, loadAll }
})