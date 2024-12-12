// src/utils/Utils.js

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfigFile from '../../tailwind.config.js';

// Resolver configuración de Tailwind para usar en JavaScript
export const tailwindConfig = () => resolveConfig(tailwindConfigFile);

// Convertir un color hexadecimal a RGB
export const hexToRGB = (h) => {
  let r = 0, g = 0, b = 0;
  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`;
    g = `0x${h[2]}${h[2]}`;
    b = `0x${h[3]}${h[3]}`;
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`;
    g = `0x${h[3]}${h[4]}`;
    b = `0x${h[5]}${h[6]}`;
  }
  return `${+r},${+g},${+b}`;
};

// Formatear valores numéricos como valores de moneda (USD)
export const formatValue = (value) => Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value);

// Formatear valores numéricos para miles
export const formatThousands = (value) => Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value);
