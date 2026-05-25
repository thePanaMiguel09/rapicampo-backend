import { IServiceRepository } from '../../domain/ports/IServiceRepository';
import { Service } from '../../domain/entities/Service';
import connection from '../database/connection';
import { ServiceState } from '../../domain/enums/service-state-enum';
import { PaymentType } from '../../domain/enums/payment-type-enum';
import { AppError } from '../../domain/errors';

// ============================================================================
// MAPEADORES
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
        (row.id_usuario_aceptante as string | null) ?? null,
    );
}

// ============================================================================
// SERVICE REPOSITORY
// ============================================================================

export class ServiceRepository implements IServiceRepository {

    // ── CREATE ──────────────────────────────────────────────────────────────

    async createService(service: Omit<Service, 'id'>): Promise<Service> {
        const query = `
            INSERT INTO solicitudes.servicios (
                id_usuario_solicitante,
                descripcion_servicio,
                direccion_origen,
                direccion_destino,
                estado_servicio,
                tipo_pago,
                valor_ofrecido,
                valor_numerico,
                detalles_trueque
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        // Extrae el valor numérico si el pago es DINERO
        const valorNumerico = service.payment === PaymentType.DINERO
            ? parseFloat(service.offeredValue.replace(/[^0-9.]/g, '')) || null
            : null;

        const values = [
            service.requesterUserId,
            service.serviceDescription,
            service.originAddress,
            service.destinationAddress,
            service.serviceState,
            service.payment,
            service.offeredValue,
            valorNumerico,
            service.exchangeDetail,
        ];

        try {
            const { rows } = await connection.query(query, values);
            return mapRowToService(rows[0]);
        } catch (error) {
            console.error('[ServiceRepository.createService]', error);
            throw new AppError('Error al crear el servicio', 500);
        }
    }

    // ── READ BY ID ───────────────────────────────────────────────────────────

    async findServiceById(id: string): Promise<Service | null> {
        const query = `
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
            FROM solicitudes.servicios
            WHERE pk_id_servicio = $1
              AND eliminado_en IS NULL
        `;

        try {
            const { rows, rowCount } = await connection.query(query, [id]);
            if (!rowCount || rowCount === 0) return null;
            return mapRowToService(rows[0]);
        } catch (error) {
            console.error('[ServiceRepository.findServiceById]', error);
            throw new AppError('Error al buscar el servicio', 500);
        }
    }

    // ── READ ALL ─────────────────────────────────────────────────────────────
    // Usa la vista v_servicios_activos que excluye soft-deletes.
    // Evita N+1: una sola query con LEFT JOIN a aceptaciones.

    async findAllServices(): Promise<Service[]> {
        const query = `
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
            ORDER BY fecha_publicacion DESC
        `;

        try {
            const { rows } = await connection.query(query);
            return rows.map(mapRowToService);
        } catch (error) {
            console.error('[ServiceRepository.findAllServices]', error);
            throw new AppError('Error al obtener los servicios', 500);
        }
    }

    // ── READ ALL BY STATE ─────────────────────────────────────────────────────

    async findServicesByState(state: ServiceState): Promise<Service[]> {
        const query = `
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
            WHERE estado_servicio = $1
            ORDER BY fecha_publicacion DESC
        `;

        try {
            const { rows } = await connection.query(query, [state]);
            return rows.map(mapRowToService);
        } catch (error) {
            console.error('[ServiceRepository.findServicesByState]', error);
            throw new AppError('Error al filtrar servicios por estado', 500);
        }
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    // Mapeo explícito: solo permite campos conocidos.
    // Evita inyección por keys arbitrarias del caller.

    async updateService(
        id: string,
        data: Partial<Omit<Service, 'id' | 'requesterUserId'>>
    ): Promise<Service> {
        // Mapeo ts-field → columna SQL. Solo campos editables.
        const columnMap: Record<string, string> = {
            serviceDescription: 'descripcion_servicio',
            originAddress:      'direccion_origen',
            destinationAddress: 'direccion_destino',
            serviceState:       'estado_servicio',
            payment:            'tipo_pago',
            offeredValue:       'valor_ofrecido',
            exchangeDetail:     'detalles_trueque',
        };

        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [tsKey, sqlCol] of Object.entries(columnMap)) {
            if (tsKey in data && (data as Record<string, unknown>)[tsKey] !== undefined) {
                fields.push(`${sqlCol} = $${paramIndex}`);
                values.push((data as Record<string, unknown>)[tsKey]);
                paramIndex++;
            }
        }

        // Si el pago cambia a DINERO y hay offeredValue, actualiza valor_numerico
        if (data.payment === PaymentType.DINERO && data.offeredValue !== undefined) {
            const numVal = parseFloat(data.offeredValue.replace(/[^0-9.]/g, ''));
            if (!isNaN(numVal)) {
                fields.push(`valor_numerico = $${paramIndex}`);
                values.push(numVal);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            throw new AppError('No hay campos para actualizar', 400);
        }

        values.push(id); // último param = WHERE

        const query = `
            UPDATE solicitudes.servicios
            SET ${fields.join(', ')}
            WHERE pk_id_servicio = $${paramIndex}
              AND eliminado_en IS NULL
            RETURNING *
        `;

        try {
            const { rows, rowCount } = await connection.query(query, values);
            if (!rowCount || rowCount === 0) {
                throw new AppError(`Servicio con ID ${id} no encontrado`, 404);
            }
            return mapRowToService(rows[0]);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('[ServiceRepository.updateService]', error);
            throw new AppError('Error al actualizar el servicio', 500);
        }
    }

    // ── ACCEPT SERVICE ───────────────────────────────────────────────────────
    // Opera en transacción:
    //   1. Actualiza estado del servicio a EN_PROCESO
    //   2. Registra la aceptación en aceptacion_servicios
    // Ambas en una sola transacción para garantizar consistencia.

    async acceptService(serviceId: string, acceptingUserId: string): Promise<void> {
        const client = await connection.connect();

        try {
            await client.query('BEGIN');

            // 1. Marcar el servicio como EN_PROCESO y registrar aceptante
            const updateServicio = `
                UPDATE solicitudes.servicios
                SET
                    estado_servicio      = $1,
                    id_usuario_aceptante = $2,
                    fecha_actualizacion  = NOW()
                WHERE pk_id_servicio = $3
                  AND eliminado_en IS NULL
                  AND estado_servicio = 'PUBLICADO'
                RETURNING pk_id_servicio
            `;
            const { rowCount } = await client.query(updateServicio, [
                ServiceState.EN_PROCESO,
                acceptingUserId,
                serviceId,
            ]);

            if (!rowCount || rowCount === 0) {
                throw new AppError(
                    'El servicio no está disponible para aceptar (ya fue tomado o no existe)',
                    409
                );
            }

            // 2. Registrar en historial de aceptaciones
            const insertAceptacion = `
                INSERT INTO solicitudes.aceptacion_servicios (
                    fk_id_servicio,
                    id_usuario_realizador,
                    estado_aceptacion
                ) VALUES ($1, $2, 'ACEPTADO')
            `;
            await client.query(insertAceptacion, [serviceId, acceptingUserId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof AppError) throw error;
            console.error('[ServiceRepository.acceptService]', error);
            throw new AppError('Error al aceptar el servicio', 500);
        } finally {
            client.release();
        }
    }

    // ── SOFT DELETE ──────────────────────────────────────────────────────────
    // Marca eliminado_en sin borrar el registro físicamente.
    // Solo el solicitante original puede eliminar su propio servicio (verificado en use case).

    async softDeleteService(serviceId: string, requestingUserId: string): Promise<void> {
        const query = `
            UPDATE solicitudes.servicios
            SET eliminado_en = NOW()
            WHERE pk_id_servicio          = $1
              AND id_usuario_solicitante  = $2
              AND eliminado_en IS NULL
              AND estado_servicio NOT IN ('EN_PROCESO', 'COMPLETADO')
            RETURNING pk_id_servicio
        `;

        try {
            const { rowCount } = await connection.query(query, [serviceId, requestingUserId]);
            if (!rowCount || rowCount === 0) {
                throw new AppError(
                    'Servicio no encontrado, ya fue eliminado, o no tienes permiso para eliminarlo',
                    404
                );
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('[ServiceRepository.softDeleteService]', error);
            throw new AppError('Error al eliminar el servicio', 500);
        }
    }

    // ── COMPLETE SERVICE ─────────────────────────────────────────────────────

    async completeService(serviceId: string): Promise<Service> {
        const query = `
            UPDATE solicitudes.servicios
            SET
                estado_servicio     = $1,
                fecha_actualizacion = NOW()
            WHERE pk_id_servicio = $2
              AND eliminado_en IS NULL
              AND estado_servicio = 'EN_PROCESO'
            RETURNING *
        `;

        try {
            const { rows, rowCount } = await connection.query(query, [ServiceState.COMPLETADO, serviceId]);
            if (!rowCount || rowCount === 0) {
                throw new AppError('El servicio no está en proceso o no existe', 409);
            }
            return mapRowToService(rows[0]);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('[ServiceRepository.completeService]', error);
            throw new AppError('Error al completar el servicio', 500);
        }
    }

    // ── CANCEL SERVICE ───────────────────────────────────────────────────────

    async cancelService(serviceId: string, requestingUserId: string): Promise<Service> {
        const client = await connection.connect();

        try {
            await client.query('BEGIN');

            // Cancelar el servicio
            const updateQuery = `
                UPDATE solicitudes.servicios
                SET
                    estado_servicio      = $1,
                    id_usuario_aceptante = NULL,
                    fecha_actualizacion  = NOW()
                WHERE pk_id_servicio         = $2
                  AND id_usuario_solicitante = $3
                  AND eliminado_en IS NULL
                  AND estado_servicio NOT IN ('COMPLETADO', 'CANCELADO')
                RETURNING *
            `;
            const { rows, rowCount } = await client.query(updateQuery, [
                ServiceState.CANCELADO,
                serviceId,
                requestingUserId,
            ]);

            if (!rowCount || rowCount === 0) {
                throw new AppError('Servicio no encontrado o no se puede cancelar', 409);
            }

            // Marcar aceptaciones previas como DESISTIDO
            await client.query(`
                UPDATE solicitudes.aceptacion_servicios
                SET
                    estado_aceptacion   = 'DESISTIDO',
                    fecha_actualizacion = NOW()
                WHERE fk_id_servicio     = $1
                  AND estado_aceptacion  = 'ACEPTADO'
            `, [serviceId]);

            await client.query('COMMIT');
            return mapRowToService(rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof AppError) throw error;
            console.error('[ServiceRepository.cancelService]', error);
            throw new AppError('Error al cancelar el servicio', 500);
        } finally {
            client.release();
        }
    }
}