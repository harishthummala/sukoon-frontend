import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Add token to every request automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const registerUser = (data) => 
  axios.post(`${BASE_URL}/api/users/register`, data);

export const loginUser = (data) => 
  axios.post(`${BASE_URL}/api/users/login`, data);

// CHAT
export const createChat = (userId) => 
  axios.post(`${BASE_URL}/api/chat/new/${userId}`, {});

export const deleteChat = (chatId) => 
  axios.delete(`${BASE_URL}/api/chat/delete/${chatId}`);

// MOOD
export const logMood = (chatId, data) => 
  axios.post(`${BASE_URL}/api/mood/${chatId}/logmood`, data);

export const viewMood = (chatId) => 
  axios.get(`${BASE_URL}/api/mood/${chatId}/viewmood`);

// MESSAGES
export const sendMessage = (chatId, data) => 
  axios.post(`${BASE_URL}/api/chat-message/${chatId}/addmessage`, data);

export const getChatHistory = (chatId) => 
  axios.get(`${BASE_URL}/api/chat-message/${chatId}/history`);

export const endChat = (chatId) => 
  axios.post(`${BASE_URL}/api/chat-message/${chatId}/end`);

  export const getUserChats = (userId) =>
  axios.get(`${BASE_URL}/api/chat/user/${userId}`);