import dotenv from 'dotenv';
import { Pool } from "pg";

dotenv.config();

class DatabasePool {
    private static instace: Pool;

    private constructor() { };

    public static getInstace(): Pool {
        if (!DatabasePool.instace) {
            DatabasePool.instace = new Pool({
                user: process.env.pg_user,
                host: process.env.pg_host,
                database: process.env.pg_db,
                password: process.env.pg_password,
                port: parseInt(process.env.pg_port!)
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

