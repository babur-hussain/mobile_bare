import api from './api';

export interface BetaRequestData {
    instagramUrl?: string;
    facebookUrl?: string;
    threadsUrl?: string;
}

export interface BetaStatusResponse {
    status: 'none' | 'pending' | 'approved';
    threadsUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
}

class BetaService {
    async submitBetaRequest(data: BetaRequestData) {
        const response = await api.post('/api/v1/beta-requests', data);
        return response.data;
    }

    async checkBetaStatus(): Promise<BetaStatusResponse> {
        const response = await api.get('/api/v1/beta-requests/status');
        // Backend wraps response as { success, data: { status }, timestamp }
        return response.data?.data || response.data;
    }
}

export const betaService = new BetaService();
