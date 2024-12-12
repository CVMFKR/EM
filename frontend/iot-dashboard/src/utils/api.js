import axios from 'axios';

const BASE_URL = "http://192.168.1.10:5001"; // Cambia esta URL si tu backend está en otro lugar

// Función para obtener los datos del sensor
const getSensorData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sensor-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Función para controlar un actuador
const controlActuator = async (device, action) => {
  try {
    const response = await axios.post(`${BASE_URL}/control/${device}/${action}`);
    return response.data;
  } catch (error) {
    console.error("Error controlling actuator:", error);
    return null;
  }
};

// Función para obtener todos los actuadores
const getActuators = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/actuators`);
    return response.data;
  } catch (error) {
    console.error('Error fetching actuators:', error);
    return null;
  }
};

// Función para controlar el estado general del sistema
const controlSystem = async (action) => {
  try {
    const response = await axios.post(`${BASE_URL}/system-control/${action}`);
    return response.data;
  } catch (error) {
    console.error('Error controlling system:', error);
    return null;
  }
};

export { getSensorData, controlActuator, getActuators, controlSystem };

