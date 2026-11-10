import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material';
import { Close, SwapHoriz } from '@mui/icons-material';
import FileInputZone from '../../../../shared/components/common/FileInputZone';
import CircularUploadProgress from '../../../../shared/components/common/CircularUploadProgress';
import { updateAsset, type UploadProgressData } from '../../infrastructure/services/assets.service';
import type { AssetDto } from '../../domain/dto/assets.dto';

interface AssetReplaceDialogProps {
    asset: AssetDto | null;
    open: boolean;
    onClose: () => void;
    onSuccess: (updatedAsset: AssetDto) => void;
}

export const AssetReplaceDialog: React.FC<AssetReplaceDialogProps> = ({
    asset,
    open,
    onClose,
    onSuccess,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [uploadProgress, setUploadProgress] = useState<UploadProgressData>({
        loaded: 0,
        total: 0,
        percentage: 0,
        speed: 0,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    if (!asset) return null;

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsSubmitting(false);
        setUploadProgress({ loaded: 0, total: 0, percentage: 0, speed: 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!file) {
            setErrorMessage('Please select a new file to replace the existing one.');
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSubmitting(true);
        setUploadProgress({
            loaded: 0,
            total: file.size,
            percentage: 0,
            speed: 0,
        });

        try {
            const updated = await updateAsset(
                asset.id,
                { file },
                (progress) => {
                    setUploadProgress(progress);
                },
                controller.signal
            );
            handleClose();
            onSuccess(updated);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }

            let msg = 'Failed to replace file in Cloudflare R2.';
            if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
                msg = 'Upload timed out. The file took too long to transfer. Please check your connection and try again.';
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.message === 'Network Error') {
                msg = 'Network error during upload. Please check your internet connection.';
            } else if (err.message) {
                msg = err.message;
            }

            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
            abortControllerRef.current = null;
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setFile(null);
        setErrorMessage(null);
        setUploadProgress({ loaded: 0, total: 0, percentage: 0, speed: 0 });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                    },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHoriz color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                        {isSubmitting ? 'Replacing Asset in R2' : 'Replace Asset File'}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={isSubmitting ? handleCancelUpload : handleClose}
                    disabled={isSubmitting && uploadProgress.percentage >= 100}
                >
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            {isSubmitting ? (
                <DialogContent sx={{ pt: 1, pb: 3 }}>
                    <CircularUploadProgress
                        file={file}
                        progress={uploadProgress.percentage}
                        speed={uploadProgress.speed}
                        loadedBytes={uploadProgress.loaded}
                        totalBytes={uploadProgress.total || file?.size || 0}
                        isProcessing={uploadProgress.percentage >= 100}
                        onCancel={handleCancelUpload}
                    />
                </DialogContent>
            ) : (
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={2}>
                            <Alert severity="info" sx={{ borderRadius: '10px', fontSize: '13px' }}>
                                Replacing the file will overwrite the object in Cloudflare R2 while preserving the exact
                                same public URL: <strong>{asset.url}</strong>
                            </Alert>

                            {errorMessage && (
                                <Alert severity="error" sx={{ borderRadius: '10px' }}>
                                    {errorMessage}
                                </Alert>
                            )}

                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Currently replacing file for asset: <strong>{asset.name}</strong> ({asset.fileName})
                            </Typography>

                            <FileInputZone
                                file={file}
                                onChange={setFile}
                                disabled={isSubmitting}
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                        <Button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !file}
                            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SwapHoriz />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                px: 3,
                            }}
                        >
                            Confirm Replacement
                        </Button>
                    </DialogActions>
                </form>
            )}
        </Dialog>
    );
};

export default AssetReplaceDialog;
