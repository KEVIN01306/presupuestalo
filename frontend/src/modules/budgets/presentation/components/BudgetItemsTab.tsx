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
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { BudgetItem } from '../../domain/interfaces/budget.interface';
import type { BudgetItemFormValues } from '../../domain/schemas/budget.schema';
import { BudgetItemFormDialog } from './BudgetItemFormDialog';

interface BudgetItemsTabProps {
    items: BudgetItem[];
    totalIncome: number;
    totalProjected: number;
    members: TeamMemberDetail[];
    canEdit: boolean;
    onSave: (values: BudgetItemFormValues, itemId?: string) => Promise<void>;
    onDelete: (itemId: string) => Promise<void>;
}

export const BudgetItemsTab: React.FC<BudgetItemsTabProps> = ({
    items,
    totalIncome,
    totalProjected,
    members,
    canEdit,
    onSave,
    onDelete,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<BudgetItem | null>(null);
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const availableCeiling = totalIncome - totalProjected;

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500 }}>
                            Rubros proyectados
                        </Typography>
                        <Typography variant="caption" sx={{ color: availableCeiling < 0 ? '#d93025' : '#5f6368' }}>
                            Techo disponible para proyectar: <strong>{formatCurrency(availableCeiling, symbol)}</strong>
                        </Typography>
                    </Box>
                    {canEdit && (
                        <Button
                            variant="contained"
                            startIcon={<AddOutlined />}
                            onClick={() => { setEditing(null); setDialogOpen(true); }}
                            sx={{ borderRadius: '200px', textTransform: 'none', px: 2.5 }}
                        >
                            Agregar rubro
                        </Button>
                    )}
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Rubro</TableCell>
                                <TableCell align="right">Proyectado</TableCell>
                                <TableCell align="right">Gastado</TableCell>
                                <TableCell align="right">Disponible</TableCell>
                                <TableCell>División</TableCell>
                                {canEdit && <TableCell align="right">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 3, color: '#5f6368' }}>
                                        No hay rubros proyectados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell sx={{ fontWeight: 500, color: '#202124' }}>{item.name}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.projectedAmount, symbol)}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.totalSpent, symbol)}</TableCell>
                                        <TableCell align="right" sx={{ color: '#188038', fontWeight: 500 }}>
                                            {formatCurrency(item.remainingAmount, symbol)}
                                        </TableCell>
                                        <TableCell>
                                            {item.hasUserSplit ? (
                                                <Chip size="small" label={`${item.allocations.length} miembros`} sx={{ fontSize: '11px' }} />
                                            ) : (
                                                <Typography variant="caption" sx={{ color: '#5f6368' }}>General</Typography>
                                            )}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => { setEditing(item); setDialogOpen(true); }}>
                                                    <EditOutlined fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
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

                <BudgetItemFormDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialItem={editing}
                    members={members}
                    onSubmitValues={onSave}
                />
            </CardContent>
        </Card>
    );
};
