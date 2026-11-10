import { api } from '../../../../core/api/axios.instance';
import type {
    AssetDto,
    PaginatedAssetsResponse,
    AssetFilters,
    CreateAssetPayload,
    UpdateAssetPayload,
    CopyAssetPayload,
} from '../../domain/dto/assets.dto';

export interface UploadProgressData {
    loaded: number;
    total: number;
    percentage: number;
    speed: number; // bytes per second
}

export type UploadProgressCallback = (progress: UploadProgressData) => void;

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

const createProgressHandler = (fileSize: number, onProgress?: UploadProgressCallback) => {
    let lastTime = performance.now();
    let lastLoaded = 0;
    let smoothedSpeed = 0;

    return (progressEvent: any) => {
        if (!onProgress) return;

        const loaded = progressEvent.loaded || 0;
        const total = progressEvent.total || fileSize || 1;
        const percentage = Math.min(100, Math.round((loaded * 100) / total));

        const now = performance.now();
        const timeDiff = (now - lastTime) / 1000;

        let currentSpeed = 0;
        if (progressEvent.rate && progressEvent.rate > 0) {
            currentSpeed = progressEvent.rate;
        } else if (timeDiff >= 0.2) {
            const bytesDiff = loaded - lastLoaded;
            currentSpeed = bytesDiff / timeDiff;
            lastTime = now;
            lastLoaded = loaded;
        }

        if (currentSpeed > 0) {
            smoothedSpeed = smoothedSpeed === 0 ? currentSpeed : smoothedSpeed * 0.7 + currentSpeed * 0.3;
        }

        onProgress({
            loaded,
            total,
            percentage,
            speed: smoothedSpeed,
        });
    };
};

export const getAssetsPaginated = async (
    filters: AssetFilters = {}
): Promise<PaginatedAssetsResponse> => {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const params: Record<string, any> = { page, limit };

    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.folderId !== undefined) {
        params.folderId = filters.folderId === null ? 'null' : filters.folderId;
    }
    if (filters.type) params.type = filters.type;
    if (filters.sku) params.sku = filters.sku;
    if (filters.q) params.q = filters.q;

    const response = await api.get<ApiResponse<AssetDto[]>>('/assets', { params });
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getAssetById = async (id: string): Promise<AssetDto> => {
    const response = await api.get<ApiResponse<AssetDto>>(`/assets/${id}`);
    return response.data.data;
};

export const createAsset = async (
    payload: CreateAssetPayload,
    onProgress?: UploadProgressCallback,
    signal?: AbortSignal
): Promise<AssetDto> => {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.sku) formData.append('sku', payload.sku);
    formData.append('brandId', payload.brandId);
    if (payload.folderId) {
        formData.append('folderId', payload.folderId);
    } else {
        formData.append('folderId', 'null');
    }
    formData.append('file', payload.file);

    const response = await api.post<ApiResponse<AssetDto>>('/assets', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for uploads
        signal,
        onUploadProgress: createProgressHandler(payload.file.size, onProgress),
    });
    return response.data.data;
};

export const updateAsset = async (
    id: string,
    payload: UpdateAssetPayload,
    onProgress?: UploadProgressCallback,
    signal?: AbortSignal
): Promise<AssetDto> => {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.description !== undefined) {
        formData.append('description', payload.description || '');
    }
    if (payload.sku !== undefined) {
        formData.append('sku', payload.sku || '');
    }
    if (payload.brandId !== undefined) formData.append('brandId', payload.brandId);
    if (payload.folderId !== undefined) {
        formData.append('folderId', payload.folderId === null ? 'null' : payload.folderId);
    }
    if (payload.file) {
        formData.append('file', payload.file);
    }

    const response = await api.patch<ApiResponse<AssetDto>>(`/assets/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for uploads
        signal,
        onUploadProgress: payload.file
            ? createProgressHandler(payload.file.size, onProgress)
            : undefined,
    });
    return response.data.data;
};

export const copyAsset = async (
    id: string,
    payload: CopyAssetPayload
): Promise<AssetDto> => {
    const response = await api.post<ApiResponse<AssetDto>>(`/assets/${id}/copy`, payload);
    return response.data.data;
};

export const deleteAsset = async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
};

