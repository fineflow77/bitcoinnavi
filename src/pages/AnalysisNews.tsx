// src/pages/AnalysisNews.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { useBitcoinData } from '../hooks/useBitcoinData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getPowerLawPositionLabel, getPowerLawPositionColor } from '../utils/models';
import DataContainer from '../components/ui/DataContainer';
import { BitcoinData, PowerLawDataPoint } from '../types';

const typography: Record<string, string> = {
    h1: 'text-2xl sm:text-3xl font-semibold tracking-tight',
    h2: 'text-xl sm:text-2xl font-medium',
    subtitle: 'text-base sm:text-lg font-medium',
    body: 'text-sm sm:text-base font-normal',
    small: 'text-xs sm:text-sm font-normal',
};

const colors: Record<string, string> = {
    primary: 'bg-[#3B82F6] hover:bg-[#2b6cb0] text-white',
    cardBg: 'bg-gray-800',
    cardBorder: 'border border-gray-700',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
};

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: { name: string };
}

// ニュースアイテムコンポーネント（可読性向上のため分割）
const NewsItem: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <div className="border-b border-gray-700 pb-4">
        <h3 className={`${typography.subtitle} ${colors.textPrimary}`}>{article.title}</h3>
        <p className={`${typography.small} ${colors.textMuted}`}>
            {new Date(article.publishedAt).toLocaleDateString()} - {article.source.name}
        </p>
        <p className={`${typography.body} ${colors.textSecondary}`}>{article.description}</p>
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B82F6] hover:text-[#2b6cb0] text-sm font-medium inline-flex items-center"
        >
            詳細を読む <ArrowRight className="ml-1 h-4 w-4" />
        </a>
    </div>
);

const AnalysisNews: React.FC = () => {
    const { loading, error, currentPrice, powerLawData, dailyPrices, news } = useBitcoinData() as BitcoinData & { news: NewsArticle[] };

    // 過去1週間の価格動向を計算
    const priceChange = React.useMemo(() => {
        if (!dailyPrices || dailyPrices.length < 7) return { percentage: 0, trend: 'データ不足' };
        const recentPrices = dailyPrices.slice(-7); // 最新7日間
        const startPrice = recentPrices[0].price;
        const endPrice = recentPrices[recentPrices.length - 1].price;
        const percentage = ((endPrice - startPrice) / startPrice) * 100;
        const trend = percentage >= 0 ? '上昇傾向' : '下降傾向';
        return { percentage, trend };
    }, [dailyPrices]);

    // 中央価格と下限価格を取得
    const { medianPrice, supportPrice } = React.useMemo(() => {
        if (!powerLawData || powerLawData.length === 0) return { medianPrice: 0, supportPrice: 0 };
        const now = Date.now();
        const closestPoint = powerLawData.reduce(
            (closest: PowerLawDataPoint, current: PowerLawDataPoint) => {
                const currentDiff = Math.abs(current.date - now);
                const closestDiff = Math.abs(closest.date - now);
                return currentDiff < closestDiff ? current : closest;
            },
            powerLawData[0]
        );
        return { medianPrice: closestPoint.medianModel, supportPrice: closestPoint.supportModel };
    }, [powerLawData]);

    // 中央価格からの乖離率を計算
    const medianDeviation = React.useMemo(() => {
        if (!currentPrice || !medianPrice) return null;
        return ((currentPrice.prices.usd - medianPrice) / medianPrice) * 100;
    }, [currentPrice, medianPrice]);

    // 下限価格からの乖離率を計算
    const supportDeviation = React.useMemo(() => {
        if (!currentPrice || !supportPrice) return null;
        return ((currentPrice.prices.usd - supportPrice) / supportPrice) * 100;
    }, [currentPrice, supportPrice]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1a202c] to-[#2d3748] text-gray-100">
            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* イントロダクション */}
                <div className="text-center">
                    <h1 className={`${typography.h1} text-[#3B82F6] mb-4`}>ニュース</h1>
                    <p className={`${typography.body} ${colors.textSecondary}`}>
                        ビットコインの最新価格分析とニュースをチェックして、長期投資の判断に役立てましょう。
                    </p>
                </div>

                {/* セクション1：最新の価格分析 */}
                <div className={`${colors.cardBg} p-5 rounded-2xl shadow-md ${colors.cardBorder}`}>
                    <h2 className={`${typography.h2} text-[#3B82F6] mb-3 flex items-center`}>
                        <Newspaper className="h-5 w-5 mr-2 text-[#3B82F6]" />
                        最新の価格分析
                    </h2>
                    <DataContainer
                        isLoading={loading}
                        error={error}
                        loadingMessage="データ取得中..."
                        noDataMessage="データが利用できません"
                    >
                        {currentPrice && medianDeviation !== null ? (
                            <div className="space-y-3">
                                <p className={`${typography.body} ${colors.textPrimary}`}>
                                    現在のビットコイン価格：{formatCurrency(currentPrice.prices.jpy, 'JPY')}
                                </p>
                                <p className={`${typography.body} ${colors.textSecondary}`}>
                                    中央価格からの乖離率：
                                    <span className={`${typography.body} ${colors.textPrimary}`}>
                                        {medianDeviation >= 0 ? '+' : ''}{medianDeviation.toFixed(1)}%
                                    </span>
                                </p>
                                <p className={`${typography.body} ${colors.textSecondary}`}>
                                    パワーローモデルとの位置：
                                    <span
                                        className="px-2 py-1 rounded-full text-xs font-medium ml-2"
                                        style={{
                                            backgroundColor: `${getPowerLawPositionColor(medianDeviation, supportDeviation)}20`,
                                            color: getPowerLawPositionColor(medianDeviation, supportDeviation),
                                        }}
                                    >
                                        {getPowerLawPositionLabel(medianDeviation, supportDeviation)}
                                    </span>
                                </p>
                                <p className={`${typography.body} ${colors.textSecondary}`}>
                                    過去1週間の価格動向：
                                    {formatPercentage(priceChange.percentage, { decimals: 2 })}（{priceChange.trend}）
                                </p>
                            </div>
                        ) : null}
                    </DataContainer>
                    <div className="mt-4 text-right">
                        <Link
                            to="/power-law-explanation"
                            className="text-[#3B82F6] hover:text-[#2b6cb0] text-sm font-medium inline-flex items-center group"
                        >
                            パワーローモデルについて詳しく学ぶ{' '}
                            <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                {/* セクション2：ビットコイン関連ニュース */}
                <div className={`${colors.cardBg} p-5 rounded-2xl shadow-md ${colors.cardBorder}`}>
                    <h2 className={`${typography.h2} text-[#3B82F6] mb-3`}>ビットコイン関連ニュース</h2>
                    <DataContainer
                        isLoading={loading}
                        error={error}
                        loadingMessage="ニュース取得中..."
                        noDataMessage="ニュースがありません"
                    >
                        <div className="space-y-4">
                            {news.map((article, index) => (
                                <NewsItem key={index} article={article} />
                            ))}
                        </div>
                    </DataContainer>
                </div>

                {/* CTA：シミュレーターへの導線 */}
                <div className="text-center">
                    <Link
                        to="/simulators/investment"
                        className={`${colors.primary} px-6 py-3 rounded-full text-sm font-medium inline-flex items-center transition-colors`}
                    >
                        シミュレーションで投資戦略を試す
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AnalysisNews;