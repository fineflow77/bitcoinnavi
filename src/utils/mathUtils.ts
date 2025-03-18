import { getDaysSinceGenesis } from './dateUtils';

export const log10 = (value: number): number => Math.log10(Math.max(0.0000001, value));

export const fromLog10 = (logValue: number): number => Math.pow(10, logValue);

export const calculateRSquared = (data: [number, number][]): number => {
    if (!data || data.length === 0) {
        console.warn('calculateRSquared: No data provided, returning 0');
        return 0;
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    const n = data.length;

    for (const [timestamp, price] of data) {
        const days = getDaysSinceGenesis(new Date(timestamp));
        const x = log10(Math.max(1, days));
        const y = log10(Math.max(0.0000001, price));

        if (isNaN(x) || isNaN(y)) {
            console.warn('Invalid log value:', { timestamp, price, days, x, y });
            return 0;
        }

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const result = denominator === 0 ? 0 : Math.pow(numerator / denominator, 2);
    return isNaN(result) ? 0 : result;
};

export const formatPercentage = (value: number | null, decimals: number = 1): string => {
    if (value === null || isNaN(value)) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};



