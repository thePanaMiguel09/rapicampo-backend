import { PaymentType } from "../../domain/enums/payment-type-enum";

export interface CreateServiceDTO {
    requesterUserId: string;
    serviceDescription: string;
    originAddress: string;
    destinationAddress: string;
    payment: PaymentType;
    offeredValue: string;
    exchangeDetail?: string;
}

export interface UpdateServiceDTO {
    serviceDescription?: string;
    originAddress?: string;
    destinationAddress?: string;
    payment?: PaymentType;
    offeredValue?: string;
    exchangeDetail?: string;
}