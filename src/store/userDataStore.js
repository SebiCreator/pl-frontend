import { defineStore } from 'pinia'

import { ref, computed } from 'vue'
import { Logger } from '../utils/Logger'
import axios from 'axios'

const logger = new Logger({ context: 'userDataStore', enabled: true })

const apiURL = 'http://localhost:3000'

export const useUserDataStore = defineStore('userDataStore', () => {
  const userPreferences = ref({})
  const userGoals = ref([])
  const userPersonalData = ref({})


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

  return { userPreferences, userGoals, userPersonalData, loadPreferences, setPreferences, loadGoals, setGoal, loadPersonalData, setPersonalData, loadAll }
})