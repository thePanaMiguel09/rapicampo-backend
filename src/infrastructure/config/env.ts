import dotenv from 'dotenv'

dotenv.config();

export const config = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    PG_HOST: process.env.POSTGRES_HOST || 'postgres_rapicampo',
    PG_PORT: parseInt(process.env.POSTGRES_PORT || '5432'),
    PG_DB: process.env.POSTGRES_DB || 'rappicampo',
    PG_USER: process.env.POSTGRES_USER || 'rappicampo_user',
    PG_PASSWORD: process.env.POSTGRES_PASSWORD || '',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'change-me-in-production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-in-production',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}