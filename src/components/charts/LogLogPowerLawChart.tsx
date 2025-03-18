import React from 'react';
import PowerLawChart, { PowerLawChartProps } from './PowerLawChart';

interface LogLogPowerLawChartProps extends Omit<PowerLawChartProps, 'xAxisScale' | 'yAxisScale' | 'height'> {
    height?: number;
}

const LogLogPowerLawChart: React.FC<LogLogPowerLawChartProps> = (props) => {
    return (
        <PowerLawChart
            {...props}
            xAxisScale="log"
            yAxisScale="log"
            height={props.height ?? 400}
        />
    );
};

export default LogLogPowerLawChart;