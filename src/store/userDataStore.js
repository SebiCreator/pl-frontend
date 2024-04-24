import { defineStore } from 'pinia'

import { ref, computed } from 'vue'
import { Logger } from '../utils/Logger'
import axios from 'axios'

const logger = new Logger({ context: 'userDataStore', enabled: true })

const apiURL = 'https://api.example.com'

export const useDataStore = defineStore('counter', () => {
    const userPreferences = ref({})
    const userGoals = ref([])
    const userPersonalData = ref({})
    function loadPreferences () {
      axios.get(`${apiURL}/preferences`)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
    function setPreferences (newPreferences) {
      axios.post(`${apiURL}/preferences`, newPreferences)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
    function loadGoals () {
      axios.get(`${apiURL}/goals`)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
    function setGoal (goal) {
      axios.post(`${apiURL}/goals`, goal)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
    function loadPersonalData () {
      axios.get(`${apiURL}/personal_data`)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
    function setPersonalData (personalData) {
      axios.post(`${apiURL}/personal_data`, personalData)
        .then(response => logger.log(response))
        .catch(error => logger.error(error))
    }
  
    return {}
  })