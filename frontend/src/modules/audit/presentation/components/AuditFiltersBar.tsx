import React from 'react';
import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { FilterAltOff, Refresh } from '@mui/icons-material';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';

interface AuditFiltersBarProps {
    searchInput: string;
    actionFilter: string;
    resourceFilter: string;
    dateFrom: string;
    dateTo: string;
    onSearchInputChange: (val: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onActionChange: (val: string) => void;
    onResourceChange: (val: string) => void;
    onDateFromChange: (val: string) => void;
    onDateToChange: (val: string) => void;
    onClear: () => void;
    onRefresh: () => void;
}

const RESOURCES = [
    { value: '', label: 'Todos los recursos' },
    { value: 'auth', label: 'Autenticación (auth)' },
    { value: 'user', label: 'Usuario (user)' },
    { value: 'team', label: 'Equipo (team)' },
    { value: 'income_category', label: 'Cat. Ingreso (income_category)' },
    { value: 'budget', label: 'Presupuesto (budget)' },
    { value: 'budget_item', label: 'Rubro (budget_item)' },
    { value: 'income', label: 'Ingreso (income)' },
    { value: 'expense', label: 'Gasto (expense)' },
];

export const AuditFiltersBar: React.FC<AuditFiltersBarProps> = ({
    searchInput,
    actionFilter,
    resourceFilter,
    dateFrom,
    dateTo,
    onSearchInputChange,
    onSearchSubmit,
    onActionChange,
    onResourceChange,
    onDateFromChange,
    onDateToChange,
    onClear,
    onRefresh,
}) => (
    <Paper sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid #dadce0' }}>
        <Stack sx={{ gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, alignItems: 'stretch' }}>
                <GoogleSearchBar
                    value={searchInput}
                    onChange={onSearchInputChange}
                    onSubmit={onSearchSubmit}
                    placeholder="Buscar por recurso, ID o detalles..."
                />
                <TextField
                    select
                    size="small"
                    label="Acción"
                    value={actionFilter}
                    onChange={(e) => onActionChange(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="LOGIN">LOGIN</MenuItem>
                    <MenuItem value="LOGOUT">LOGOUT</MenuItem>
                    <MenuItem value="CREATE">CREATE</MenuItem>
                    <MenuItem value="UPDATE">UPDATE</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Recurso"
                    value={resourceFilter}
                    onChange={(e) => onResourceChange(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    {RESOURCES.map((r) => (
                        <MenuItem key={r.value || 'all'} value={r.value}>
                            {r.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    type="date"
                    size="small"
                    label="Desde"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    type="date"
                    size="small"
                    label="Hasta"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <Button size="small" variant="outlined" startIcon={<FilterAltOff />} onClick={onClear}>
                    Limpiar filtros
                </Button>
                <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={onRefresh}>
                    Actualizar
                </Button>
            </Stack>
        </Stack>
    </Paper>
);
