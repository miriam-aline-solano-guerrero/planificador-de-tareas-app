import express, { Application, Request, Response } from 'express'; // Importa Express para crear el servidor
import mongoose from 'mongoose'; // Importa Mongoose para interactuar con MongoDB
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno (como la contraseña de la base de datos)
import cors from 'cors'; // ¡Quitamos el '* as' ! // Importa cors para permitir que tu frontend se comunique con el backend

// 1. Cargar variables de entorno
// ¿Qué estamos haciendo? Cargando información "secreta" o de configuración.
// ¿Por qué lo hacemos? Para mantener la configuración (como las contraseñas de bases de datos o puertos)
// fuera de nuestro código directamente. Esto es más seguro y fácil de cambiar.
dotenv.config();

// 2. Inicializar la aplicación Express
// Creando una instancia de nuestra aplicación web.
// ¿Por qué lo hacemos? Express es un "esqueleto" que nos permite construir APIs de forma sencilla.
const app: Application = express();
// Definimos el puerto donde el servidor va a "escuchar".
// process.env.PORT busca una variable de entorno llamada PORT. Si no la encuentra (lo más común en desarrollo),
// usa '5000' como valor predeterminado. parseInt lo convierte a número.
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 3. Middlewares (Software intermedio)
// ¿Qué estamos haciendo? Añadiendo funciones que procesan las peticiones antes de que lleguen a tu código principal.
// ¿Por qué lo hacemos? Simplifican tareas comunes como leer datos enviados o controlar quién puede hablar con tu servidor.

// app.use(express.json());
// ¿Qué hace? Le dice a Express que cuando reciba una petición con datos en formato JSON (muy común para APIs),
// la convierta automáticamente a un objeto JavaScript para que puedas usarla fácilmente.
app.use(express.json());

// app.use(cors());
// ¿Qué hace? Habilita el "Cross-Origin Resource Sharing".
// ¿Por qué lo hacemos? Tu frontend (React) y tu backend (Express) correrán en "orígenes" (direcciones y puertos) diferentes.
// Por ejemplo, el frontend podría estar en http://localhost:3000 y el backend en http://localhost:5000.
// Los navegadores, por seguridad, bloquean la comunicación entre orígenes diferentes por defecto.
// CORS le dice al navegador: "Está bien, deja que este frontend hable con mi backend".
// El error que te salía antes (`import * as cors from 'cors';`) era solo una forma que TypeScript necesitaba para
// entender cómo importar esta librería de JavaScript correctamente.
app.use(cors());

// 4. Conexión a MongoDB
// ¿Qué estamos haciendo? Estableciendo la conexión entre tu servidor (backend) y tu base de datos (MongoDB).
// ¿Por qué lo hacemos? Para que tu aplicación pueda guardar, leer, actualizar y borrar datos.
const mongoUri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/planificadorTareasDB';
// mongodb://localhost:27017/planificadorTareasDB es la dirección local y el nombre de tu base de datos.
// 'planificadorTareasDB' es el nombre que Mongoose le dará a tu base de datos si no existe.

// mongoose.connect(mongoUri)
// ¿Qué hace? Intenta conectarse a la base de datos usando la dirección proporcionada.
// .then(() => { ... }) se ejecuta si la conexión es exitosa.
// .catch((error: Error) => { ... }) se ejecuta si hay un error en la conexión.
mongoose.connect(mongoUri)
    .then(() => {
        console.log('¡Conectado a MongoDB!'); // Mensaje de éxito en la terminal
    })
    .catch((error: Error) => {
        console.error('Error al conectar a MongoDB:', error.message); // Mensaje de error
        process.exit(1); // Si no se conecta a la BD, la aplicación se cierra, porque no puede funcionar sin ella.
    });

// 5. Ruta de prueba (Endpoint)
// ¿Qué estamos haciendo? Creando una URL específica que tu servidor responderá.
// ¿Por qué lo hacemos? Para probar que el servidor está escuchando peticiones y funciona.
// app.get('/', ...) significa que cuando alguien haga una petición GET a la dirección principal (http://localhost:5000/),
// se ejecutará el código dentro de la función.
// (req: Request, res: Response) son los objetos de la petición (lo que llega) y la respuesta (lo que enviamos de vuelta).
app.get('/', (req: Request, res: Response) => {
    res.send('¡Servidor del Planificador de Tareas funcionando!'); // Enviamos un mensaje de texto como respuesta.
});

// 6. Iniciar el Servidor
// ¿Qué estamos haciendo? Poniendo tu servidor en "modo de escucha".
// ¿Por qué lo hacemos? Para que pueda recibir peticiones en el puerto que definimos.
// app.listen(PORT, ...) hace que el servidor empiece a escuchar en el puerto especificado.
// La función dentro del listen se ejecuta una vez que el servidor ha empezado a escuchar.
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en http://localhost:${PORT}`); // Mensaje en la terminal
});