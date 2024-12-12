import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const Historico = ({ periodo }) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5001/historico/${periodo}`);
        setDatos(response.data);
      } catch (error) {
        console.error("Error al obtener datos históricos:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [periodo]);

  const obtenerLabels = () => {
    return datos.map((dato) => {
      const fecha = new Date(dato.fecha);
      return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
    });
  };

  const obtenerTemperaturas = () => {
    return datos.map((dato) => dato.temperatura);
  };

  const obtenerHumedades = () => {
    return datos.map((dato) => dato.humedad);
  };

  const data = {
    labels: obtenerLabels(),
    datasets: [
      {
        label: "Temperatura (°C)",
        data: obtenerTemperaturas(),
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Humedad (%)",
        data: obtenerHumedades(),
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Gráficos Históricos</h2>
      {loading ? (
        <p className="text-gray-500">Cargando datos del histórico...</p>
      ) : datos.length === 0 ? (
        <p className="text-gray-500">No hay datos disponibles.</p>
      ) : (
        <Line data={data} />
      )}
    </div>
  );
};

export default Historico;
