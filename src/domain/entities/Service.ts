import { PaymentType } from "../enums/payment-type-enum";
import { ServiceState } from "../enums/service-state-enum";

export class Service {
    constructor(
        public readonly requesterUserId: string,
        public serviceDescription: string,
        public originAddress: string,
        public destinationAddress: string,
        public serviceState: ServiceState,
        public payment: PaymentType,
        public offeredValue: string,
        public exchangeDetail: string | null,
        public updatedDate: Date | null,
        public postedDate?: Date | null,
        public readonly id?: string,
    ) { };

    public isCashPayment():boolean {
        return this.payment === PaymentType.DINERO;
    }

    public isExchangePayment(): boolean {
        return this.payment === PaymentType.TRUEQUE;
    }
}