import logging
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
import board
import adafruit_dht
import time
import RPi.GPIO as GPIO
from datetime import datetime

# Configuración del logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("iot_logs.log", mode="a")
    ]
)

logging.info("Backend iniciado correctamente.")

# Inicialización de Flask y configuración de CORS
app = Flask(__name__)
CORS(app)

# Configuración del modo de simulación (True = simulación, False = control real con GPIO)
modo_simulacion = True

# Configuración de GPIO
GPIO.setmode(GPIO.BCM)

# Pines de los actuadores
RELAY_LED = 17
RELAY_SALA_CONTROL = 27
INTRACTOR = 22
EXTRACTOR = 23
VENTILACION = 24
BOMBA_AGUA = 25
MOTOR_BASE_GIRATORIA = 5
HUMIDIFICADOR = 6

# Configuración de pines como salida (solo si no es simulación)
if not modo_simulacion:
    actuadores = [RELAY_LED, RELAY_SALA_CONTROL, INTRACTOR, EXTRACTOR, VENTILACION, BOMBA_AGUA, MOTOR_BASE_GIRATORIA, HUMIDIFICADOR]
    for actuador in actuadores:
        GPIO.setup(actuador, GPIO.OUT)

# Inicializar sensor DHT11
dht_device = adafruit_dht.DHT11(board.D4)

# Parámetros de control (pueden ser actualizados dinámicamente)
parametros_control = {
    'temp_min': 22,
    'temp_max': 28,
    'hum_min': 40,
    'hum_max': 60
}

# Inicialización de la base de datos
def inicializar_base_datos():
    conn = sqlite3.connect('estacion_meteorologica.db')
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datos_historicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            temperatura REAL NOT NULL,
            humedad REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    logging.info("Base de datos inicializada correctamente.")

# Función para insertar datos en la base de datos
def insertar_datos(temperature, humidity):
    try:
        conn = sqlite3.connect('estacion_meteorologica.db')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO datos_historicos (fecha, temperatura, humedad)
            VALUES (datetime('now'), ?, ?)
        """, (temperature, humidity))
        conn.commit()
        conn.close()
        logging.info("Datos insertados correctamente en la base de datos.")
    except sqlite3.Error as e:
        logging.error(f"Error al insertar en la base de datos: {e}")

# Función para controlar actuadores
def controlar_actuador(actuador, accion):
    devices = {
        'led': RELAY_LED,
        'sala_control': RELAY_SALA_CONTROL,
        'intractor': INTRACTOR,
        'extractor': EXTRACTOR,
        'ventilacion': VENTILACION,
        'bomba': BOMBA_AGUA,
        'motor_base_giratoria': MOTOR_BASE_GIRATORIA,
        'humidificador': HUMIDIFICADOR
    }

    if actuador not in devices:
        logging.warning(f"Actuador {actuador} no encontrado.")
        return

    if modo_simulacion:
        logging.info(f"Simulación: {actuador} {'encendido' if accion == 'on' else 'apagado'}.")
    else:
        pin = devices[actuador]
        GPIO.output(pin, GPIO.HIGH if accion == 'on' else GPIO.LOW)
        logging.info(f"{actuador} {'encendido' if accion == 'on' else 'apagado'}.")

# Función para obtener datos históricos
def obtener_datos_historicos(dias=30):
    conn = sqlite3.connect('estacion_meteorologica.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT fecha, temperatura, humedad
        FROM datos_historicos
        WHERE fecha >= datetime('now', ?)
    ''', (f'-{dias} days',))
    datos = cursor.fetchall()
    conn.close()
    return datos

# Rutas de la API
@app.route('/')
def home():
    return "Bienvenido a la Estación Meteorológica"

@app.route('/sensor-data')
def get_sensor_data():
    logging.info("Intentando leer datos del sensor DHT11...")
    max_retries = 5
    for attempt in range(max_retries):
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            if temperature is not None and humidity is not None:
                logging.info(f"Datos obtenidos: Temperatura={temperature}°C, Humedad={humidity}%")
                insertar_datos(temperature, humidity)
                return jsonify({'temperature': temperature, 'humidity': humidity}), 200
            else:
                logging.warning(f"Lectura inválida en intento {attempt + 1}.")
        except Exception as e:
            logging.error(f"Error leyendo del sensor: {e}")
        time.sleep(1)
    return jsonify({'error': 'No se pudieron obtener lecturas válidas del sensor'}), 500

@app.route('/historico', methods=['GET'])
def historico():
    periodo = request.args.get('periodo', default=30, type=int)
    if periodo not in [1, 7, 30]:
        return jsonify({'error': 'Periodo no válido. Usa 1, 7 o 30.'}), 400
    datos = obtener_datos_historicos(periodo)
    return jsonify([
        {'fecha': fecha, 'temperatura': temperatura, 'humedad': humedad}
        for fecha, temperatura, humedad in datos
    ])

@app.route('/control/<device>/<action>', methods=['POST'])
def control_device(device, action):
    try:
        controlar_actuador(device, action)
        return jsonify({'status': f'{device} {action}'}), 200
    except Exception as e:
        logging.error(f"Error controlando {device}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/parametros_control', methods=['POST'])
def actualizar_parametros_control():
    try:
        parametros = request.json
        global parametros_control
        parametros_control.update(parametros)
        logging.info(f"Parámetros actualizados: {parametros_control}")
        return jsonify({'status': 'Parámetros actualizados', 'parametros': parametros_control}), 200
    except Exception as e:
        logging.error(f"Error actualizando parámetros: {e}")
        return jsonify({'error': str(e)}), 500

# Inicialización
if __name__ == '__main__':
    inicializar_base_datos()
    try:
        app.run(host='0.0.0.0', port=5001)
    finally:
        if not modo_simulacion:
            GPIO.cleanup()
