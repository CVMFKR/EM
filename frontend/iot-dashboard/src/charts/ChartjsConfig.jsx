// Import Chart.js
import { Chart, Tooltip } from 'chart.js';
// Import Tailwind config
import { tailwindConfig } from '../utils/Utils';

// Recupera la configuración de Tailwind
const config = tailwindConfig();

// Asegúrate de que el tema esté definido antes de acceder a él
const colors = config.theme?.extend?.colors || {};

console.log(colors);

// Configuración de Chart.js
const ChartConfig = {
  backgroundColor: colors.violet?.[500] || '#000', // Fallback si el color no existe
};

// Registro de plugins de Chart.js
Chart.register(Tooltip);

// Define Chart.js default settings
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = 'nearest';
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 20;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 8;

// Función que genera un gradiente para gráficos de líneas
export const chartAreaGradient = (ctx, chartArea, colorStops) => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return 'transparent';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

// Colores para Chart.js basados en el tema de Tailwind
export const chartColors = {
  textColor: {
    light: config.theme?.colors?.gray[400] || '#D1D5DB',  // Fallback
    dark: config.theme?.colors?.gray[500] || '#6B7280',  // Fallback
  },
  gridColor: {
    light: config.theme?.colors?.gray[100] || '#F3F4F6',  // Fallback
    dark: `rgba(${hexToRGB(config.theme?.colors?.gray[700] || '#374151')}, 0.6)`,  // Fallback
  },
  backdropColor: {
    light: config.theme?.colors?.white || '#FFFFFF',
    dark: config.theme?.colors?.gray[800] || '#1F2937',  // Fallback
  },
  tooltipTitleColor: {
    light: config.theme?.colors?.gray[800] || '#1F2937',  // Fallback
    dark: config.theme?.colors?.gray[100] || '#F3F4F6',  // Fallback
  },
  tooltipBodyColor: {
    light: config.theme?.colors?.gray[500] || '#6B7280',  // Fallback
    dark: config.theme?.colors?.gray[400] || '#9CA3AF',  // Fallback
  },
  tooltipBgColor: {
    light: config.theme?.colors?.white || '#FFFFFF',
    dark: config.theme?.colors?.gray[700] || '#374151',  // Fallback
  },
  tooltipBorderColor: {
    light: config.theme?.colors?.gray[200] || '#E5E7EB',  // Fallback
    dark: config.theme?.colors?.gray[600] || '#4B5563',  // Fallback
  },
};

// Función auxiliar para convertir un color hex a RGB
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default ChartConfig;
