import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    keyframes,
} from '@mui/material';
import {
    Speed as SpeedIcon,
    Movie as MovieIcon,
    PictureAsPdf as PdfIcon,
    AudioFile as AudioIcon,
    FolderZip as ZipIcon,
    InsertDriveFile as FileIcon,
    CloudSync as CloudSyncIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const pulseEffect = keyframes`
  0% {
    transform: scale(0.98);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 14px rgba(25, 118, 210, 0);
  }
  100% {
    transform: scale(0.98);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export interface CircularUploadProgressProps {
    file: File | null;
    progress: number;
    speed: number; // bytes per second
    loadedBytes: number;
    totalBytes: number;
    isProcessing?: boolean;
    onCancel?: () => void;
}

export const formatSpeed = (bytesPerSec: number): string => {
    if (!bytesPerSec || bytesPerSec <= 0) return 'Calculating speed...';
    if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
    const kb = bytesPerSec / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB/s`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB/s`;
};

export const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CircularUploadProgress: React.FC<CircularUploadProgressProps> = ({
    file,
    progress,
    speed,
    loadedBytes,
    totalBytes,
    isProcessing = false,
    onCancel,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const renderFileCenter = () => {
        if (!file) {
            return <FileIcon sx={{ fontSize: 44, color: 'primary.main' }} />;
        }

        if (previewUrl) {
            return (
                <Box
                    component="img"
                    src={previewUrl}
                    alt={file.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                    }}
                />
            );
        }

        const type = file.type.toLowerCase();
        if (type.startsWith('video/')) {
            return <MovieIcon sx={{ fontSize: 44, color: '#0284c7' }} />;
        }
        if (type.includes('pdf')) {
            return <PdfIcon sx={{ fontSize: 44, color: '#ef4444' }} />;
        }
        if (type.startsWith('audio/')) {
            return <AudioIcon sx={{ fontSize: 44, color: '#8b5cf6' }} />;
        }
        if (type.includes('zip') || type.includes('compressed') || type.includes('tar') || type.includes('rar')) {
            return <ZipIcon sx={{ fontSize: 44, color: '#f59e0b' }} />;
        }

        return <FileIcon sx={{ fontSize: 44, color: 'primary.main' }} />;
    };

    const isFinished = progress >= 100;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
                px: 2,
                width: '100%',
            }}
        >
            {/* Circular Progress Gauge with Center Preview */}
            <Box
                sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                }}
            >
                {/* Background Track */}
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={150}
                    thickness={4}
                    sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                        position: 'absolute',
                    }}
                />

                {/* Animated Upload Progress Ring */}
                <CircularProgress
                    variant={isProcessing ? 'indeterminate' : 'determinate'}
                    value={isProcessing ? undefined : Math.max(0, Math.min(100, progress))}
                    size={150}
                    thickness={4.5}
                    sx={{
                        color: isFinished ? 'success.main' : 'primary.main',
                        position: 'absolute',
                        transition: 'stroke-dashoffset 0.35s ease',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        },
                    }}
                />

                {/* Center Circle with File Preview/Icon */}
                <Box
                    sx={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                        border: '2px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                        animation: `${pulseEffect} 2.5s infinite ease-in-out`,
                    }}
                >
                    {renderFileCenter()}

                    {/* Overlay badge when finished / processing in R2 */}
                    {isProcessing && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(2px)',
                            }}
                        >
                            <CloudSyncIcon
                                sx={{
                                    fontSize: 36,
                                    color: '#ffffff',
                                    animation: `${spinAnimation} 2s linear infinite`,
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Percentage Display */}
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: isFinished ? 'success.main' : 'text.primary',
                    lineHeight: 1.1,
                    mb: 1,
                }}
            >
                {Math.min(100, Math.round(progress))}%
            </Typography>

            {/* Speed Badge */}
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : '#eff6ff'),
                    border: '1px solid',
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : '#bfdbfe'),
                    color: 'primary.main',
                    px: 1.8,
                    py: 0.5,
                    borderRadius: '20px',
                    mb: 1.5,
                }}
            >
                <SpeedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px' }}>
                    {isFinished ? 'Upload completed' : formatSpeed(speed)}
                </Typography>
            </Box>

            {/* File Info & Uploaded / Total Bytes */}
            {file && (
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        maxWidth: 320,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {file.name}
                </Typography>
            )}

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.3, mb: 1.5 }}>
                {formatBytes(loadedBytes)} of {formatBytes(totalBytes || file?.size || 0)}
            </Typography>

            {/* Dynamic Status Text */}
            <Typography
                variant="caption"
                sx={{
                    fontWeight: 500,
                    color: isFinished ? 'success.main' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                {isProcessing ? (
                    <>
                        <CloudSyncIcon sx={{ fontSize: 16 }} />
                        Storing object safely in Cloudflare R2...
                    </>
                ) : isFinished ? (
                    <>
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                        File uploaded successfully!
                    </>
                ) : (
                    'Uploading file to server...'
                )}
            </Typography>

            {/* Cancel Button */}
            {onCancel && !isFinished && (
                <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={onCancel}
                    sx={{
                        mt: 2,
                        textTransform: 'none',
                        color: 'text.secondary',
                        fontSize: '13px',
                        borderRadius: '8px',
                        '&:hover': {
                            color: 'error.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    Cancel upload
                </Button>
            )}
        </Box>
    );
};

export default CircularUploadProgress;
