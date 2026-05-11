import dotenv from 'dotenv'

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    pg_host: process.env.POSTGRES_HOST || 'postgres',
    pg_port: parseInt(process.env.POSTGRES_PORT || '5432'),
    pg_db: process.env.POSTGRES_DB || 'rappicampo',
    pg_user: process.env.POSTGRES_USER || 'rappicampo_user',
    pg_password: process.env.POSTGRES_PASSWORD || 'Mi1137674074',
    jwt_secret: process.env.JWT_SECRET || '0ccc0a8ab3292d35cebfff0afe3fdb951210a296d663c17a127aa3e8bf63f8fd',
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '30d'
}