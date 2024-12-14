from flask import Flask, request, jsonify, render_template
from flask import Response
import cv2  # Librería para trabajar con la cámara
import RPi.GPIO as GPIO
import atexit
import adafruit_dht
import board
import time
import threading

app = Flask(__name__)
# Inicializar la cámara (asegúrate de que está conectada)
camera = cv2.VideoCapture(0)  # Usa '0' para la cámara predeterminada


# Configuración de GPIO para los actuadores
actuadores = {
    "led": 18,
    "luz_control": 23,
    "riego": 24,
    "ventilador": 25,
    "extractor": 12,
    "intractor": 16,
    "base_giratoria": 20,
}

# Configuración del sensor DHT11
DHT_SENSOR = adafruit_dht.DHT11(board.D17)  # Usamos GPIO17 para el sensor

# Rango de temperatura y humedad
TEMP_MIN = 23
TEMP_MAX = 28
HUMEDAD_MIN = 40
HUMEDAD_MAX = 60

GPIO.setmode(GPIO.BCM)
for pin in actuadores.values():
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.LOW)

# Limpieza de GPIO al salir
def limpiar_gpio():
    GPIO.cleanup()
    camera.release()

atexit.register(limpiar_gpio)

# Función para leer el sensor DHT11 con reintentos y manejo de errores
def leer_sensor():
    intentos = 5
    while intentos > 0:
        try:
            temperatura = DHT_SENSOR.temperature
            humedad = DHT_SENSOR.humidity
            if temperatura is not None and humedad is not None:
                return temperatura, humedad
        except RuntimeError as error:
            print(f"Error al leer el sensor: {error}")
        except Exception as e:
            print(f"Excepción inesperada: {e}")
        intentos -= 1
        time.sleep(2)
    return None, None

# Función para controlar los actuadores automáticamente según la temperatura y humedad
def controlar_actuadores_automaticos():
    temperatura, humedad = leer_sensor()
    if temperatura is not None and humedad is not None:
        print(f"Temperatura: {temperatura}°C, Humedad: {humedad}%")
        if temperatura > TEMP_MAX:
            GPIO.output(actuadores["ventilador"], GPIO.HIGH)
            GPIO.output(actuadores["extractor"], GPIO.HIGH)
        elif temperatura < TEMP_MIN:
            GPIO.output(actuadores["intractor"], GPIO.HIGH)
        else:
            GPIO.output(actuadores["ventilador"], GPIO.LOW)
            GPIO.output(actuadores["extractor"], GPIO.LOW)
            GPIO.output(actuadores["intractor"], GPIO.LOW)

        if humedad < HUMEDAD_MIN:
            GPIO.output(actuadores["riego"], GPIO.HIGH)
        elif humedad > HUMEDAD_MAX:
            GPIO.output(actuadores["riego"], GPIO.LOW)
    else:
        print("No se pudo leer el sensor correctamente.")

# Ruta para obtener datos del sensor
@app.route("/datos_sensor", methods=["GET"])
def obtener_datos_sensor():
    temperatura, humedad = leer_sensor()
    if temperatura is not None and humedad is not None:
        return jsonify({"temperatura": temperatura, "humedad": humedad})
    else:
        return jsonify({"error": "No se pudo leer el sensor"}), 500

# Ruta para la página principal
@app.route("/")
def index():
    try:
        temperatura, humedad = leer_sensor()
        return render_template(
            "index.html",
            actuadores=actuadores,
            temperatura=temperatura if temperatura else "N/A",
            humedad=humedad if humedad else "N/A",
        )
    except Exception as e:
        print(f"Error al cargar la plantilla: {e}")
        return "Error al cargar la página", 500

# Ruta para controlar actuadores manualmente
@app.route("/actuador", methods=["POST"])
def controlar_actuador():
    data = request.json
    dispositivo = data.get("dispositivo")
    estado = data.get("estado")
    if dispositivo not in actuadores:
        return jsonify({"error": "Dispositivo no válido"}), 400
    if estado not in ["on", "off"]:
        return jsonify({"error": "Estado no válido, use 'on' o 'off'"}), 400
    pin = actuadores[dispositivo]
    GPIO.output(pin, GPIO.HIGH if estado == "on" else GPIO.LOW)
    return jsonify({"estado": "success", "dispositivo": dispositivo, "estado_actual": estado})

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


# Control automático cada 10 segundos
def auto_control():
    while True:
        controlar_actuadores_automaticos()
        time.sleep(10)
        
def gen_frames():
    while True:
        success, frame = camera.read()  # Leer un frame de la cámara
        if not success:
            break
        else:
            # Codificar el frame en formato JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            # Transmitir el frame al cliente
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        

# Iniciar el control automático en un hilo separado
control_thread = threading.Thread(target=auto_control)
control_thread.daemon = True
control_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
