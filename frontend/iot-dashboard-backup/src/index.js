import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Importa el archivo que contiene las directivas de Tailwind
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
