import myConnection from 'express-myconnection';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Cargar .env.test cuando NODE_ENV=test, sino .env (producción)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const dbOptions = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME 
};

const dbConnection = (app) => {
	app.use(myConnection(mysql, dbOptions, 'single', (err) => {
		if (err) {
			console.error('Error al conectar a la base de datos:', err);
			process.exit(1);
		} else {
			console.log(`Conexion a la base de datos "${process.env.DB_NAME}" exitosa (${envFile})`)
		}
	}));
};
export default dbConnection;