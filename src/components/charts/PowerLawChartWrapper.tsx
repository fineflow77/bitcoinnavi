import React from 'react';
import PowerLawChart from './PowerLawChart';
import LogLogPowerLawChart from './LogLogPowerLawChart';
import { ChartDataPoint } from './PowerLawChart';

interface PowerLawChartWrapperProps {
    rSquared: number;
    chartData: ChartDataPoint[];
    exchangeRate: number;
    currentPrice: number | undefined;
    height: number;
}

const PowerLawChartWrapper: React.FC<PowerLawChartWrapperProps> = (props) => {
    return (
        <div className="space-y-8">
            {/* タイトル */}
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-center text-blue-400 mb-4">
                ビットコイン長期価格予測
            </h2>
            {/* 半対数スケールチャート */}
            <div className="bg-gray-800/50 rounded-xl shadow-md border border-gray-700/30">
                <PowerLawChart
                    rSquared={props.rSquared}
                    chartData={props.chartData}
                    exchangeRate={props.exchangeRate}
                    currentPrice={props.currentPrice}
                    height={props.height}
                    showRSquared={false}
                />
                <p className="text-gray-400 text-xs text-center mt-2">
                    半対数スケール: 時間は線形、価格は対数表示。価格の相対的な変化が分かりやすくなります。
                </p>
            </div>
            {/* 対数-対数スケールチャート */}
            <div className="bg-gray-800/50 rounded-xl shadow-md border border-gray-700/30">
                <LogLogPowerLawChart
                    rSquared={props.rSquared}
                    chartData={props.chartData}
                    exchangeRate={props.exchangeRate}
                    currentPrice={props.currentPrice}
                    height={700}
                    showRSquared={true}
                />
                <p className="text-gray-400 text-xs text-center mt-2">
                    対数-対数スケール: 時間と価格を対数変換。パワーローの長期的な成長が直線的に見えます。
                </p>
            </div>
        </div>
    );
};

export default PowerLawChartWrapper;