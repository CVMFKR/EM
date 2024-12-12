import sqlite3

def crear_db():
    # Conexión a la base de datos (se crea si no existe)
    conn = sqlite3.connect('estacion_meteorologica.db')
    cursor = conn.cursor()
    
    # Crear la tabla para almacenar los datos históricos si no existe
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datos_historicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperatura REAL,
            humedad REAL
        )
    ''')
    conn.commit()
    conn.close()

# Ejecutar la creación de la base de datos al iniciar
crear_db()
