import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { formatYen, formatBTC, formatPercentage } from '../../utils/formatters';
import { DEFAULTS, CURRENT_YEAR, PriceModel } from '../../utils/constants';
import { useWithdrawalSimulation, WithdrawalInputs } from '../../hooks/useWithdrawalSimulation';
import LoadingSpinner from '../ui/LoadingSpinner';

// Home.tsx から借用したスタイル（拡張）
const typography = {
    h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
    h3: 'text-lg sm:text-xl font-medium',
    body: 'text-sm sm:text-base font-normal',
    small: 'text-xs sm:text-sm font-normal',
    tableHeader: 'text-sm sm:text-base font-semibold', // テーブルヘッダー用に追加
    tableBody: 'text-sm sm:text-base font-normal', // テーブルボディ用に追加
};

const colors = {
    primary: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white',
    secondary: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
    cardBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
    cardBorder: 'border border-gray-700/50',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    chartBg: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80',
    inputBg: 'bg-gray-800/70 hover:bg-gray-700/70 focus:bg-gray-700/70',
    shadowGlow: 'shadow-lg hover:shadow-xl hover:shadow-amber-500/20',
    tableHeaderBg: 'bg-gradient-to-r from-gray-700 to-gray-800', // テーブルヘッダー用グラデーション
};

const TooltipIcon: React.FC<{ content: React.ReactNode }> = ({ content }) => (
    <div className="group relative inline-block ml-2">
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-amber-300 cursor-help transition-colors duration-200" />
        <div className="invisible group-hover:visible absolute z-10 w-64 p-3 mt-2 text-sm text-gray-200 bg-gray-900/95 rounded-lg shadow-lg border border-gray-700/50 -translate-x-1/2 left-1/2">
            {content}
        </div>
    </div>
);

const InputField: React.FC<{
    label: string;
    tooltip?: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}> = ({ label, tooltip, error, children }) => (
    <div className="mb-4">
        <div className="flex items-center mb-1">
            <label className={`${typography.body} ${colors.textSecondary}`}>{label}</label>
            {tooltip && <TooltipIcon content={tooltip} />}
        </div>
        {children}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

const TOOLTIPS = {
    initialBTC: "現在保有しているビットコインの量を入力してください。",
    withdrawalAmount: "毎月の生活費として必要な金額を入力してください。税引き後の手取り額として計算されます。",
    withdrawalRate: "資産からの年間取り崩し率を指定します。一般的なFIREでは4%が目安とされています。",
    secondPhase: "特定の年から取り崩し方法や金額を変更できます。退職後の生活スタイルの変化などに対応します。",
    taxRate: "利益に対する税率を設定します。デフォルトは確定申告を行った場合の税率です。",
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。",
    priceModel: (
        <React.Fragment>
            <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
            <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
        </React.Fragment>
    ),
};

const WithdrawalSimulator: React.FC = () => {
    const [initialBTC, setInitialBTC] = useState<string>("");
    const [startYear, setStartYear] = useState<string>("2025");
    const [priceModel, setPriceModel] = useState<PriceModel>(PriceModel.STANDARD);
    const [withdrawalType, setWithdrawalType] = useState<'fixed' | 'percentage'>("fixed");
    const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
    const [withdrawalRate, setWithdrawalRate] = useState<string>("4");
    const [showSecondPhase, setShowSecondPhase] = useState<boolean>(false);
    const [secondPhaseYear, setSecondPhaseYear] = useState<string>("2030");
    const [secondPhaseType, setSecondPhaseType] = useState<'fixed' | 'percentage'>("fixed");
    const [secondPhaseAmount, setSecondPhaseAmount] = useState<string>("");
    const [secondPhaseRate, setSecondPhaseRate] = useState<string>("4");
    const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
    const [taxRate, setTaxRate] = useState<string>(DEFAULTS.TAX_RATE.toString());
    const [exchangeRate, setExchangeRate] = useState<string>(DEFAULTS.EXCHANGE_RATE.toString());
    const [inflationRate, setInflationRate] = useState<string>(DEFAULTS.INFLATION_RATE.toString());
    const [isCalculating, setIsCalculating] = useState<boolean>(false);

    const { results, errors, simulate } = useWithdrawalSimulation();

    const runSimulation = () => {
        setIsCalculating(true);
        const inputs: WithdrawalInputs = {
            initialBTC,
            startYear,
            priceModel,
            withdrawalType,
            withdrawalAmount,
            withdrawalRate,
            showSecondPhase,
            secondPhaseYear,
            secondPhaseType,
            secondPhaseAmount,
            secondPhaseRate,
            taxRate,
            exchangeRate,
            inflationRate,
        };
        setTimeout(() => {
            simulate(inputs);
            setIsCalculating(false);
        }, 500);
    };

    const chartData = useMemo(() => {
        return results.map(result => ({
            year: result.year,
            btcHeld: result.remainingBTC,
            totalValue: result.totalValue,
        }));
    }, [results]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-gray-100 space-y-8">
            <div className={`${colors.cardBg} p-6 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                <h1 className={`${typography.h1} ${colors.textPrimary} mb-6 text-center bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 text-transparent`}>
                    ビットコイン取り崩しシミュレーター
                </h1>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="保有BTC" tooltip={TOOLTIPS.initialBTC} error={errors.initialBTC}>
                            <input
                                type="number"
                                value={initialBTC}
                                onChange={(e) => setInitialBTC(e.target.value)}
                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                step="0.00000001"
                                placeholder="例: 0.1"
                                aria-label="保有BTC"
                            />
                        </InputField>
                        <InputField label="取り崩し開始年" error={errors.startYear}>
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                aria-label="取り崩し開始年"
                            >
                                {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="価格予測モデル" tooltip={TOOLTIPS.priceModel}>
                            <select
                                value={priceModel}
                                onChange={(e) => setPriceModel(e.target.value as PriceModel)}
                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                            >
                                <option value={PriceModel.STANDARD}>標準モデル</option>
                                <option value={PriceModel.CONSERVATIVE}>保守的モデル</option>
                            </select>
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="取り崩し方法" error={errors.withdrawalRate}>
                            <select
                                value={withdrawalType}
                                onChange={(e) => setWithdrawalType(e.target.value as 'fixed' | 'percentage')}
                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                            >
                                <option value="fixed">定額（月額）</option>
                                <option value="percentage">定率（年率）</option>
                            </select>
                        </InputField>
                        <InputField
                            label={withdrawalType === "fixed" ? "取り崩し額（月額、税引き後）" : "取り崩し率（年率）"}
                            tooltip={withdrawalType === "fixed" ? TOOLTIPS.withdrawalAmount : TOOLTIPS.withdrawalRate}
                            error={withdrawalType === "fixed" ? errors.withdrawalAmount : errors.withdrawalRate}
                        >
                            <div className="relative">
                                <input
                                    type="number"
                                    value={withdrawalType === "fixed" ? withdrawalAmount : withdrawalRate}
                                    onChange={(e) => withdrawalType === "fixed" ? setWithdrawalAmount(e.target.value) : setWithdrawalRate(e.target.value)}
                                    className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} pr-12 focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                    placeholder={withdrawalType === "fixed" ? "例: 200000" : "例: 4"}
                                    step={withdrawalType === "fixed" ? "1000" : "0.1"}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    {withdrawalType === "fixed" ? "円" : "%"}
                                </span>
                            </div>
                        </InputField>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center space-x-2 text-gray-300 mb-2">
                            <input
                                type="checkbox"
                                checked={showSecondPhase}
                                onChange={(e) => setShowSecondPhase(e.target.checked)}
                                className="rounded bg-gray-600 focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                            />
                            <span className={`${typography.body} ${colors.textSecondary}`}>2段階目の設定を有効にする</span>
                            <TooltipIcon content={TOOLTIPS.secondPhase} />
                        </label>
                        {showSecondPhase && (
                            <div className="pl-4 space-y-4 border-l-2 border-amber-500/30">
                                <InputField label="2段階目開始年" error={errors.secondPhaseYear}>
                                    <select
                                        value={secondPhaseYear}
                                        onChange={(e) => setSecondPhaseYear(e.target.value)}
                                        className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                    >
                                        {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                            <option key={year} value={year}>{year}年</option>
                                        ))}
                                    </select>
                                </InputField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="2段階目取り崩し方法" error={errors.secondPhaseRate}>
                                        <select
                                            value={secondPhaseType}
                                            onChange={(e) => setSecondPhaseType(e.target.value as 'fixed' | 'percentage')}
                                            className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                        >
                                            <option value="fixed">定額（月額）</option>
                                            <option value="percentage">定率（年率）</option>
                                        </select>
                                    </InputField>
                                    <InputField
                                        label={secondPhaseType === "fixed" ? "取り崩し額（月額、税引き後）" : "取り崩し率（年率）"}
                                        error={secondPhaseType === "fixed" ? errors.secondPhaseAmount : errors.secondPhaseRate}
                                    >
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={secondPhaseType === "fixed" ? secondPhaseAmount : secondPhaseRate}
                                                onChange={(e) => secondPhaseType === "fixed" ? setSecondPhaseAmount(e.target.value) : setSecondPhaseRate(e.target.value)}
                                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} pr-12 focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                                placeholder={secondPhaseType === "fixed" ? "例: 200000" : "例: 4"}
                                                step={secondPhaseType === "fixed" ? "1000" : "0.1"}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                {secondPhaseType === "fixed" ? "円" : "%"}
                                            </span>
                                        </div>
                                    </InputField>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <div
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${showAdvancedOptions ? 'bg-blue-700/50' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <div className="flex items-center space-x-2">
                                <Settings size={18} className={colors.textSecondary} />
                                <span className={`${typography.body} ${colors.textSecondary}`}>詳細設定</span>
                            </div>
                            {showAdvancedOptions ? <ChevronUp size={18} className={colors.textPrimary} /> : <ChevronDown size={18} className={colors.textSecondary} />}
                        </div>
                        {showAdvancedOptions && (
                            <div className="mt-4 space-y-4 p-4 bg-gray-800/50 rounded-md border border-gray-700/30">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="税率 (%)" tooltip={TOOLTIPS.taxRate} error={errors.taxRate}>
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                            step="0.1"
                                            placeholder="例: 20.315"
                                        />
                                    </InputField>
                                    <InputField label="為替レート (円/USD)" tooltip={TOOLTIPS.exchangeRate} error={errors.exchangeRate}>
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                            step="0.1"
                                            placeholder="例: 150"
                                        />
                                    </InputField>
                                    <InputField label="インフレ率 (%)" tooltip={TOOLTIPS.inflationRate} error={errors.inflationRate}>
                                        <input
                                            type="number"
                                            value={inflationRate}
                                            onChange={(e) => setInflationRate(e.target.value)}
                                            className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                            step="0.1"
                                            placeholder="例: 0"
                                        />
                                    </InputField>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={runSimulation}
                            disabled={isCalculating}
                            className={`${colors.accent} w-full p-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${isCalculating ? 'opacity-70 cursor-not-allowed' : ''} ${colors.shadowGlow}`}
                        >
                            {isCalculating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    計算中...
                                </>
                            ) : (
                                'シミュレーション実行'
                            )}
                        </button>
                    </div>
                </div>

                {errors.simulation && (
                    <div className="mt-4 p-3 bg-red-900/80 text-gray-100 rounded-md border border-red-700/50">
                        {errors.simulation}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <div className={`${colors.chartBg} p-6 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                            <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>資産推移</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#5A5A6A" opacity={0.5} />
                                    <XAxis dataKey="year" stroke="#e2e8f0" tick={{ fontSize: 12, fill: '#e2e8f0' }} />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        tickFormatter={(value) => formatBTC(value, 4)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: '残り保有BTC',
                                            angle: -90,
                                            position: 'insideLeft',
                                            offset: -40,
                                            style: { fill: '#34D399', fontSize: 12, fontWeight: 500 },
                                        }}
                                        width={80}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={(value) => formatYen(value, 2)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: '資産評価額',
                                            angle: 90,
                                            position: 'insideRight',
                                            offset: -10,
                                            style: { fill: '#60A5FA', fontSize: 12, fontWeight: 500 },
                                        }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.95)', border: '1px solid rgba(82, 82, 91, 0.8)', borderRadius: '8px' }}
                                        labelStyle={{ color: '#e2e8f0' }}
                                        formatter={(value: number, name: string) =>
                                            name === 'btcHeld' ? [formatBTC(value, 4), '残り保有BTC'] : [formatYen(value, 2), '資産評価額']
                                        }
                                    />
                                    <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '10px' }} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="btcHeld"
                                        stroke="#34D399"
                                        name="残り保有BTC"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="totalValue"
                                        stroke="#60A5FA"
                                        name="資産評価額"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={`block md:hidden ${colors.cardBg} p-4 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                            <h3 className={`${typography.h3} ${colors.textPrimary} mb-2`}>ハイライト</h3>
                            <div className="space-y-3">
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>BTC初期保有量</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>{formatBTC(parseFloat(initialBTC) || 0, 4)}</div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>取り崩し開始年</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>{startYear}年</div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>
                                        {withdrawalType === "fixed" ? "月額取り崩し" : "年間取り崩し率"}
                                    </div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {withdrawalType === "fixed"
                                            ? formatYen(parseFloat(withdrawalAmount) || 0, 2)
                                            : formatPercentage(parseFloat(withdrawalRate) || 0, 2)}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>資金寿命</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {(() => {
                                            const zeroIndex = results.findIndex(r => r.remainingBTC <= 0);
                                            const zeroYear = zeroIndex !== -1 ? results[zeroIndex].year : null;
                                            return zeroYear
                                                ? `${zeroYear}年（${zeroYear - parseInt(startYear)}年間）`
                                                : "2050年以降も維持";
                                        })()}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>5年後の資産評価額</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {formatYen(results.find(r => r.year === CURRENT_YEAR + 5)?.totalValue || 0, 2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`hidden md:block ${colors.cardBg} p-6 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                            <div className="flex justify-between mb-4">
                                <h3 className={`${typography.h3} ${colors.textPrimary}`}>シミュレーション結果</h3>
                            </div>
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="min-w-full divide-y divide-gray-700/50">
                                    <thead className={colors.tableHeaderBg}>
                                        <tr>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>年</th>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>BTC価格</th>
                                            {showSecondPhase && (
                                                <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>段階</th>
                                            )}
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩し率</th>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩し額</th>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩しBTC</th>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>残り保有BTC</th>
                                            <th scope="col" className={`${typography.tableHeader} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>資産評価額</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {results.map((result, index) => (
                                            <tr key={result.year} className={index % 2 === 0 ? "bg-gray-800/30 hover:bg-gray-700/50" : "bg-gray-750/30 hover:bg-gray-700/50 transition-colors duration-200"}>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>{result.year}</td>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.btcPrice, 2)}</td>
                                                {showSecondPhase && (
                                                    <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>{result.phase}</td>
                                                )}
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalRate === 'number' ? formatPercentage(result.withdrawalRate, 2) : result.withdrawalRate}
                                                </td>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalAmount === 'number' ? formatYen(result.withdrawalAmount, 2) : result.withdrawalAmount}
                                                </td>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalBTC === 'number' ? formatBTC(result.withdrawalBTC, 4) : result.withdrawalBTC}
                                                </td>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>{formatBTC(result.remainingBTC, 4)}</td>
                                                <td className={`${typography.tableBody} px-4 py-3 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.totalValue, 2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawalSimulator;

