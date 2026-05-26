import dotenv from 'dotenv';
import { Pool } from "pg";

dotenv.config();

class DatabasePool {
    private static instance: Pool;

    private constructor() { };
    public static getInstace(): Pool {
        if (!DatabasePool.instance) {
            DatabasePool.instance = new Pool({
                host: process.env.POSTGRES_HOST,
                port: parseInt(process.env.POSTGRES_PORT || "5432"),
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
                ssl: {
                    rejectUnauthorized: true
                }
            })
        }

        return DatabasePool.instance;
    }

    public static async verifyPostgresConnection(): Promise<void> {
        const poolConnection = this.getInstace();

        try {
            const poolClient = await poolConnection.connect();
            console.log('Conectado a PostgreSQL');
            poolClient.release();
        } catch (error) {
            console.error('Error al conectar a PostgreSQL', error);
        }
    }
}


DatabasePool.verifyPostgresConnection();

export default DatabasePool.getInstace();

