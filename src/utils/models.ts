// src/utils/models.ts
import { PriceModel } from './constants';
import { log10, fromLog10 } from './mathUtils';

// 乖離率の基準値を定数として定義
const DEVIATION_THRESHOLDS = {
    EXTREMELY_UNDERVALUED: -40, // 非常に割安
    UNDERVALUED: -20, // 割安
    SLIGHTLY_UNDERVALUED: -10, // やや割安
    FAIR_RANGE_UPPER: 10, // 適正範囲の上限
    SLIGHTLY_OVERVALUED: 30, // やや割高
    OVERVALUED: 70, // 割高
} as const;

// ラベルを定数として定義
const POSITION_LABELS = {
    EXTREMELY_UNDERVALUED: '非常に割安',
    UNDERVALUED: '割安',
    SLIGHTLY_UNDERVALUED: 'やや割安',
    FAIR_RANGE: '適正範囲',
    SLIGHTLY_OVERVALUED: 'やや割高',
    OVERVALUED: '割高',
    EXTREMELY_OVERVALUED: '非常に割高',
    NEAR_SUPPORT: '下限に接近',
    CALCULATION_ERROR: '計算不可',
} as const;

// 色を定数として定義
const POSITION_COLORS = {
    EXTREMELY_UNDERVALUED: '#1565C0', // 濃い青（非常に割安）
    UNDERVALUED: '#2196F3', // 青（割安）
    SLIGHTLY_UNDERVALUED: '#42A5F5', // 明るい青（やや割安）
    FAIR_RANGE: '#8BC34A', // 緑（適正範囲）
    SLIGHTLY_OVERVALUED: '#FFCA28', // 明るいオレンジ（やや割高）
    OVERVALUED: '#FF9800', // オレンジ（割高）
    EXTREMELY_OVERVALUED: '#F44336', // 赤（非常に割高）
    NEAR_SUPPORT: '#D81B60', // ピンク（下限に接近）
    CALCULATION_ERROR: '#888888', // グレー（計算不可）
} as const;

/**
 * ビットコインの中央価格（USD）を計算
 * @param days - ジェネシスブロックからの日数
 * @param model - 価格モデル（デフォルト: STANDARD）
 * @returns 中央価格（USD）
 */
export const btcPriceMedian = (days: number, model: PriceModel = PriceModel.STANDARD): number => {
    let medianModelLog: number;
    if (model === PriceModel.STANDARD) {
        // 標準モデル（2050年に約1000万USD）
        medianModelLog = -17.01593313 + 5.84509376 * log10(days);
    } else {
        // 保守的モデル（2050年に約400万USD）
        medianModelLog = -17.5 + 5.7 * log10(days);
    }
    return fromLog10(medianModelLog);
};

/**
 * ビットコインの下限価格（USD）を計算
 * @param days - ジェネシスブロックからの日数
 * @returns 下限価格（USD）
 */
export const btcPriceSupport = (days: number): number => {
    const supportModelLog = -17.668 + 5.926 * log10(days);
    return fromLog10(supportModelLog);
};

/**
 * 下限価格からの乖離率を計算
 * @param price - 現在価格（USD）
 * @param supportPrice - 下限価格（USD）
 * @returns 乖離率（パーセント）、計算不可の場合は null
 */
export const calculateSupportDeviation = (price: number, supportPrice: number): number | null => {
    if (!price || !supportPrice || supportPrice <= 0) return null;
    return ((price - supportPrice) / supportPrice) * 100;
};

/**
 * 中央価格からの乖離率に基づくラベルを返す
 * @param medianDeviation - 中央価格からの乖離率（パーセント）
 * @param supportDeviation - 下限価格からの乖離率（オプション）
 * @returns 価格の位置を説明するラベル
 */
export const getPowerLawPositionLabel = (
    medianDeviation: number | null,
    supportDeviation: number | null = null
): string => {
    if (medianDeviation === null || medianDeviation === undefined) {
        return POSITION_LABELS.CALCULATION_ERROR;
    }

    let baseLabel = '';
    // 割安側
    if (medianDeviation <= DEVIATION_THRESHOLDS.EXTREMELY_UNDERVALUED) {
        baseLabel = POSITION_LABELS.EXTREMELY_UNDERVALUED;
    } else if (medianDeviation <= DEVIATION_THRESHOLDS.UNDERVALUED) {
        baseLabel = POSITION_LABELS.UNDERVALUED;
    } else if (medianDeviation < DEVIATION_THRESHOLDS.SLIGHTLY_UNDERVALUED) {
        baseLabel = POSITION_LABELS.SLIGHTLY_UNDERVALUED;
    }
    // 適正範囲
    else if (medianDeviation <= DEVIATION_THRESHOLDS.FAIR_RANGE_UPPER) {
        baseLabel = POSITION_LABELS.FAIR_RANGE;
    }
    // 割高側
    else if (medianDeviation <= DEVIATION_THRESHOLDS.SLIGHTLY_OVERVALUED) {
        baseLabel = POSITION_LABELS.SLIGHTLY_OVERVALUED;
    } else if (medianDeviation <= DEVIATION_THRESHOLDS.OVERVALUED) {
        baseLabel = POSITION_LABELS.OVERVALUED;
    } else {
        baseLabel = POSITION_LABELS.EXTREMELY_OVERVALUED;
    }

    if (supportDeviation !== null && supportDeviation < 10) {
        return `${baseLabel} - ${POSITION_LABELS.NEAR_SUPPORT}`;
    }
    return baseLabel;
};

/**
 * 中央価格からの乖離率に基づく色を返す
 * @param medianDeviation - 中央価格からの乖離率（パーセント）
 * @param supportDeviation - 下限価格からの乖離率（オプション）
 * @returns 色（HEX）
 */
export const getPowerLawPositionColor = (
    medianDeviation: number | null,
    supportDeviation: number | null = null
): string => {
    if (medianDeviation === null || medianDeviation === undefined) {
        return POSITION_COLORS.CALCULATION_ERROR;
    }

    if (supportDeviation !== null && supportDeviation < 10) {
        return POSITION_COLORS.NEAR_SUPPORT;
    }

    // 割安側
    if (medianDeviation <= DEVIATION_THRESHOLDS.EXTREMELY_UNDERVALUED) {
        return POSITION_COLORS.EXTREMELY_UNDERVALUED;
    }
    if (medianDeviation <= DEVIATION_THRESHOLDS.UNDERVALUED) {
        return POSITION_COLORS.UNDERVALUED;
    }
    if (medianDeviation < DEVIATION_THRESHOLDS.SLIGHTLY_UNDERVALUED) {
        return POSITION_COLORS.SLIGHTLY_UNDERVALUED;
    }
    // 適正範囲
    if (medianDeviation <= DEVIATION_THRESHOLDS.FAIR_RANGE_UPPER) {
        return POSITION_COLORS.FAIR_RANGE;
    }
    // 割高側
    if (medianDeviation <= DEVIATION_THRESHOLDS.SLIGHTLY_OVERVALUED) {
        return POSITION_COLORS.SLIGHTLY_OVERVALUED;
    }
    if (medianDeviation <= DEVIATION_THRESHOLDS.OVERVALUED) {
        return POSITION_COLORS.OVERVALUED;
    }
    return POSITION_COLORS.EXTREMELY_OVERVALUED;
};