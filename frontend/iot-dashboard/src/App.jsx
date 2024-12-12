import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig'; // Este archivo parece relacionado con gráficos, no lo tocaremos por ahora

// Importar las funciones de la API
import { getSensorData, controlActuator } from './utils/api'; // Asegúrate de que la ruta sea correcta

// Importar las páginas
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();
  const [sensorData, setSensorData] = useState(null);

  // Llamada a la API para obtener los datos del sensor
  useEffect(() => {
    const fetchData = async () => {
      const data = await getSensorData();
      setSensorData(data);
    };

    fetchData();

    // Configura la actualización de los datos cada 5 segundos
    const interval = setInterval(fetchData, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []); // Se ejecuta solo una vez cuando el componente se monta

  // Manejar el control de los actuadores
  const handleActuatorControl = async (device, action) => {
    const response = await controlActuator(device, action);
    console.log(response);
    if (response) {
      alert(`${device} ha sido ${action}`);
    } else {
      alert('Error al controlar el actuador');
    }
  };

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Dashboard sensorData={sensorData} />} />
      </Routes>

      {/* Aquí eliminamos el bloque de datos del sensor, ya que ahora lo gestionamos dentro del Dashboard */}
      {/* Si lo quieres fuera del Dashboard, puedes añadirlo aquí directamente */}
      <div className="actuator-controls">
        <h2>Control de Actuadores</h2>
        <button onClick={() => handleActuatorControl('LED', 'encender')}>Encender LED</button>
        <button onClick={() => handleActuatorControl('LED', 'apagar')}>Apagar LED</button>
        <button onClick={() => handleActuatorControl('Ventilacion', 'encender')}>Encender Ventilación</button>
        <button onClick={() => handleActuatorControl('Ventilacion', 'apagar')}>Apagar Ventilación</button>
        {/* Agregar más botones para otros actuadores si es necesario */}
      </div>
    </>
  );
}

export default App;
