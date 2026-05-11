import { IServiceRepository } from "../../domain/ports/IServiceRepository";
import { Service } from "../../domain/entities/Service";
import connection from "../database/connection";

export class ServiceRepository implements IServiceRepository {

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
                    detalles_trueque,
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
            return rows[0];
        } catch (error) {
            console.error(error);
            throw Error('Error posting service');
        }
    }

    findServieById(id: string): Promise<Service | null> {
        throw new Error("Method not implemented.");
    }

    findAllServices(): Promise<Service[]> {
        throw new Error("Method not implemented.");
    }

}