import { IServiceRepository } from "../../domain/ports/IServiceRepository";
import { Service } from "../../domain/entities/Service";
import connection from "../database/connection";
import { ServiceState } from "../../domain/enums/service-state-enum";
import { PaymentType } from "../../domain/enums/payment-type-enum";

export class ServiceRepository implements IServiceRepository {
    async accepetService(serviceId: string, acceptingUserId: string): Promise<void> {
        try {
            const query = `
            UPDATE solicitudes.servicios
            SET estado_servicio = $1,
                id_usuario_aceptante = $2,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE pk_id_servicio = $3
        `;

            await connection.query(query, [ServiceState.EN_PROCESO, acceptingUserId, serviceId]);
        } catch (error) {
            console.error(error);
            throw new Error('Error accepting service');
        }
    }

    private mapRowToService(row: any): Service {
        return new Service(
            row.id_usuario_solicitante,
            row.descripcion_servicio,
            row.direccion_origen,
            row.direccion_destino,
            row.estado_servicio as ServiceState,
            row.tipo_pago as PaymentType,
            row.valor_ofrecido,
            row.detalles_trueque ?? null,
            row.fecha_actualizacion ?? null,
            row.fecha_publicacion ?? null,
            row.pk_id_servicio,
        );
    }

    async createService(service: Omit<Service, "id">): Promise<Service> {

        try {
            const query = `
                INSERT INTO solicitudes.servicios(
                    id_usuario_solicitante, 
                    descripcion_servicio,
                    direccion_origen,
                    direccion_destino,
                    estado_servicio,
                    tipo_pago,
                    valor_ofrecido,
                    detalles_trueque
                ) VALUES(
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                ) 
                RETURNING *
            `

            const values = [service.requesterUserId,
            service.serviceDescription,
            service.originAddress,
            service.destinationAddress,
            service.serviceState,
            service.payment,
            service.offeredValue,
            service.exchangeDetail];

            const { rows } = await connection.query(query, values);
            return this.mapRowToService(rows[0]);
        } catch (error) {
            console.error(error);
            throw Error('Error posting service');
        }
    }

    async findServiceById(id: string): Promise<Service | null> {
        try {
            const query = `
            SELECT
            id_usuario_solicitante, 
            descripcion_servicio,
            direccion_origen,
            direccion_destino,
            estado_servicio,
            tipo_pago,
            valor_ofrecido,
            detalles_trueque,
            fecha_publicacion,
            fecha_actualizacion
            FROM solicitudes.servicios
            WHERE pk_id_servicio = $1
        `

            const values = [id];

            const { rows, rowCount } = await connection.query(query, values);

            if (rowCount === 0) {
                return null;
            }

            return this.mapRowToService(rows[0]);


        } catch (error) {
            console.error(error);
            throw Error('Error fething service');
        }
    }

    async findAllServices(): Promise<Service[]> {
        try {
            const query = `
            SELECT
            pk_id_servicio,
            id_usuario_solicitante, 
            descripcion_servicio,
            direccion_origen,
            direccion_destino,
            estado_servicio,
            tipo_pago,
            valor_ofrecido,
            detalles_trueque,
            fecha_publicacion,
            fecha_actualizacion
            FROM solicitudes.servicios
            ORDER BY fecha_publicacion DESC
        `;

            const { rows } = await connection.query(query);
            return rows.map((row) => this.mapRowToService(row));

        } catch (error) {
            console.error(error);
            throw Error('Error fething services.')
        }
    }

    async updateService(id: string, data: Partial<Omit<Service, "id" | "id_usuario_solicitante">>): Promise<Service> {
        try {

            const fields: string[] = [];
            const values: any[] = [];
            let index = 1;

            const mapping: { [key: string]: string } = {
                serviceDescription: 'descripcion_servicio',
                originAddress: 'direccion_origen',
                destinationAddress: 'direccion_destino',
                serviceState: 'estado_servicio',
                paymentMethod: 'tipo_pago',
                offeredValue: 'valor_ofrecido',
                exchangeDetail: 'detalles_trueque'
            };

            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined && mapping[key]) {
                    fields.push(`${mapping[key]} = $${index}`);
                    values.push(value);
                    index++;
                }
            }

            if (fields.length === 0) throw new Error("No hay campos para actualizar");

            values.push(id);

            const query = `
            UPDATE solicitudes.servicios 
            SET ${fields.join(', ')} 
            WHERE pk_id_servicio = $${index} 
            RETURNING *
        `;

            const { rows } = await connection.query(query, values);
            return this.mapRowToService(rows[0]);
        } catch (error) {
            console.error(error)
            throw new Error('Error updating service.');
        }
    }

}