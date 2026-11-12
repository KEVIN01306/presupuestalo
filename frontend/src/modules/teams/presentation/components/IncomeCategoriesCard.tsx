import React from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { AddOutlined, CategoryOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import type { IncomeCategory, TeamRole } from '../../domain/interfaces/team.interface';

interface IncomeCategoriesCardProps {
    categories: IncomeCategory[];
    userRole: TeamRole;
    onCreate: () => void;
    onEdit: (category: IncomeCategory) => void;
    onDelete: (category: IncomeCategory) => void;
}

export const IncomeCategoriesCard: React.FC<IncomeCategoriesCardProps> = ({
    categories,
    userRole,
    onCreate,
    onEdit,
    onDelete,
}) => {
    const canManage = userRole === 'OWNER' || userRole === 'EDITOR';

    return (
        <Paper sx={{ borderRadius: '24px', border: '1px solid #dadce0', overflow: 'hidden' }}>
            <Box
                sx={{
                    p: 3,
                    borderBottom: '1px solid #dadce0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h6">Categorías de ingreso ({categories.length})</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Clasificación de ingresos disponible en los presupuestos de este equipo
                    </Typography>
                </Box>
                {canManage && (
                    <Button size="small" variant="outlined" startIcon={<AddOutlined />} onClick={onCreate}>
                        Nueva categoría
                    </Button>
                )}
            </Box>

            {categories.length === 0 ? (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No hay categorías de ingreso registradas.
                    </Typography>
                </Box>
            ) : (
                categories.map((cat, idx) => (
                    <Box
                        key={cat.id}
                        sx={{
                            px: 3,
                            py: 1.75,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: idx === categories.length - 1 ? 'none' : '1px solid #dadce0',
                        }}
                    >
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                            <CategoryOutlined fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {cat.name}
                            </Typography>
                            {cat.isSystem && <Chip label="Sistema" size="small" variant="outlined" />}
                        </Stack>

                        {canManage && !cat.isSystem && (
                            <Stack direction="row" sx={{ gap: 0.5 }}>
                                <Tooltip title="Editar categoría">
                                    <IconButton size="small" onClick={() => onEdit(cat)}>
                                        <EditOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar categoría">
                                    <IconButton size="small" color="error" onClick={() => onDelete(cat)}>
                                        <DeleteOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </Box>
                ))
            )}
        </Paper>
    );
};
