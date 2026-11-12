import { useCallback, useEffect, useState } from 'react';
import type { AuditFilters, AuditLogItem } from '../../domain/audit.entity';
import { getAuditLogsPaginated } from '../../infrastructure/services/audit.service';

export const useAuditLogs = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [q, setQ] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const filters: AuditFilters = {};
            if (q) filters.q = q;
            if (actionFilter) filters.action = actionFilter;
            if (resourceFilter) filters.resource = resourceFilter;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const res = await getAuditLogsPaginated(page + 1, limit, filters);
            setLogs(res.data);
            setTotal(res.total);
        } catch {
            setError('Error al cargar los registros de auditoría');
        } finally {
            setLoading(false);
        }
    }, [page, limit, q, actionFilter, resourceFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setQ(searchInput);
    };

    const handleClearFilters = () => {
        setSearchInput('');
        setQ('');
        setActionFilter('');
        setResourceFilter('');
        setDateFrom('');
        setDateTo('');
        setPage(0);
    };

    return {
        logs,
        total,
        page,
        limit,
        loading,
        error,
        clearError: () => setError(null),
        setPage,
        setLimit,
        searchInput,
        setSearchInput,
        actionFilter,
        setActionFilter: (val: string) => {
            setPage(0);
            setActionFilter(val);
        },
        resourceFilter,
        setResourceFilter: (val: string) => {
            setPage(0);
            setResourceFilter(val);
        },
        dateFrom,
        setDateFrom: (val: string) => {
            setPage(0);
            setDateFrom(val);
        },
        dateTo,
        setDateTo: (val: string) => {
            setPage(0);
            setDateTo(val);
        },
        handleSearchSubmit,
        handleClearFilters,
        fetchLogs,
    };
};
