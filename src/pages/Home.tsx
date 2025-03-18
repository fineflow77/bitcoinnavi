import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Info, ArrowUpRight } from 'lucide-react';
import { useBitcoinData } from '../hooks/useBitcoinData';
import PowerLawChartWrapper from '../components/charts/PowerLawChartWrapper';
import { formatCurrency } from '../utils/formatters';
import { calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor } from '../utils/models';
import { calculateRSquared, formatPercentage } from '../utils/mathUtils';
import DataContainer from '../components/ui/DataContainer';
import { getDaysSinceGenesis } from '../utils/dateUtils';
import { ChartLineUp, Wallet as PhosphorWallet } from 'phosphor-react';

const typography: Record<string, string> = {
  h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
  h3: 'text-lg sm:text-xl font-medium',
  subtitle: 'text-base sm:text-lg font-medium',
  body: 'text-sm sm:text-base font-normal',
  small: 'text-xs sm:text-sm font-normal',
};

const colors: Record<string, string> = {
  primary: 'bg-green-500 hover:bg-green-600 text-white',
  secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
  accent: 'bg-amber-500 hover:bg-amber-600 text-white',
  cardBg: 'bg-gray-800/50',
  cardBorder: 'border border-gray-700/30',
  cardBorderHighlight: 'border border-blue-500/50',
  textPrimary: 'text-gray-100',
  textSecondary: 'text-gray-300',
  textMuted: 'text-gray-400',
  chartBg: 'bg-gray-800/50',
  investmentCardBg: 'bg-gradient-to-br from-blue-600 to-indigo-500',
  withdrawalCardBg: 'bg-gradient-to-br from-green-600 to-teal-500',
  buttonBg: 'bg-gray-700',
  buttonHover: 'hover:bg-gray-600',
};

const Home: React.FC = () => {
  const { loading, error, currentPrice, exchangeRate, weeklyPrices, powerLawData, dailyPrices } = useBitcoinData();
  const [rSquared, setRSquared] = useState<number>(0.9703);

  useEffect(() => {
    if (weeklyPrices && weeklyPrices.length > 0) {
      const calculatedRSquared = calculateRSquared(
        weeklyPrices.map(item => [new Date(item.date).getTime(), item.price] as [number, number])
      );
      if (calculatedRSquared !== null) setRSquared(calculatedRSquared);
    }
  }, [weeklyPrices]);

  const powerLawPosition = useMemo(() => {
    if (!currentPrice || !powerLawData || powerLawData.length === 0) return null;
    const latestNonFutureData = [...powerLawData]
      .filter(item => !item.isFuture && item.price !== null)
      .sort((a, b) => b.date - a.date)[0];
    if (!latestNonFutureData || !currentPrice.prices.usd) return null;

    return calculatePowerLawPosition(
      currentPrice.prices.usd,
      latestNonFutureData.medianModel,
      latestNonFutureData.supportModel
    );
  }, [currentPrice, powerLawData]);

  const priceChangePercentage = useMemo(() => {
    if (!currentPrice || !dailyPrices || dailyPrices.length < 2) return null;
    const sortedPrices = [...dailyPrices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedPrices.length < 2 || !currentPrice.prices.usd) return null;
    const latestPrice = currentPrice.prices.usd;
    const yesterdayPrice = sortedPrices[1].price;
    return ((latestPrice - yesterdayPrice) / yesterdayPrice) * 100;
  }, [currentPrice, dailyPrices]);

  const { medianPrice, supportPrice } = useMemo(() => {
    if (!powerLawData || powerLawData.length === 0) return { medianPrice: 0, supportPrice: 0 };
    const now = Date.now();
    const closestPoint = powerLawData.reduce((closest, current) => {
      const currentDiff = Math.abs(current.date - now);
      const closestDiff = Math.abs(closest.date - now);
      return currentDiff < closestDiff ? current : closest;
    });
    return { medianPrice: closestPoint.medianModel, supportPrice: closestPoint.supportModel };
  }, [powerLawData]);

  const daysCount = useMemo(() => getDaysSinceGenesis(new Date()), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className={typography.small}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <p className={typography.small}>エラー: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <div className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ヘッダーとシミュレーターへの導線 */}
        <section className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-6">
            パワーローによるビットコイン投資
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/simulators/withdrawal"
              className={`${colors.withdrawalCardBg} p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <PhosphorWallet size={28} weight="fill" className="text-white mb-2" />
                <h2 className={`${typography.h2} text-white`}>取り崩しシミュレーター</h2>
                <p className={`${typography.small} text-gray-200`}>保有するビットコインから定期的に引き出す場合の資産推移をシミュレーション</p>
              </div>
              <span className={`${colors.buttonBg} ${colors.buttonHover} px-4 py-2 rounded-full text-sm mt-4 self-start flex items-center`}>
                シミュレーターを利用する <ArrowUpRight className="ml-1" size={16} />
              </span>
            </Link>
            <Link
              to="/simulators/investment"
              className={`${colors.investmentCardBg} p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <ChartLineUp size={28} weight="fill" className="text-white mb-2" />
                <h2 className={`${typography.h2} text-white`}>積み立てシミュレーター</h2>
                <p className={`${typography.small} text-gray-200`}>毎月の積立投資でビットコインを購入した場合の資産推移をシミュレーション</p>
              </div>
              <span className={`${colors.buttonBg} ${colors.buttonHover} px-4 py-2 rounded-full text-sm mt-4 self-start flex items-center`}>
                シミュレーターを利用する <ArrowUpRight className="ml-1" size={16} />
              </span>
            </Link>
          </div>
        </section>

        {/* 価格トラッカー */}
        <section className="space-y-6">
          <div className="flex items-center justify-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            <h2 className={`${typography.subtitle} text-blue-400`}>ビットコイン価格トラッカー</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorderHighlight}`}>
              <h3 className={`${typography.h3} text-blue-400 mb-2 flex items-center`}>
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> 現在価格
              </h3>
              <DataContainer
                isLoading={loading}
                error={error}
                loadingMessage="価格データ取得中..."
                noDataMessage="価格データが利用できません"
              >
                {currentPrice && (
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-blue-400">
                      {formatCurrency(currentPrice.prices.jpy, 'JPY')}
                    </p>
                    <p className={`${typography.small} ${colors.textSecondary}`}>
                      ({formatCurrency(currentPrice.prices.usd, 'USD')})
                    </p>
                    {priceChangePercentage !== null && (
                      <p
                        className={`${typography.small} font-medium ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                      >
                        {priceChangePercentage >= 0 ? '↑' : '↓'} {Math.abs(priceChangePercentage).toFixed(2)}%
                      </p>
                    )}
                    {powerLawPosition !== null && (
                      <p
                        className={`${typography.small} font-medium`}
                        style={{ color: getPowerLawPositionColor(powerLawPosition) }}
                      >
                        パワーロー位置: {formatPercentage(powerLawPosition)} ({getPowerLawPositionLabel(powerLawPosition)})
                      </p>
                    )}
                  </div>
                )}
              </DataContainer>
            </div>
            <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorder}`}>
              <h3 className={`${typography.h3} text-green-400 mb-2 flex items-center`}>
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> 本日のパワーロー中央価格
              </h3>
              <DataContainer
                isLoading={loading}
                error={error}
                loadingMessage="価格データ取得中..."
                noDataMessage="中央価格データが利用できません"
              >
                <div className="space-y-1">
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(medianPrice * exchangeRate, 'JPY')}
                  </p>
                  <p className={`${typography.small} ${colors.textSecondary}`}>
                    ({formatCurrency(medianPrice, 'USD')})
                  </p>
                  <p className={`${typography.small} ${colors.textMuted}`}>
                    累計日数: {daysCount.toLocaleString()}
                  </p>
                </div>
              </DataContainer>
            </div>
            <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorder}`}>
              <h3 className={`${typography.h3} text-red-400 mb-2 flex items-center`}>
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> 本日のパワーロー下限価格
              </h3>
              <DataContainer
                isLoading={loading}
                error={error}
                loadingMessage="価格データ取得中..."
                noDataMessage="下限価格データが利用できません"
              >
                <div className="space-y-1">
                  <p className="text-xl font-bold text-red-400">
                    {formatCurrency(supportPrice * exchangeRate, 'JPY')}
                  </p>
                  <p className={`${typography.small} ${colors.textSecondary}`}>
                    ({formatCurrency(supportPrice, 'USD')})
                  </p>
                </div>
              </DataContainer>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <p>為替レート: {formatCurrency(exchangeRate, 'JPY', { maxDecimals: 2 }).replace('¥', '')} JPY/USD</p>
            <p>最終更新: {currentPrice?.timestamp ? new Date(currentPrice.timestamp).toLocaleString('ja-JP', { timeStyle: 'short' }) : 'N/A'}</p>
          </div>
        </section>

        {/* チャート */}
        <section>
          <DataContainer
            isLoading={loading}
            error={error}
            loadingMessage="チャートデータ取得中..."
            noDataMessage="チャートデータが利用できません"
          >
            {powerLawData && powerLawData.length > 0 ? (
              <PowerLawChartWrapper
                rSquared={rSquared}
                chartData={powerLawData}
                exchangeRate={exchangeRate}
                currentPrice={currentPrice?.prices.usd ?? 0}
                height={600}
              />
            ) : null}
          </DataContainer>
        </section>

        {/* パワーロー解説 */}
        <section className={`${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
          <h2 className={`${typography.h2} text-blue-400 mb-4 flex items-center`}>
            <Info className="h-5 w-5 mr-2" /> パワーローとは
          </h2>
          <p className={`${typography.body} ${colors.textSecondary} mb-4`}>
            ビットコインは株式などとは異なり、パワーローと呼ばれる自然法則に従って成長することが分かってきました。定期的なバブルで価格が急騰する一方、時間の経過とともにパワーローの予測ラインに収束する傾向があります。対数スケールで見ると、右肩上がりの成長がはっきりと確認できます。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h3 className={`${typography.subtitle} text-green-400`}>中央価格</h3>
              <p className={`${typography.small} ${colors.textSecondary}`}>
                パワーローモデルが予測する妥当な価格。チャート左上の「決定係数（R²）」は、1に近いほど精度が高い。
              </p>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h3 className={`${typography.subtitle} text-red-400`}>下限価格</h3>
              <p className={`${typography.small} ${colors.textSecondary}`}>
                暴落時含め、歴史的にほとんど割れることのない強力なサポートライン。買い場の目安となる。
              </p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Link to="/power-law-explanation" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-end">
              詳しく学ぶ <ArrowUpRight className="ml-1" size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;