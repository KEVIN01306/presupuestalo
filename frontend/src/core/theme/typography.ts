import type { TypographyVariantsOptions } from '@mui/material/styles';

/**
 * Typography — Google for Education (frontend/DESIGN.md)
 *
 * Weights: 400 (default body) / 500 (emphasis & nav-active states). Never 700 in body copy.
 * Positive letter-spacing on small body (0.017em at 16px, 0.036em at 12px).
 */
const DISPLAY_FONT = "'Google Sans Display', 'Inter', 'Roboto', ui-sans-serif, system-ui, sans-serif";
const TEXT_FONT = "'Google Sans Text', 'Inter', 'Roboto', ui-sans-serif, system-ui, sans-serif";

export const typography: TypographyVariantsOptions = {
    fontFamily: TEXT_FONT,

    h1: {
        fontFamily: DISPLAY_FONT,
        fontSize: '3rem',         // 48px
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: '-0.006em',
    },
    h2: {
        fontFamily: DISPLAY_FONT,
        fontSize: '1.75rem',      // 28px
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.006em',
    },
    h3: {
        fontFamily: DISPLAY_FONT,
        fontSize: '1.375rem',     // 22px
        fontWeight: 500,
        lineHeight: 1.29,
        letterSpacing: '-0.006em',
    },
    h4: {
        fontFamily: DISPLAY_FONT,
        fontSize: '1.25rem',      // 20px
        fontWeight: 500,
        lineHeight: 1.35,
        letterSpacing: '0.001em',
    },
    h5: {
        fontFamily: DISPLAY_FONT,
        fontSize: '1.125rem',     // 18px
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.006em',
    },
    h6: {
        fontFamily: TEXT_FONT,
        fontSize: '1rem',         // 16px
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.017em',
    },
    subtitle1: {
        fontFamily: TEXT_FONT,
        fontSize: '1.125rem',     // 18px
        fontWeight: 400,
        lineHeight: 1.67,
        letterSpacing: '0.006em',
    },
    subtitle2: {
        fontFamily: TEXT_FONT,
        fontSize: '0.875rem',     // 14px
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.017em',
    },
    body1: {
        fontFamily: TEXT_FONT,
        fontSize: '1rem',         // 16px
        fontWeight: 400,
        lineHeight: 1.56,
        letterSpacing: '0.017em',
    },
    body2: {
        fontFamily: TEXT_FONT,
        fontSize: '0.875rem',     // 14px
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.017em',
    },
    caption: {
        fontFamily: TEXT_FONT,
        fontSize: '0.75rem',      // 12px
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.036em',
    },
    overline: {
        fontFamily: TEXT_FONT,
        fontSize: '0.75rem',      // 12px
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    },
    button: {
        fontFamily: TEXT_FONT,
        fontSize: '0.875rem',     // 14px
        fontWeight: 500,
        lineHeight: 1.4,
        textTransform: 'none',
        letterSpacing: '0.01em',
    },
};
