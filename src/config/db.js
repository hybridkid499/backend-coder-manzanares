import mongoose from 'mongoose';
import 'dotenv/config';

const { MONGODB_URI, DB_NAME } = process.env;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    });

    console.log('Conectado a MongoDB Atlas');
  } catch (err) {
    console.error(' Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
}