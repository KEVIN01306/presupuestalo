import { api } from '../../../../core/api/axios.instance';
import type {
    AuditLogItem,
    AuditFilters,
    PaginatedAuditLogsResponse,
} from '../../domain/audit.entity';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export const getAuditLogsPaginated = async (
    page: number = 1,
    limit: number = 10,
    filters?: AuditFilters
): Promise<PaginatedAuditLogsResponse> => {
    const params: Record<string, string | number> = { page, limit };

    if (filters) {
        if (filters.action) params.action = filters.action;
        if (filters.resource) params.resource = filters.resource;
        if (filters.userId) params.userId = filters.userId;
        if (filters.resourceId) params.resourceId = filters.resourceId;
        if (filters.q) params.q = filters.q;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
    }

    const response = await api.get<ApiResponse<AuditLogItem[]>>('/audit', { params });

    return {
        data: response.data.data,
        total: response.data.meta?.total ?? (response.data.data ? response.data.data.length : 0),
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getAuditLogById = async (id: string): Promise<AuditLogItem> => {
    const response = await api.get<ApiResponse<AuditLogItem>>(`/audit/${id}`);
    return response.data.data;
};
