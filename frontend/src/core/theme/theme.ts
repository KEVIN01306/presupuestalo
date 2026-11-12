import { createTheme, type Shadows } from '@mui/material/styles';
import { palette, designTokens } from './palette';
import { typography } from './typography';

const {
    canvasWhite,
    cardSurface,
    featurePanelTint,
    charcoalInk,
    graphite,
    slate,
    mist,
    cloudShadow,
    googleBlue,
    googleBlueDeep,
    scrim,
} = designTokens;

const flatShadows = Array(25).fill('none') as Shadows;

/**
 * MUI Theme — Google for Education (frontend/DESIGN.md)
 * Zero heavy box-shadows; elevation via surface shifts and 1px solid #dadce0 borders.
 */
export const theme = createTheme({
    palette,
    typography,
    spacing: 8,
    shape: {
        borderRadius: 8,
    },
    shadows: flatShadows,

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                },
                html: {
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitFontSmoothing: 'antialiased',
                    textRendering: 'optimizeLegibility',
                    scrollBehavior: 'smooth',
                },
                body: {
                    backgroundColor: canvasWhite,
                    color: charcoalInk,
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${mist} ${canvasWhite}`,
                },
                '::-webkit-scrollbar': { width: '6px', height: '6px' },
                '::-webkit-scrollbar-track': { background: canvasWhite },
                '::-webkit-scrollbar-thumb': { background: mist, borderRadius: '3px' },
            },
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 200,
                    height: 40,
                    padding: '0 24px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: 'none',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                },
                contained: {
                    '&.MuiButton-containedPrimary': {
                        backgroundColor: googleBlue,
                        color: cardSurface,
                        '&:hover': {
                            backgroundColor: googleBlueDeep,
                            boxShadow: 'none',
                        },
                    },
                },
                outlined: {
                    borderColor: mist,
                    color: googleBlue,
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: canvasWhite,
                        borderColor: googleBlue,
                    },
                },
                text: {
                    color: googleBlue,
                    borderRadius: 200,
                    padding: '0 16px',
                    '&:hover': {
                        backgroundColor: featurePanelTint,
                    },
                },
                sizeSmall: {
                    height: 32,
                    padding: '0 16px',
                    fontSize: '0.8125rem',
                },
                sizeLarge: {
                    height: 44,
                    padding: '0 28px',
                    fontSize: '0.9375rem',
                },
            },
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        backgroundColor: cardSurface,
                        fontSize: '1rem',
                        color: charcoalInk,
                        '& fieldset': {
                            borderColor: mist,
                            borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: slate,
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 2px ${cloudShadow}55`,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: googleBlue,
                            borderWidth: '1.5px',
                        },
                        '&.Mui-error fieldset': {
                            borderColor: '#d93025',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: slate,
                        '&.Mui-focused': { color: googleBlue },
                        '&.Mui-error': { color: '#d93025' },
                    },
                },
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    backgroundColor: cardSurface,
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: mist,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: slate,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: googleBlue,
                        borderWidth: '1.5px',
                    },
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: cardSurface,
                    borderRadius: 24,
                    border: `1px solid ${mist}`,
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },

        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '32px',
                    '&:last-child': {
                        paddingBottom: '32px',
                    },
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: cardSurface,
                    backgroundImage: 'none',
                    boxShadow: 'none',
                },
            },
        },

        MuiDialog: {
            styleOverrides: {
                backdrop: {
                    backgroundColor: scrim,
                },
                paper: {
                    borderRadius: 8,
                    border: `1px solid ${mist}`,
                    boxShadow: 'none',
                    backgroundColor: cardSurface,
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: cardSurface,
                    boxShadow: 'none',
                    borderBottom: `1px solid ${mist}`,
                    color: charcoalInk,
                    backgroundImage: 'none',
                    minHeight: 64,
                },
            },
        },

        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: '64px !important',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: cardSurface,
                    borderRight: `1px solid ${mist}`,
                    boxShadow: 'none',
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    color: graphite,
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    '&:hover': {
                        backgroundColor: canvasWhite,
                        color: charcoalInk,
                    },
                    '&.Mui-selected': {
                        backgroundColor: featurePanelTint,
                        color: googleBlue,
                        fontWeight: 500,
                        '& .MuiListItemIcon-root': {
                            color: googleBlue,
                        },
                        '&:hover': {
                            backgroundColor: '#dce8fc',
                        },
                    },
                },
            },
        },

        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: slate,
                    minWidth: 36,
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    height: 26,
                },
                colorPrimary: {
                    backgroundColor: featurePanelTint,
                    color: googleBlueDeep,
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 400,
                },
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                    border: `1px solid ${mist}`,
                    boxShadow: '0 4px 16px rgba(32, 33, 36, 0.08)',
                    backgroundImage: 'none',
                },
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: charcoalInk,
                    padding: '8px 16px',
                    '&:hover': {
                        backgroundColor: canvasWhite,
                    },
                    '&.Mui-selected': {
                        backgroundColor: featurePanelTint,
                        color: googleBlue,
                        fontWeight: 500,
                    },
                },
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: mist,
                },
            },
        },

        MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: featurePanelTint,
                    color: googleBlue,
                    fontWeight: 500,
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: charcoalInk,
                    color: cardSurface,
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    borderRadius: 4,
                    padding: '6px 10px',
                },
            },
        },

        MuiContainer: {
            styleOverrides: {
                maxWidthLg: {
                    maxWidth: '1200px !important',
                },
            },
        },

        MuiLink: {
            styleOverrides: {
                root: {
                    color: googleBlue,
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    '&:hover': {
                        color: googleBlueDeep,
                    },
                },
            },
        },
    },
});
