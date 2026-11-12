import React, { useState } from 'react';
import { Alert, Avatar, Box, CircularProgress, Snackbar, Stack, Typography } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import ListTable, { type Action, type Column } from '../../../../shared/components/tables/ListTable';
import { formatDateTime } from '../../../../core/utils/formatDate';
import type { AuditAction, AuditLogItem } from '../../domain/audit.entity';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditFiltersBar } from '../components/AuditFiltersBar';
import { AuditLogDetailDialog } from '../components/AuditLogDetailDialog';
import { AuditActionChip, getResourceIcon } from '../components/auditUiHelpers';

export const AuditLogsListPage: React.FC = () => {
    const a = useAuditLogs();
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

    const columns: Column[] = [
        {
            id: 'createdAt',
            name: 'Fecha y Hora',
            format: (val: string) => (
                <Typography variant="body2">{formatDateTime(val, 'es-ES')}</Typography>
            ),
        },
        {
            id: 'action',
            name: 'Acción',
            format: (val: AuditAction) => <AuditActionChip action={val} />,
        },
        {
            id: 'resource',
            name: 'Recurso',
            format: (val: string, row: AuditLogItem) => (
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    {getResourceIcon(val)}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {val}
                        </Typography>
                        {row.resourceId && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                {row.resourceId.slice(0, 12)}...
                            </Typography>
                        )}
                    </Box>
                </Stack>
            ),
        },
        {
            id: 'user',
            name: 'Usuario',
            format: (_val: unknown, row: AuditLogItem) =>
                row.user ? (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                        <Avatar src={row.user.avatarUrl ?? undefined} sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {`${row.user.firstName?.[0] ?? ''}${row.user.lastName?.[0] ?? ''}`}
                        </Avatar>
                        <Box>
                            <Typography variant="body2">{`${row.user.firstName} ${row.user.lastName}`}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {row.user.email}
                            </Typography>
                        </Box>
                    </Stack>
                ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Sistema
                    </Typography>
                ),
        },
    ];

    const actions: Action[] = [
        {
            name: 'Ver detalles',
            icon: <VisibilityOutlined fontSize="small" />,
            onClick: (row: AuditLogItem) => setSelectedLog(row),
        },
    ];

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageHeader
                title="Registro de Auditoría"
                subtitle="Historial de accesos y operaciones registradas en tu cuenta"
            />
            <AuditFiltersBar
                searchInput={a.searchInput}
                actionFilter={a.actionFilter}
                resourceFilter={a.resourceFilter}
                dateFrom={a.dateFrom}
                dateTo={a.dateTo}
                onSearchInputChange={a.setSearchInput}
                onSearchSubmit={a.handleSearchSubmit}
                onActionChange={a.setActionFilter}
                onResourceChange={a.setResourceFilter}
                onDateFromChange={a.setDateFrom}
                onDateToChange={a.setDateTo}
                onClear={a.handleClearFilters}
                onRefresh={a.fetchLogs}
            />
            {a.loading && a.logs.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <ListTable
                    data={a.logs}
                    columns={columns}
                    actions={actions}
                    emptyMessage="No se encontraron registros de auditoría"
                    pagination={{
                        total: a.total,
                        limit: a.limit,
                        offset: a.page * a.limit,
                        onPageChange: a.setPage,
                        onRowsPerPageChange: (newLimit) => {
                            a.setLimit(newLimit);
                            a.setPage(0);
                        },
                    }}
                />
            )}
            <AuditLogDetailDialog
                open={Boolean(selectedLog)}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
            <Snackbar open={Boolean(a.error)} autoHideDuration={4000} onClose={a.clearError}>
                {a.error ? <Alert severity="error">{a.error}</Alert> : undefined}
            </Snackbar>
        </Box>
    );
};

export default AuditLogsListPage;
