import axios from 'axios';

const BASE_URL = "http://192.168.1.10:5001"; // Dirección de tu backend

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

// Función para actualizar parámetros de control
const updateControlParams = async (params) => {
  try {
    const response = await axios.post(`${BASE_URL}/parametros_control`, params);
    return response.data;
  } catch (error) {
    console.error("Error updating control parameters:", error);
    return null;
  }
};

export { getSensorData, controlActuator, updateControlParams };
