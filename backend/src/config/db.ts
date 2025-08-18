//biblioteca para interactuar con la BD
import mongoose from 'mongoose';

// URL de conexión se toma del archivo .env y si no toma la URL local
const MONGO_URI: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/planificador-tareas';

// Se define una función asíncrona para conectar a la base de datos.
// El tipo de retorno es 'void' porque la función no devuelve ningún valor.
export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;