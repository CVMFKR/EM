import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2"; // Para gráficos
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null });
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actuadores, setActuadores] = useState({
    led: false,
    iluminacion_sala_control: false,
    intraccion_aire: false,
    extractor: false,
    ventilacion: false,
    bomba: false,
  });

  const BACKEND_URL = "http://192.168.1.10:5001"; // Cambiar a la URL correcta

  // Obtener datos del sensor
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/sensor-data`);
      setSensorData(response.data);

      // Actualizar datos históricos
      setHistoricalData((prevData) => [
        ...prevData.slice(-23), // Mantener solo los últimos 24 datos (24 horas)
        { temperature: response.data.temperature, humidity: response.data.humidity, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      console.error("Error al obtener datos del sensor:", error);
    }
    setLoading(false);
  };

  // Actualizar datos periódicamente
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 60000); // Cada 60 segundos
    return () => clearInterval(interval);
  }, []);

  // Datos para el gráfico
  const chartData = {
    labels: historicalData.map((data) => data.timestamp),
    datasets: [
      {
        label: "Temperatura (°C)",
        data: historicalData.map((data) => data.temperature),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
      },
      {
        label: "Humedad (%)",
        data: historicalData.map((data) => data.humidity),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Evolución de Temperatura y Humedad en las Últimas 24 Horas",
      },
    },
    maintainAspectRatio: false,
  };

  // Controlar actuadores
  const toggleActuador = (actuador) => {
    setActuadores((prevActuadores) => {
      const newState = !prevActuadores[actuador];
      axios
        .post(`${BACKEND_URL}/control/${actuador}/${newState ? "on" : "off"}`)
        .then(() => {
          setActuadores((prev) => ({ ...prev, [actuador]: newState }));
        })
        .catch((error) => console.error("Error controlando actuador:", error));
      return { ...prevActuadores, [actuador]: newState };
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: `url('https://drive.google.com/uc?id=17zXl3It9srbcGhoC3J_HKidjf4PlbS6P')` }}>
      {/* Encabezado */}
      <header style={{ display: "flex", alignItems: "center", padding: "10px", backgroundColor: "#25431e" }}>
        <img src="https://drive.google.com/uc?id=12orz3Ls3ejvXgYT5IdjJxiFekc51BgFk" alt="Logo Inacap" style={{ height: "50px", marginRight: "10px" }} />
        <h1 style={{ margin: 0, fontWeight: "bold", fontSize: "2rem", color: "white" }}>Aerogrow - Proyecto de Título v1.0.0</h1>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col items-center p-6">
        {/* Gráfico de temperatura y humedad */}
        <div style={{ width: "500px", height: "300px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Datos del Sensor */}
        <div className="mb-6 text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Datos en Tiempo Real</h2>
          {loading ? (
            <p className="text-gray-500">Cargando datos...</p>
          ) : (
            <div className="text-lg">
              <p>🌡️ Temperatura: {sensorData.temperature} °C</p>
              <p>💧 Humedad: {sensorData.humidity} %</p>
            </div>
          )}
        </div>

        {/* Botones de control */}
        <div className="flex flex-wrap gap-4 mb-6">
          {Object.keys(actuadores).map((actuador) => (
            <button
              key={actuador}
              onClick={() => toggleActuador(actuador)}
              style={{
                width: "150px",
                height: "40px",
                backgroundColor: actuadores[actuador] ? "green" : "red",
                color: "white",
                fontWeight: "bold",
                borderRadius: "20px",
                textAlign: "center",
              }}
              className="transition-all"
            >
              {actuador.replace(/_/g, " ").toUpperCase()} {actuadores[actuador] ? "ON" : "OFF"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
