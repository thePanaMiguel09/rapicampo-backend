import dotenv from 'dotenv';
import { Pool } from "pg";

dotenv.config();

class DatabasePool {
    private static instace: Pool;

    private constructor() { };
    public static getInstace(): Pool {
        if (!DatabasePool.instace) {
            DatabasePool.instace = new Pool({
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: parseInt(process.env.DB_PORT!)
            })
        }

        return DatabasePool.instace;
    }

    public static async verifyPostgresConnection(): Promise<void> {
        const poolConnection = this.getInstace();

        try {
            const poolClient = await poolConnection.connect();
            console.log('Conectado a PostgreSQL');
            poolClient.release();
        } catch (error) {
            console.error('Error al conectar a PostgreSQL');
        }
    }
}


DatabasePool.verifyPostgresConnection();

export default DatabasePool.getInstace();

