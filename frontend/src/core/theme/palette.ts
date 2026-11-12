import type { PaletteOptions } from '@mui/material/styles';

/**
 * Design system palette — Google for Education
 * Source: frontend/DESIGN.md
 */
export const palette: PaletteOptions = {
    mode: 'light',

    primary: {
        main: '#1a73e8',       // Google Blue
        light: '#4285f4',
        dark: '#1967d2',       // Google Blue Deep
        contrastText: '#ffffff',
    },

    secondary: {
        main: '#3c4043',       // Graphite
        light: '#5f6368',      // Slate
        dark: '#202124',       // Charcoal Ink
        contrastText: '#ffffff',
    },

    background: {
        default: '#f8f9fa',    // Canvas White
        paper: '#ffffff',      // Card Surface
    },

    text: {
        primary: '#202124',    // Charcoal Ink
        secondary: '#5f6368',  // Slate
        disabled: '#9aa0a6',
    },

    divider: '#dadce0',        // Mist

    error: {
        main: '#d93025',
        light: '#fce8e6',
        dark: '#b31412',
        contrastText: '#ffffff',
    },

    warning: {
        main: '#f9ab00',
        light: '#fef7e0',
        dark: '#e37400',
        contrastText: '#202124',
    },

    success: {
        main: '#188038',       // Classroom Green
        light: '#e6f4ea',
        dark: '#137333',
        contrastText: '#ffffff',
    },

    info: {
        main: '#1a73e8',
        light: '#e8f0fe',      // Feature Panel Tint
        dark: '#1967d2',
        contrastText: '#ffffff',
    },

    action: {
        hover: '#f8f9fa',
        selected: '#e8f0fe',
        disabledBackground: '#f1f3f4',
        disabled: '#9aa0a6',
    },
};

export const designTokens = {
    canvasWhite: '#f8f9fa',
    cardSurface: '#ffffff',
    featurePanelTint: '#e8f0fe',
    charcoalInk: '#202124',
    graphite: '#3c4043',
    slate: '#5f6368',
    mist: '#dadce0',
    cloudShadow: '#c4c6c7',
    googleBlue: '#1a73e8',
    googleBlueDeep: '#1967d2',
    classroomGreen: '#188038',
    scrim: 'rgba(32, 33, 36, 0.5)',
} as const;
