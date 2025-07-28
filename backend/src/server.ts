import express, { Application, Request, Response } from 'express'; // Importa Express para crear el servidor
import mongoose from 'mongoose'; // Importa Mongoose para interactuar con MongoDB
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno (como la contraseña de la base de datos)
import cors from 'cors'; // Importa cors para permitir que el frontend se comunique con el backend
import taskRoutes from './routes/taskRoutes';

// 1. Cargar variables de entorno
dotenv.config();

// 2. Inicializar la aplicación Express
// Creando una instancia de nuestra aplicación web.
const app: Application = express();

// Definimos el puerto donde el servidor va a "escuchar".
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 3. Middlewares
// funciones que procesan las peticiones antes de que lleguen al código principal.

// Le dice a Express que cuando reciba una petición con datos en formato JSON la convierta a un objeto JavaScript para que se pueda usar fácilmente.
app.use(express.json());

//frontend (React) y backend (Express) corren en "orígenes" (direcciones y puertos) diferentes.
// CORS le dice al navegador: "Está bien, deja que este frontend hable con mi backend".
app.use(cors());

// Rutas API, Para que express use las rutas que se definiran en taskRoutes, para que el servidor sepa como repsonder cada peticion
app.use('/api/tareas', taskRoutes);

// 4. Conexión a MongoDB
// Estableciendo la conexión entre tu servidor (backend) y tu base de datos (MongoDB).
const mongoUri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/planificadorTareasDB';
// mongodb://localhost:27017/planificadorTareasDB es la dirección local y el nombre de la base de datos.

//Intento conexion a la base de datos usando la dirección proporcionada.
mongoose.connect(mongoUri)
    .then(() => {
        console.log('¡Conectado a MongoDB!'); 
    })
    .catch((error: Error) => {
        console.error('Error al conectar a MongoDB:', error.message); 
        process.exit(1); // Si no se conecta a la BD, la aplicación se cierra, porque no puede funcionar sin ella.
    });


// 5. Ruta de prueba (Endpoint)
// Creando una URL específica a la que el servidor responderá. Para probar que el servidor está escuchando peticiones y funciona.
//app.get('/', (req: Request, res: Response) => {
    //res.send('¡Servidor del Planificador de Tareas funcionando!'); 
//});

// 6. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en http://localhost:${PORT}`); // Mensaje en la terminal
});