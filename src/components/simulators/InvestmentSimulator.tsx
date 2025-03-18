import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { formatYen, formatBTC } from '../../utils/formatters';
import { DEFAULTS, CURRENT_YEAR, PriceModel } from '../../utils/constants';
import { useInvestmentSimulation, SimulationInputs } from '../../hooks/useInvestmentSimulation';
import LoadingSpinner from '../ui/LoadingSpinner';

// Home.tsx から借用したスタイル（拡張）
const typography = {
    h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
    h3: 'text-lg sm:text-xl font-medium',
    body: 'text-sm sm:text-base font-normal',
    small: 'text-xs sm:text-sm font-normal',
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
    initialInvestmentType: "初期投資方法を選択してください。すでに保有しているBTCを指定するか、日本円で投資するかを選べます。",
    initialInvestment: "初期投資額（円）を入力してください。",
    initialBtcHolding: "すでに保有しているビットコインの量（BTC）を入力してください。",
    monthlyInvestment: "毎月積み立てる金額（円）を入力してください。",
    years: "投資を行う期間（年数）を指定します。投資期間が終了した後も2050年まで資産推移を予測します。",
    priceModel: (
        <React.Fragment>
            <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
            <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
        </React.Fragment>
    ),
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。",
};

const InvestmentSimulator: React.FC = () => {
    const [initialInvestmentType, setInitialInvestmentType] = useState<'btc' | 'jpy'>("btc");
    const [initialInvestment, setInitialInvestment] = useState<string>("");
    const [initialBtcHolding, setInitialBtcHolding] = useState<string>("");
    const [monthlyInvestment, setMonthlyInvestment] = useState<string>("");
    const [years, setYears] = useState<string>("10");
    const [priceModel, setPriceModel] = useState<PriceModel>(PriceModel.STANDARD);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
    const [exchangeRate, setExchangeRate] = useState<string>(DEFAULTS.EXCHANGE_RATE.toString());
    const [inflationRate, setInflationRate] = useState<string>(DEFAULTS.INFLATION_RATE.toString());
    const [isCalculating, setIsCalculating] = useState<boolean>(false);

    const { results, errors, simulate } = useInvestmentSimulation();

    const runSimulation = () => {
        setIsCalculating(true);
        const inputs: SimulationInputs = {
            initialInvestmentType,
            initialInvestment,
            initialBtcHolding,
            monthlyInvestment,
            years,
            priceModel,
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
            btcHeld: result.btcHeld,
            totalValue: result.totalValue,
            isInvestmentPeriod: result.isInvestmentPeriod,
        }));
    }, [results]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-gray-100 space-y-8">
            <div className={`${colors.cardBg} p-6 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                <h1 className={`${typography.h1} ${colors.textPrimary} mb-6 text-center bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 text-transparent`}>
                    ビットコイン積み立てシミュレーター
                </h1>

                <div className="space-y-6">
                    <InputField label="初期投資方法" tooltip={TOOLTIPS.initialInvestmentType}>
                        <div className="flex space-x-4 mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-amber-500 focus:ring-amber-500/50"
                                    name="initialInvestmentType"
                                    value="btc"
                                    checked={initialInvestmentType === "btc"}
                                    onChange={() => setInitialInvestmentType("btc")}
                                />
                                <span className={`${typography.body} ${colors.textSecondary} ml-2`}>すでにBTC保有</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-amber-500 focus:ring-amber-500/50"
                                    name="initialInvestmentType"
                                    value="jpy"
                                    checked={initialInvestmentType === "jpy"}
                                    onChange={() => setInitialInvestmentType("jpy")}
                                />
                                <span className={`${typography.body} ${colors.textSecondary} ml-2`}>日本円で投資</span>
                            </label>
                        </div>
                    </InputField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {initialInvestmentType === "jpy" ? (
                            <InputField label="初期投資額（円）" tooltip={TOOLTIPS.initialInvestment} error={errors.initialInvestment}>
                                <input
                                    type="number"
                                    value={initialInvestment}
                                    onChange={(e) => setInitialInvestment(e.target.value)}
                                    className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                    step="1000"
                                    placeholder="例: 100000"
                                    aria-label="初期投資額（円）"
                                />
                            </InputField>
                        ) : (
                            <InputField label="初期保有BTC" tooltip={TOOLTIPS.initialBtcHolding} error={errors.initialBtcHolding}>
                                <input
                                    type="number"
                                    value={initialBtcHolding}
                                    onChange={(e) => setInitialBtcHolding(e.target.value)}
                                    className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                    step="0.00000001"
                                    placeholder="例: 0.1"
                                    aria-label="初期保有BTC"
                                />
                            </InputField>
                        )}

                        <InputField label="毎月積み立て額（円）" tooltip={TOOLTIPS.monthlyInvestment} error={errors.monthlyInvestment}>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                                    className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} pr-12 focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                    step="1000"
                                    placeholder="例: 10000"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">円</span>
                            </div>
                        </InputField>

                        <InputField label="積み立て年数" tooltip={TOOLTIPS.years} error={errors.years}>
                            <input
                                type="number"
                                value={years}
                                onChange={(e) => setYears(e.target.value)}
                                className={`${colors.inputBg} w-full p-2 rounded-md ${colors.textPrimary} focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-300`}
                                step="1"
                                placeholder="例: 10"
                            />
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#5A5A6A" opacity={0.5} />
                                    <XAxis dataKey="year" stroke="#e2e8f0" tick={{ fontSize: 12, fill: '#e2e8f0' }} />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#34D399"
                                        tickFormatter={(value) => formatBTC(value, 4)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: 'BTC保有量',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#34D399', fontSize: 12, fontWeight: 500 },
                                        }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#60A5FA"
                                        tickFormatter={(value) => formatYen(value, 2)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: '資産評価額',
                                            angle: 90,
                                            position: 'insideRight',
                                            style: { fill: '#60A5FA', fontSize: 12, fontWeight: 500 },
                                        }}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.95)', border: '1px solid rgba(82, 82, 91, 0.8)', borderRadius: '8px' }}
                                        labelStyle={{ color: '#e2e8f0' }}
                                        formatter={(value: number, name: string) =>
                                            name === "btcHeld" ? [formatBTC(value, 4), "BTC保有量"] : [formatYen(value, 2), "資産評価額"]
                                        }
                                    />
                                    <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '10px' }} verticalAlign="top" height={36} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="btcHeld"
                                        name="BTC保有量"
                                        stroke="#34D399"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="totalValue"
                                        name="資産評価額"
                                        stroke="#60A5FA"
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
                                    <div className={`${typography.small} ${colors.textMuted}`}>初期投資額</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {initialInvestmentType === "jpy"
                                            ? formatYen(parseFloat(initialInvestment) || 0, 2)
                                            : formatBTC(parseFloat(initialBtcHolding) || 0, 4)}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>月額積立金</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {formatYen(parseFloat(monthlyInvestment) || 0, 2)}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>5年後の資産</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {formatYen(results.find(r => r.year === CURRENT_YEAR + 5)?.totalValue || 0, 2)}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>10年後の資産</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {formatYen(results.find(r => r.year === CURRENT_YEAR + 10)?.totalValue || 0, 2)}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-md">
                                    <div className={`${typography.small} ${colors.textMuted}`}>シミュレーション終了時の資産</div>
                                    <div className={`${typography.body} ${colors.textPrimary}`}>
                                        {formatYen(results[results.length - 1]?.totalValue || 0, 2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`hidden md:block ${colors.cardBg} p-6 rounded-xl ${colors.cardBorder} ${colors.shadowGlow}`}>
                            <h3 className={`${typography.h3} ${colors.textPrimary} mb-4`}>シミュレーション結果</h3>
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="min-w-full divide-y divide-gray-700/50">
                                    <thead className="bg-gray-800/50">
                                        <tr>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>年</th>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>BTC価格</th>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>年間積み立て額</th>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>追加BTC量</th>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>BTC保有量</th>
                                            <th className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>資産評価額</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {results.map((result, index) => (
                                            <tr key={index} className={index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-750/30 hover:bg-gray-700/50 transition-colors duration-200"}>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{result.year}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.btcPrice, 2)}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.annualInvestment, 2)}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatBTC(result.btcPurchased, 4)}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatBTC(result.btcHeld, 4)}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.totalValue, 2)}</td>
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

export default InvestmentSimulator;