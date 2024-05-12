import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
    connected: false,
    events : []
})

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const socket = io(URL) 


socket.on('connect', () => {
    state.connected = true
})

socket.on('message' , (msg) => {
    console.log(msg)
})
socket.on('disconnect', () => {
    state.connected = false
})

socket.on("changeMessage", (msg) => {
    state.events.push(msg)
})