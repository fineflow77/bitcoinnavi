// src/utils/models.ts
import { PriceModel } from './constants';
import { log10, fromLog10 } from './mathUtils'; // formatPercentageは使用しないので削除

/**
 * ビットコインの中央価格（USD）を計算
 * @param days - ジェネシスブロックからの日数
 * @param model - 価格モデル（デフォルト: STANDARD）
 * @returns 中央価格（USD）
 */
export const btcPriceMedian = (days: number, _model: PriceModel = PriceModel.STANDARD): number => {
    const medianModelLog = -17.01593313 + 5.84509376 * log10(days);
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
 * パワーロー内での相対位置を計算
 * @param price - 現在価格（USD）
 * @param medianPrice - 中央価格（USD）
 * @param supportPrice - 下限価格（USD）
 * @returns 相対位置（パーセント）、計算不可の場合はnull
 */
export const calculatePowerLawPosition = (price: number, medianPrice: number, supportPrice: number): number | null => {
    if (!price || !medianPrice || !supportPrice) return null;
    return ((price - medianPrice) / medianPrice) * 100;
};

/**
 * 下限価格からの乖離率を計算
 * @param price - 現在価格（USD）
 * @param supportPrice - 下限価格（USD）
 * @returns 乖離率（パーセント）、計算不可の場合はnull
 */
export const calculateSupportDeviation = (price: number, supportPrice: number): number | null => {
    if (!price || !supportPrice) return null;
    return ((price - supportPrice) / supportPrice) * 100;
};

/**
 * パワーロー位置に基づくラベルを返す
 * @param position - 相対位置（パーセント）
 * @param supportDeviation - 下限からの乖離率（オプション）
 * @returns 位置の説明
 */
export const getPowerLawPositionLabel = (position: number | null, supportDeviation: number | null = null): string => {
    if (position === null || position === undefined) return '計算不可';

    let baseLabel = '';
    if (position < -50) baseLabel = '買い増しチャンス';
    else if (position < -30) baseLabel = '割安';
    else if (position < -10) baseLabel = 'やや割安';
    else if (position <= 10) baseLabel = '適正範囲';
    else if (position <= 30) baseLabel = '上昇（注意）';
    else if (position <= 70) baseLabel = '高値警戒';
    else baseLabel = 'ピーク警戒（売却検討）';

    if (supportDeviation !== null && supportDeviation < 10) {
        return `${baseLabel} - 下限に接近`;
    }
    return baseLabel;
};

/**
 * パワーロー位置に基づく色を返す
 * @param position - 相対位置（パーセント）
 * @param supportDeviation - 下限からの乖離率（オプション）
 * @returns 色（HEX）
 */
export const getPowerLawPositionColor = (position: number | null, supportDeviation: number | null = null): string => {
    if (position === null || position === undefined) return '#888888';

    // 極端な状況を優先
    if (position < -50) return '#1565C0'; // 買い増しチャンス（青）
    if (position > 70) return '#B71C1C';  // ピーク警戒（濃赤）

    // 下限接近の条件は中間範囲でのみ適用
    if (supportDeviation !== null && supportDeviation < 10 && position >= -50 && position <= 70) {
        return '#D81B60'; // 下限接近（赤紫）
    }

    // その他の範囲
    if (position < -30) return '#2196F3'; // 割安（明るい青）
    if (position < -10) return '#4CAF50'; // やや割安（緑）
    if (position <= 10) return '#8BC34A'; // 適正範囲（薄緑）
    if (position <= 30) return '#FF9800'; // 上昇（注意）（オレンジ）
    if (position <= 70) return '#F44336'; // 高値警戒（赤）

    return '#FFFFFF'; // デフォルト（白）
};

