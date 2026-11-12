import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatDate } from '../../../../core/utils/formatDate';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { IncomeCategory, TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { Income } from '../../domain/interfaces/budget.interface';
import type { IncomeFormValues } from '../../domain/schemas/budget.schema';
import { IncomeFormDialog } from './IncomeFormDialog';

interface BudgetIncomesTabProps {
    incomes: Income[];
    totalIncome: number;
    categories: IncomeCategory[];
    members: TeamMemberDetail[];
    defaultUserId: string;
    canEdit: boolean;
    onSave: (values: IncomeFormValues, incomeId?: string) => Promise<void>;
    onDelete: (incomeId: string) => Promise<void>;
}

export const BudgetIncomesTab: React.FC<BudgetIncomesTabProps> = ({
    incomes,
    totalIncome,
    categories,
    members,
    defaultUserId,
    canEdit,
    onSave,
    onDelete,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Income | null>(null);
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500 }}>
                            Ingresos del presupuesto
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#188038', fontWeight: 500 }}>
                            Total: {formatCurrency(totalIncome, symbol)}
                        </Typography>
                    </Box>
                    {canEdit && (
                        <Button
                            variant="contained"
                            startIcon={<AddOutlined />}
                            onClick={() => { setEditing(null); setDialogOpen(true); }}
                            sx={{ borderRadius: '200px', textTransform: 'none', px: 2.5 }}
                        >
                            Agregar ingreso
                        </Button>
                    )}
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Miembro</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="right">Monto</TableCell>
                                {canEdit && <TableCell align="right">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {incomes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 3, color: '#5f6368' }}>
                                        No hay ingresos registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                incomes.map((inc) => (
                                    <TableRow key={inc.id}>
                                        <TableCell>{formatDate(inc.date)}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                                <span>{inc.category?.name ?? '—'}</span>
                                                {inc.isCarryover && (
                                                    <Chip size="small" label="Carryover" sx={{ bgcolor: '#e6f4ea', color: '#188038', fontSize: '11px' }} />
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{inc.user ? `${inc.user.firstName} ${inc.user.lastName}` : '—'}</TableCell>
                                        <TableCell>{inc.description || '—'}</TableCell>
                                        <TableCell align="right" sx={{ color: '#188038', fontWeight: 500 }}>
                                            {formatCurrency(inc.amount, symbol)}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => { setEditing(inc); setDialogOpen(true); }}>
                                                    <EditOutlined fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => onDelete(inc.id)}>
                                                    <DeleteOutlined fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <IncomeFormDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialIncome={editing}
                    categories={categories}
                    members={members}
                    defaultUserId={defaultUserId}
                    onSubmitValues={onSave}
                />
            </CardContent>
        </Card>
    );
};
