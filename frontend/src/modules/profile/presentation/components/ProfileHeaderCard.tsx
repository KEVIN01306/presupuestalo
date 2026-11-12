import React from 'react';
import { Box, Typography, Paper, Avatar, Chip, Button, Stack } from '@mui/material';
import { EditOutlined, LockResetOutlined, VerifiedOutlined } from '@mui/icons-material';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';

interface ProfileHeaderCardProps {
    profile: AuthUser | null;
    onEditProfile: () => void;
    onChangePassword: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
    profile,
    onEditProfile,
    onChangePassword,
}) => {
    const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Usuario';
    const initials = profile
        ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
        : 'U';

    return (
        <Paper
            sx={{
                p: { xs: 3, sm: 4 },
                mb: 3,
                borderRadius: '24px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 3,
            }}
        >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 2.5 }}>
                <Avatar
                    src={profile?.avatarUrl || undefined}
                    sx={{ width: 64, height: 64, fontSize: '1.35rem', fontWeight: 500 }}
                >
                    {initials}
                </Avatar>
                <Box>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h3" sx={{ color: 'text.primary' }}>
                            {fullName}
                        </Typography>
                        {profile?.isVerify && (
                            <Chip
                                icon={<VerifiedOutlined sx={{ fontSize: 15 }} />}
                                label="Verificado"
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {profile?.email}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<EditOutlined />} onClick={onEditProfile}>
                    Editar perfil
                </Button>
                <Button variant="outlined" startIcon={<LockResetOutlined />} onClick={onChangePassword}>
                    Cambiar contraseña
                </Button>
            </Stack>
        </Paper>
    );
};
