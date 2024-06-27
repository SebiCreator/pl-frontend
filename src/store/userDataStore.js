import { defineStore } from 'pinia'

import { ref } from 'vue'
import { Logger } from '../utils/Logger'
import axios from 'axios'

const logger = new Logger({ context: 'userDataStore', enabled: true })

const apiURL = import.meta.env.VITE_BACKEND_URL

export const useUserDataStore = defineStore('userDataStore', () => {
  const userPreferences = ref({})
  const userGoals = ref([])
  const userPersonalData = ref({})
  const llmModel = ref("gpt-3.5-turbo")
  const temperature = ref(0.3)
  const preferences = ref("")

  function saveToLocalStorage() {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
    localStorage.setItem('userGoals', JSON.stringify(userGoals.value))
    localStorage.setItem('userPersonalData', JSON.stringify(userPersonalData.value))
    localStorage.setItem('llm', JSON.stringify({ llmModel: llmModel.value, temperature: temperature.value }))
    localStorage.setItem('preferences', preferences.value)
    console.log('Saved to local storage')
  }

  function loadFromLocalStorage() {
    userPreferences.value = JSON.parse(localStorage.getItem('userPreferences')) || {}
    userGoals.value = JSON.parse(localStorage.getItem('userGoals')) || []
    userPersonalData.value = JSON.parse(localStorage.getItem('userPersonalData')) || {}
    temperature.value = JSON.parse(localStorage.getItem('llm')).temperature || 0.3
    llmModel.value = JSON.parse(localStorage.getItem('llm')).llmModel || "gpt-3.5-turbo"
    preferences.value = localStorage.getItem('preferences') || ""
  }

  function isInLocalStorage() {
    //return !!localStorage.getItem('userPreferences') && !!localStorage.getItem('userGoals') && !!localStorage.getItem('userPersonalData') && !!localStorage.getItem('llm') && !!localStorage.getItem('preferences')
    return !!localStorage.getItem('userPersonalData')
  }

  function getUserContext() {
    console.log({
      username: userPersonalData.value.name,
      occupation: userPersonalData.value.occupation,
      language: userPersonalData.value.language,
      personalPreferences: preferences.value,
    })
    return JSON.stringify({
      username: userPersonalData.value.name,
      occupation: userPersonalData.value.occupation,
      language: userPersonalData.value.language,
      "persönliche Wünsche des Benutzers": preferences.value,
    })
  }

  async function loadAll({ email }) {
    if (isInLocalStorage()) {
      logger.log('Loading from local storage')
      loadFromLocalStorage()
      return
    }
    logger.log('Loading from API')
    await loadPreferences({ email })
    await loadGoals({ email })
    await loadPersonalData({ email })
    saveToLocalStorage()
  }

  async function loadPreferences({ email }) {
    await axios.get(`${apiURL}/preferences`, { params: { email } })
      .then(response => {
        logger.log(response)
        preferences.value = response.data
        saveToLocalStorage()
      })
      .catch(error => logger.error(error))
  }

  async function setPreferences({ newPreferences, email }) {
    console.log('newPreferences:', newPreferences)
    console.log('email:', email)
    preferences.value = newPreferences
    await axios.post(`${apiURL}/preferences`, { summary: newPreferences, email })
      .then(response => logger.log(response))
      .catch(error => logger.error(error))
      .finally(saveToLocalStorage())
  }

  async function loadGoals({ email }) {
    await axios.get(`${apiURL}/goals`, { params: { email } })
      .then(response => {
        logger.log(response)
        userGoals.value = response.data
      })
      .catch(error => logger.error(error))
      .finally(saveToLocalStorage())
  }
  async function setGoal({ email, topic, description, focus = "", subgoals }) {
    userGoals.value.push({ email, topic, description, focus, subgoals })
    await axios.post(`${apiURL}/goals`, { email, topic, focus, description, subgoals })
      .then(response => logger.log(response))
      .catch(error => logger.error(error))
      .finally(saveToLocalStorage())
  }
  async function loadPersonalData({ email }) {
    await axios.get(`${apiURL}/users`, { params: { email } })
      .then(response => {
        logger.log(response)
        userPersonalData.value = response.data
      })
      .catch(error => logger.error(error))
      .finally(saveToLocalStorage())
  }
  async function setPersonalData({ email, name, age, motivation, occupation, sex, language }) {
    userPersonalData.value = { email, name, age, motivation, occupation, sex, language }
    await axios.post(`${apiURL}/users`, { email, name, age, motivation, occupation, sex, language })
      .then(response => {
        logger.log(response)
        saveToLocalStorage()
      })
      .catch(error => logger.error(error))
  }

  return { userGoals, userPersonalData, llmModel, temperature, preferences, loadPreferences, setPreferences, loadGoals, setGoal, loadPersonalData, setPersonalData, loadAll, getUserContext }
})