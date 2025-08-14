import mongoose from 'mongoose';

// MongoDB local: 'mongodb://127.0.0.1:27017/planificador-tareas'
// para MongoDB Atlas: 'mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre_de_tu_base_de_datos?retryWrites=true&w=majority'
const MONGO_URI = 'mongodb://127.0.0.1:27017/planificador-tareas'; 

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Sale del proceso con un error
  }
};

export default connectDB;