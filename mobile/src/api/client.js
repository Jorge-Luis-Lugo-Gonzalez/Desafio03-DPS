import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Cambia esta IP por la de tu PC cuando pruebes en dispositivo físico
// Emulador Android: http://10.0.2.2:3000
// Dispositivo físico: http://TU_IP_LOCAL:3000  (ver con ipconfig)
const API_URL = 'http://10.0.2.2:3000';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;