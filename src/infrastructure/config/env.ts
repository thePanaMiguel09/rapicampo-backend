import dotenv from 'dotenv'

dotenv.config();

export const config = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    PG_HOST: process.env.POSTGRES_HOST || 'postgres',
    PG_PORT: parseInt(process.env.POSTGRES_PORT || '5432'),
    PG_DB: process.env.POSTGRES_DB || 'rappicampo',
    PG_USER: process.env.POSTGRES_USER || 'rappicampo_user',
    PG_PASSWORD: process.env.POSTGRES_PASSWORD || 'Mi1137674074',
    JWT_SECRET: process.env.JWT_SECRET || '0ccc0a8ab3292d35cebfff0afe3fdb951210a296d663c17a127aa3e8bf63f8fd',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d'
}