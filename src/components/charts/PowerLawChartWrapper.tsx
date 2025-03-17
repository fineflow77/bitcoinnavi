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
    powerLawPosition: number | null;
}

const PowerLawChartWrapper: React.FC<PowerLawChartWrapperProps> = (props) => {
    return (
        <>
            <PowerLawChart
                rSquared={props.rSquared}
                chartData={props.chartData}
                exchangeRate={props.exchangeRate}
                currentPrice={props.currentPrice}
                height={props.height}
                powerLawPosition={props.powerLawPosition}
                showRSquared={false}

            />
            <LogLogPowerLawChart
                rSquared={props.rSquared}
                chartData={props.chartData}
                exchangeRate={props.exchangeRate}
                currentPrice={props.currentPrice}
                height={700}
                powerLawPosition={props.powerLawPosition}
                showRSquared={true}

            />
        </>
    );
};

export default PowerLawChartWrapper;