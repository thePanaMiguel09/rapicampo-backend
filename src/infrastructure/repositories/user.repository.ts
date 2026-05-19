import { Service } from '../../domain/entities/Service';
import { PaymentType } from '../../domain/enums/payment-type-enum';
import { ServiceState } from '../../domain/enums/service-state-enum';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { AppError } from '../../domain/errors';
import connection from '../database/connection';

// ============================================================================
// MAPEADOR
// ============================================================================

function mapRowToService(row: Record<string, unknown>): Service {
    return new Service(
        row.id_usuario_solicitante as string,
        row.descripcion_servicio as string,
        row.direccion_origen as string,
        row.direccion_destino as string,
        row.estado_servicio as ServiceState,
        row.tipo_pago as PaymentType,
        row.valor_ofrecido as string,
        (row.detalles_trueque as string | null) ?? null,
        (row.fecha_actualizacion as Date | null) ?? null,
        (row.fecha_publicacion as Date | null) ?? null,
        row.pk_id_servicio as string,
    );
}

// ============================================================================
// USER REPOSITORY
// ============================================================================

export class UserRepository implements IUserRepository {

    // ── SERVICIOS PUBLICADOS POR EL USUARIO (como solicitante) ───────────────
    // Filtra por id externo del auth service. Si serviceState es undefined,
    // devuelve todos los estados activos.

    async getUserServices(
        userId: string,
        serviceState?: ServiceState
    ): Promise<Service[]> {
        const baseQuery = `
            SELECT
                pk_id_servicio,
                id_usuario_solicitante,
                id_usuario_aceptante,
                descripcion_servicio,
                direccion_origen,
                direccion_destino,
                estado_servicio,
                tipo_pago,
                valor_ofrecido,
                valor_numerico,
                moneda,
                detalles_trueque,
                fecha_publicacion,
                fecha_actualizacion
            FROM solicitudes.v_servicios_activos
            WHERE id_usuario_solicitante = $1
        `;

        const query = serviceState
            ? `${baseQuery} AND estado_servicio = $2 ORDER BY fecha_publicacion DESC`
            : `${baseQuery} ORDER BY fecha_publicacion DESC`;

        const values = serviceState ? [userId, serviceState] : [userId];

        try {
            const { rows } = await connection.query(query, values);
            return rows.map(mapRowToService);
        } catch (error) {
            console.error('[UserRepository.getUserServices]', error);
            throw new AppError('Error al obtener los servicios del usuario', 500);
        }
    }

    // ── SERVICIOS ACEPTADOS POR EL USUARIO (como realizador) ─────────────────
    // JOIN entre aceptacion_servicios y servicios para el historial del realizador.

    async getUserAcceptedServices(
        userId: string,
        serviceState?: ServiceState
    ): Promise<Service[]> {
        const query = `
            SELECT
                s.pk_id_servicio,
                s.id_usuario_solicitante,
                s.id_usuario_aceptante,
                s.descripcion_servicio,
                s.direccion_origen,
                s.direccion_destino,
                s.estado_servicio,
                s.tipo_pago,
                s.valor_ofrecido,
                s.valor_numerico,
                s.moneda,
                s.detalles_trueque,
                s.fecha_publicacion,
                s.fecha_actualizacion
            FROM solicitudes.v_servicios_activos s
            INNER JOIN solicitudes.aceptacion_servicios a
                ON s.pk_id_servicio = a.fk_id_servicio
               AND a.id_usuario_realizador = $1
               AND a.estado_aceptacion = 'ACEPTADO'
            ${serviceState ? 'WHERE s.estado_servicio = $2' : ''}
            ORDER BY a.fecha_aceptacion DESC
        `;

        const values = serviceState ? [userId, serviceState] : [userId];

        try {
            const { rows } = await connection.query(query, values);
            return rows.map(mapRowToService);
        } catch (error) {
            console.error('[UserRepository.getUserAcceptedServices]', error);
            throw new AppError('Error al obtener los servicios aceptados', 500);
        }
    }

    // ── HISTORIAL COMPLETO DEL USUARIO ────────────────────────────────────────
    // Devuelve servicios publicados + aceptados, sin duplicados, ordenados por fecha.

    async getUserServiceHistory(userId: string): Promise<Service[]> {
        const query = `
            SELECT DISTINCT ON (s.pk_id_servicio)
                s.pk_id_servicio,
                s.id_usuario_solicitante,
                s.id_usuario_aceptante,
                s.descripcion_servicio,
                s.direccion_origen,
                s.direccion_destino,
                s.estado_servicio,
                s.tipo_pago,
                s.valor_ofrecido,
                s.valor_numerico,
                s.moneda,
                s.detalles_trueque,
                s.fecha_publicacion,
                s.fecha_actualizacion
            FROM solicitudes.servicios s  -- incluye soft-deleted para historial completo
            LEFT JOIN solicitudes.aceptacion_servicios a
                ON s.pk_id_servicio = a.fk_id_servicio
               AND a.id_usuario_realizador = $1
            WHERE
                s.id_usuario_solicitante = $1
                OR a.id_usuario_realizador = $1
            ORDER BY s.pk_id_servicio, s.fecha_publicacion DESC
        `;

        try {
            const { rows } = await connection.query(query, [userId]);
            return rows.map(mapRowToService);
        } catch (error) {
            console.error('[UserRepository.getUserServiceHistory]', error);
            throw new AppError('Error al obtener el historial del usuario', 500);
        }
    }

    // ── ESTADÍSTICAS DEL USUARIO ──────────────────────────────────────────────
    // Agregación eficiente: conteos por estado sin cargar entidades completas.

    async getUserStats(userId: string): Promise<{
        publicados: number;
        enProceso: number;
        completados: number;
        cancelados: number;
        aceptadosPorOtros: number;
    }> {
        const query = `
            SELECT
                COUNT(*) FILTER (WHERE estado_servicio = 'PUBLICADO')   AS publicados,
                COUNT(*) FILTER (WHERE estado_servicio = 'EN_PROCESO')  AS en_proceso,
                COUNT(*) FILTER (WHERE estado_servicio = 'COMPLETADO')  AS completados,
                COUNT(*) FILTER (WHERE estado_servicio = 'CANCELADO')   AS cancelados
            FROM solicitudes.servicios
            WHERE id_usuario_solicitante = $1
              AND eliminado_en IS NULL
        `;

        const aceptadosQuery = `
            SELECT COUNT(*) AS aceptados_por_otros
            FROM solicitudes.aceptacion_servicios
            WHERE id_usuario_realizador = $1
              AND estado_aceptacion = 'ACEPTADO'
        `;

        try {
            const [statsResult, aceptadosResult] = await Promise.all([
                connection.query(query, [userId]),
                connection.query(aceptadosQuery, [userId]),
            ]);

            const stats = statsResult.rows[0];
            const aceptados = aceptadosResult.rows[0];

            return {
                publicados:         parseInt(stats.publicados, 10),
                enProceso:          parseInt(stats.en_proceso, 10),
                completados:        parseInt(stats.completados, 10),
                cancelados:         parseInt(stats.cancelados, 10),
                aceptadosPorOtros:  parseInt(aceptados.aceptados_por_otros, 10),
            };
        } catch (error) {
            console.error('[UserRepository.getUserStats]', error);
            throw new AppError('Error al obtener estadísticas del usuario', 500);
        }
    }
}