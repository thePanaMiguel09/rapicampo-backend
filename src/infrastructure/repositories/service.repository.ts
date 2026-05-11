import { IServiceRepository } from "../../domain/ports/IServiceRepository";
import { Service } from "../../domain/entities/Service";
import connection from "../database/connection";
import { ServiceState } from "../../domain/enums/service-state-enum";
import { PaymentType } from "../../domain/enums/payment-type-enum";

export class ServiceRepository implements IServiceRepository {

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
            row.updated_at ?? null,
            row.posted_at ?? null,
            row.id,
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

    findServiceById(id: string): Promise<Service | null> {
        throw new Error("Method not implemented.");
    }

    findAllServices(): Promise<Service[]> {
        throw new Error("Method not implemented.");
    }

}