import dotenv from 'dotenv';
import { Pool } from "pg";

dotenv.config();

class DatabasePool {
    private static instace: Pool;

    private constructor() { };
    public static getInstace(): Pool {
        if (!DatabasePool.instace) {
            DatabasePool.instace = new Pool({
                host: process.env.POSTGRES_HOST,
                port: parseInt(process.env.POSTGRES_PORT || "5433"),
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
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
            console.error('Error al conectar a PostgreSQL', error);
        }
    }
}


DatabasePool.verifyPostgresConnection();

export default DatabasePool.getInstace();

