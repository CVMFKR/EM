import adafruit_dht
import board
import time

# Inicializar el sensor en el pin correspondiente
try:
    dht_sensor = adafruit_dht.DHT11(board.D17)
except Exception as e:
    print(f"Error inicializando el sensor: {e}")
    exit()

while True:
    try:
        temperatura = dht_sensor.temperature
        humedad = dht_sensor.humidity
        if temperatura is not None and humedad is not None:
            print(f"Temperatura: {temperatura}°C, Humedad: {humedad}%")
        else:
            print("Lectura inválida.")
    except RuntimeError as error:
        print(f"Error en lectura: {error}")
    except Exception as error:
        print(f"Error inesperado: {error}")
        dht_sensor.exit()
        break
    time.sleep(2)  # Esperar 2 segundos entre lecturas

