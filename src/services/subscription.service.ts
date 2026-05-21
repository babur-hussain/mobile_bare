import api from './api';

export interface VerifyReceiptPayload {
    productId: string;
    purchaseToken: string;
}

export interface SubscriptionStatus {
    plan: string;
    expiryDate: string | null;
    productId: string | null;
}

export interface VerifyReceiptResult {
    status: string;
    plan: string;
    expiryDate: string | null;
}

const subscriptionService = {
    /**
     * Send a purchase token to the backend for verification and plan activation.
     */
    async verifyReceipt(payload: VerifyReceiptPayload): Promise<VerifyReceiptResult> {
        const res = await api.post<VerifyReceiptResult>('/api/v1/subscription/verify', payload);
        return res.data;
    },

    /**
     * Fetch the current subscription status from the backend.
     */
    async getStatus(): Promise<SubscriptionStatus> {
        const res = await api.get<SubscriptionStatus>('/api/v1/subscription/status');
        return res.data;
    },
};

export default subscriptionService;
