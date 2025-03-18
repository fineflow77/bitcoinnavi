import React, { useMemo, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Label, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { HALVING_EVENTS } from '../../utils/constants';
import { BITCOIN_GENESIS_DATE, getDaysSinceGenesis, toJapaneseDate } from '../../utils/dateUtils';
import { calculatePowerLawPosition, calculateSupportDeviation, getPowerLawPositionLabel, getPowerLawPositionColor } from '../../utils/models';

export interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    resistanceModel?: number;
    isFuture: boolean;
    daysSinceGenesis: number;
}

export interface PowerLawChartProps {
    exchangeRate: number;
    rSquared: number | null;
    chartData: ChartDataPoint[];
    currentPrice: number | undefined;
    height?: number;
    xAxisScale?: 'linear' | 'log';
    yAxisScale?: 'linear' | 'log';
    showRSquared?: boolean;
}

interface TooltipContentProps {
    active?: boolean;
    payload?: any[];
    label?: number;
    exchangeRate: number;
}

const COLORS = {
    price: '#F7931A',
    median: '#4CAF50',
    support: '#EF4444', // モダンなダークレッドに変更
    grid: '#5A5A6A',
    halving: 'rgba(255, 255, 255, 0.25)',
    tooltip: { bg: 'rgba(26, 32, 44, 0.95)', border: 'rgba(82, 82, 91, 0.8)' },
    plotAreaBg: '#000000',
    legendText: '#e2e8f0',
    priceArea: 'rgba(255, 149, 0, 0.1)',
    supportArea: 'rgba(239, 68, 68, 0.1)', // サポートエリアも調整
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
};

const CHART_CONFIG = {
    PRICE_LINE_WIDTH: 1.5,
    MODEL_LINE_WIDTH: 2,
    REFERENCE_LINE_WIDTH: 2,
    MARGIN: { top: 20, right: 10, left: 20, bottom: 20 },
    MARGIN_MOBILE: { top: 10, right: 5, left: 5, bottom: 10 },
};

const TooltipContent: React.FC<TooltipContentProps> = ({ active, payload, label, exchangeRate }) => {
    if (!active || !payload || !payload.length || label === undefined) return null;

    const data = payload[0].payload as ChartDataPoint;
    const actualDate = new Date(BITCOIN_GENESIS_DATE.getTime() + label * 24 * 60 * 60 * 1000);
    const date = toJapaneseDate(actualDate);

    const formatPrice = (value: number): string => {
        const jpy = formatCurrency(value * exchangeRate, 'JPY').replace(/[\$,]/g, '').replace('JPY', '¥');
        const usd = formatCurrency(value, 'USD');
        return `${jpy} (${usd})`;
    };

    const powerLawPosition = data.price !== null ? calculatePowerLawPosition(data.price, data.medianModel, data.supportModel) : null;
    const supportDeviation = data.price !== null ? calculateSupportDeviation(data.price, data.supportModel) : null;
    const positionLabel = getPowerLawPositionLabel(powerLawPosition, supportDeviation);
    const positionColor = getPowerLawPositionColor(powerLawPosition, supportDeviation);

    return (
        <div
            className="p-3 rounded-lg shadow-lg"
            style={{
                backgroundColor: COLORS.tooltip.bg,
                border: `1px solid ${COLORS.tooltip.border}`,
                color: '#fff',
                fontSize: '14px',
            }}
        >
            <p className="font-semibold mb-2">{date}</p>
            {!data.isFuture && data.price !== null && (
                <p className={COLORS.textPrimary}>
                    実際価格: <span style={{ color: COLORS.price }}>{formatPrice(data.price)}</span>
                </p>
            )}
            <p className={COLORS.textPrimary}>
                中央価格: <span style={{ color: COLORS.median }}>{formatPrice(data.medianModel)}</span>
            </p>
            <p className={COLORS.textPrimary}>
                下限価格: <span style={{ color: COLORS.support }}>{formatPrice(data.supportModel)}</span>
            </p>
            {powerLawPosition !== null && (
                <p className={COLORS.textPrimary}>
                    パワーロー位置:{' '}
                    <span style={{ color: positionColor }}>
                        {powerLawPosition.toFixed(2)}% ({positionLabel})
                    </span>
                </p>
            )}
        </div>
    );
};

const generateYearTicks = (minDays: number, maxDays: number): number[] => {
    const ticks: number[] = [];
    let year = 2010;
    while (true) {
        const dateOfYear = new Date(year, 0, 1);
        const days = getDaysSinceGenesis(dateOfYear);
        if (days > maxDays) break;
        if (days >= minDays) ticks.push(days);
        year += 2;
        if (year > 2040) break;
    }
    return ticks;
};

const PowerLawChart: React.FC<PowerLawChartProps> = ({
    exchangeRate,
    rSquared,
    chartData,
    height = 400,
    xAxisScale = 'linear',
    yAxisScale = 'log',
    showRSquared = true,
}) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 640);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const dataWithDays = useMemo(() => {
        return chartData.map(point => ({
            ...point,
            daysSinceGenesis: getDaysSinceGenesis(new Date(point.date)),
        }));
    }, [chartData]);

    const { domain, yearTicks, yDomainMax } = useMemo(() => {
        if (!dataWithDays.length) {
            return { domain: [0, 0] as [number, number], yearTicks: [], yDomainMax: 1000 };
        }
        const minDays = Math.min(...dataWithDays.map(d => d.daysSinceGenesis));
        const maxDays = Math.max(...dataWithDays.map(d => d.daysSinceGenesis));
        const maxPrice = Math.max(...dataWithDays.map(d => Math.max(d.price || 0, d.medianModel, d.supportModel)));
        const yMax = yAxisScale === 'log' ? Math.pow(10, Math.ceil(Math.log10(maxPrice * 1.2))) : maxPrice * 1.2;
        return { domain: [minDays, maxDays] as [number, number], yearTicks: generateYearTicks(minDays, maxDays), yDomainMax: yMax };
    }, [dataWithDays, yAxisScale]);

    if (!chartData.length) {
        return <div className="text-gray-400 text-center p-2 bg-gray-800/50 rounded-lg">データがありません</div>;
    }

    const hasPastData = chartData.some(item => !item.isFuture && item.price !== null);
    if (!hasPastData) {
        return <div className="text-gray-400 text-center p-2 bg-gray-800/50 rounded-lg">過去の価格データがロードされていません</div>;
    }

    return (
        <div className="bg-gray-800/50 rounded-xl shadow-md border border-gray-700/30 overflow-hidden">
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={dataWithDays} margin={isMobile ? CHART_CONFIG.MARGIN_MOBILE : CHART_CONFIG.MARGIN}>
                    <ReferenceArea
                        x1={domain[0]}
                        x2={domain[1]}
                        y1={yAxisScale === 'log' ? 0.1 : 0}
                        y2={yDomainMax}
                        fill={COLORS.plotAreaBg}
                        fillOpacity={1}
                        yAxisId="left"
                        strokeWidth={0}
                    />
                    <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" opacity={0.5} vertical={true} horizontal={true} />
                    <Legend
                        verticalAlign="bottom"
                        align="right"
                        wrapperStyle={{
                            color: COLORS.legendText,
                            fontSize: isMobile ? '10px' : '12px',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            bottom: 10,
                            right: 10,
                            position: 'absolute',
                        }}
                        formatter={(value: string) => {
                            const color = value === 'price' ? COLORS.price : value === 'medianModel' ? COLORS.median : value === 'supportModel' ? COLORS.support : COLORS.legendText;
                            return (
                                <span style={{ color, marginRight: '10px', fontWeight: 500 }}>
                                    {value === 'price' ? '実際価格' : value === 'medianModel' ? '中央価格 (予測)' : '下限価格 (予測)'}
                                </span>
                            );
                        }}
                        layout="horizontal"
                    />
                    {HALVING_EVENTS.map((event, index) => {
                        const eventDate = new Date(event.date).getTime();
                        if (eventDate >= domain[0] && eventDate <= domain[1]) {
                            return (
                                <ReferenceArea
                                    key={`halving-${index}`}
                                    x1={eventDate - 3 * 24 * 60 * 60 * 1000}
                                    x2={eventDate + 3 * 24 * 60 * 60 * 1000}
                                    fill={COLORS.halving}
                                    fillOpacity={0.5}
                                    yAxisId="left"
                                    strokeWidth={0}
                                >
                                    <Label
                                        value={event.label}
                                        position="insideTop"
                                        fill="#fff"
                                        fontSize={isMobile ? 8 : 10}
                                        fontWeight="normal"
                                        offset={5}
                                        opacity={0.8}
                                    />
                                </ReferenceArea>
                            );
                        }
                        return null;
                    })}
                    <XAxis
                        dataKey="daysSinceGenesis"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(days: number) => new Date(BITCOIN_GENESIS_DATE.getTime() + days * 86400000).getFullYear().toString()}
                        tick={{ fontSize: isMobile ? 8 : 10, fill: COLORS.legendText, fontWeight: 'bold' }}
                        ticks={yearTicks}
                        domain={domain}
                        allowDataOverflow={true}
                        type="number"
                        scale={xAxisScale}
                        minTickGap={10}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        scale={yAxisScale}
                        domain={[yAxisScale === 'log' ? 0.1 : 0, yDomainMax]}
                        tickFormatter={(value: number) => formatCurrency(value * exchangeRate, 'JPY').replace(/[\$,]/g, '').replace('JPY', '¥').slice(0, -3)}
                        tick={{ fontSize: isMobile ? 8 : 10, fill: COLORS.legendText }}
                        width={isMobile ? 30 : 40}
                        label={{
                            value: '価格 (円)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#fff', fontSize: isMobile ? 8 : 10, fontWeight: 500 },
                            dx: isMobile ? -2 : -5,
                        }}
                    />
                    <Tooltip
                        content={<TooltipContent exchangeRate={exchangeRate} />}
                        wrapperStyle={{ outline: 'none', fontSize: '12px' }}
                        isAnimationActive={true}
                    />
                    <ReferenceArea
                        y1={0}
                        y2={dataWithDays.reduce((min, p) => Math.min(p.supportModel, min), Infinity)}
                        fill={COLORS.supportArea}
                        fillOpacity={0.2}
                        yAxisId="left"
                    />
                    <ReferenceArea
                        y1={dataWithDays.reduce((min, p) => Math.min(p.supportModel, min), Infinity)}
                        y2={dataWithDays.reduce((max, p) => Math.max(p.medianModel, max), -Infinity)}
                        fill={COLORS.priceArea}
                        fillOpacity={0.2}
                        yAxisId="left"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="price"
                        name="price"
                        stroke={COLORS.price}
                        strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={true}
                        activeDot={{ r: 5, fill: COLORS.price, strokeWidth: 1, stroke: '#fff' }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="medianModel"
                        name="medianModel"
                        stroke={COLORS.median}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        strokeDasharray="5 5"
                        connectNulls={true}
                        isAnimationActive={true}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="supportModel"
                        name="supportModel"
                        stroke={COLORS.support}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
            {showRSquared && rSquared !== null && (
                <div
                    className="absolute top-2 left-4 bg-gray-800/90 text-white rounded-lg p-2 shadow-lg border border-gray-700/50"
                    style={{ zIndex: 10 }}
                >
                    <span className="font-medium">決定係数 (R²): </span>
                    <span className="font-bold text-blue-400">{rSquared.toFixed(4)}</span>
                </div>
            )}
        </div>
    );
};

export default PowerLawChart;