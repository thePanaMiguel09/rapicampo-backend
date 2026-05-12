import { Service } from "../../domain/entities/Service";
import { PaymentType } from "../../domain/enums/payment-type-enum";
import { ServiceState } from "../../domain/enums/service-state-enum";
import { IUserRepository } from "../../domain/ports/IUserRepository";
import connection from "../database/connection";



export class UserReposiroty implements IUserRepository {

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

    async getUserServices(id: string, serviceState: ServiceState): Promise<Service[]> {
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
                WHERE id_usuario_solicitante = $1 AND estado_servicio = $2 
                ORDER BY fecha_publicacion DESC
            `

            const values = [id, serviceState];

            const { rows } = await connection.query(query, values);

            return rows.map((row) => this.mapRowToService(row));

        } catch (error) {
            console.error(error);
            throw Error('Error fetching user services');
        }
    }

}