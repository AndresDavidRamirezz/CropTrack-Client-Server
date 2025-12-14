import myConnection from 'express-myconnection';
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const dbOptions = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME 
};

// Debug de configuración
console.log('\n========================================');
console.log('📊 CONFIGURACIÓN DE BASE DE DATOS');
console.log('========================================');
console.log(`Host: ${dbOptions.host}`);
console.log(`Puerto: ${dbOptions.port}`);
console.log(`Usuario: ${dbOptions.user}`);
console.log(`Base de datos: ${dbOptions.database}`);
console.log(`Password: ${dbOptions.password ? '****** (configurado)' : '(vacío)'}`);
console.log('========================================\n');

const dbConnection = (app) => {
	app.use(myConnection(mysql, dbOptions, 'single', (err) => {
		if (err) {
			console.error('\n========================================');
			console.error('❌ ERROR DE CONEXIÓN A BASE DE DATOS');
			console.error('========================================');
			console.error(`Código: ${err.code || 'N/A'}`);
			console.error(`Mensaje: ${err.message}`);
			console.error(`Host: ${dbOptions.host}:${dbOptions.port}`);
			console.error(`Database: ${dbOptions.database}`);
			console.error('========================================\n');
			process.exit(1);
		} else {
			console.log('========================================');
			console.log('✅ CONEXIÓN A LA BASE DE DATOS EXITOSA');
			console.log('========================================\n');
		}
	}));
};

export default dbConnection;