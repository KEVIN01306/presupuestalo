/**
 * Formats a numeric value using the given currency symbol (default: '$').
 * Example: formatCurrency(1250, 'Q') -> 'Q 1,250.00'
 */
export const formatCurrency = (amount: number, symbol = '$'): string => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const isNegative = safeAmount < 0;
    const formatted = Math.abs(safeAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}${symbol} ${formatted}`;
};
