import { useState } from 'react';
import { getDaysSinceGenesis } from '../utils/dateUtils';
import { btcPriceMedian } from '../utils/models';
import { CURRENT_YEAR, TRANSITION_START_YEAR, TARGET_YEAR, PriceModel } from '../utils/constants';

export interface WithdrawalInputs {
    initialBTC: string;
    startYear: string;
    priceModel: PriceModel;
    withdrawalType: 'fixed' | 'percentage';
    withdrawalAmount: string;
    withdrawalRate: string;
    showSecondPhase: boolean;
    secondPhaseYear: string;
    secondPhaseType: 'fixed' | 'percentage';
    secondPhaseAmount: string;
    secondPhaseRate: string;
    taxRate: string;
    exchangeRate: string;
    inflationRate: string;
}

export interface WithdrawalSimulationResult {
    year: number;
    btcPrice: number;
    withdrawalRate: number | string;
    withdrawalAmount: number | string;
    withdrawalBTC: number | string;
    remainingBTC: number;
    totalValue: number;
    phase: string;
}

interface SimulationErrors {
    initialBTC?: string;
    startYear?: string;
    withdrawalAmount?: string;
    withdrawalRate?: string;
    secondPhaseYear?: string;
    secondPhaseAmount?: string;
    secondPhaseRate?: string;
    taxRate?: string;
    exchangeRate?: string;
    inflationRate?: string;
    simulation?: string;
}

export const useWithdrawalSimulation = () => {
    const [results, setResults] = useState<WithdrawalSimulationResult[]>([]);
    const [errors, setErrors] = useState<SimulationErrors>({});

    const validateInputs = (inputs: WithdrawalInputs): boolean => {
        const newErrors: SimulationErrors = {};

        if (!inputs.initialBTC || isNaN(parseFloat(inputs.initialBTC)) || parseFloat(inputs.initialBTC) < 0) {
            newErrors.initialBTC = '有効な値を入力してください';
        }

        if (inputs.withdrawalType === 'fixed') {
            if (!inputs.withdrawalAmount || isNaN(parseFloat(inputs.withdrawalAmount)) || parseFloat(inputs.withdrawalAmount) <= 0) {
                newErrors.withdrawalAmount = '有効な値を入力してください';
            }
        } else {
            if (!inputs.withdrawalRate || isNaN(parseFloat(inputs.withdrawalRate)) || parseFloat(inputs.withdrawalRate) <= 0 || parseFloat(inputs.withdrawalRate) > 100) {
                newErrors.withdrawalRate = '0～100%で入力してください';
            }
        }

        if (inputs.showSecondPhase) {
            if (inputs.secondPhaseType === 'fixed' && (!inputs.secondPhaseAmount || isNaN(parseFloat(inputs.secondPhaseAmount)) || parseFloat(inputs.secondPhaseAmount) <= 0)) {
                newErrors.secondPhaseAmount = '有効な値を入力してください';
            }
            if (inputs.secondPhaseType === 'percentage' && (!inputs.secondPhaseRate || isNaN(parseFloat(inputs.secondPhaseRate)) || parseFloat(inputs.secondPhaseRate) <= 0 || parseFloat(inputs.secondPhaseRate) > 100)) {
                newErrors.secondPhaseRate = '0～100%で入力してください';
            }
            if (parseInt(inputs.secondPhaseYear) <= parseInt(inputs.startYear)) {
                newErrors.secondPhaseYear = '開始年より後にしてください';
            }
        }

        if (parseFloat(inputs.taxRate) < 0 || parseFloat(inputs.taxRate) > 100) {
            newErrors.taxRate = '0～100%で入力してください';
        }
        if (parseFloat(inputs.exchangeRate) <= 0) {
            newErrors.exchangeRate = '0より大きくしてください';
        }
        if (parseFloat(inputs.inflationRate) < 0) {
            newErrors.inflationRate = '0%以上で入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const simulate = (inputs: WithdrawalInputs): void => {
        if (!validateInputs(inputs)) return;

        try {
            let currentBTC = parseFloat(inputs.initialBTC);
            const simulationResults: WithdrawalSimulationResult[] = [];
            const exchangeRateNum = parseFloat(inputs.exchangeRate);
            const taxRateNum = parseFloat(inputs.taxRate) / 100;
            const inflationRateNum = parseFloat(inputs.inflationRate) / 100;
            const startYearNum = parseInt(inputs.startYear);
            let basePriceUSD = 0; // nullを防ぐ
            let baseDays = 0; // nullを防ぐ

            for (let year = CURRENT_YEAR; year <= TARGET_YEAR; year++) {
                const isBeforeStart = year < startYearNum;
                const days = getDaysSinceGenesis(new Date(year, 0, 1));

                let btcPriceUSD = btcPriceMedian(days, inputs.priceModel) || 0;
                if (year >= TRANSITION_START_YEAR) {
                    if (basePriceUSD === 0) {
                        basePriceUSD = btcPriceMedian(getDaysSinceGenesis(new Date(TRANSITION_START_YEAR - 1, 0, 1)), inputs.priceModel) || 0;
                        baseDays = getDaysSinceGenesis(new Date(TRANSITION_START_YEAR - 1, 0, 1));
                    }
                    const decayRate = inputs.priceModel === PriceModel.STANDARD ? 0.2 : 0.25;
                    const targetScale = inputs.priceModel === PriceModel.STANDARD ? 0.41 : 0.5;
                    const scale = targetScale + (1.0 - targetScale) * Math.exp(-decayRate * (year - (TRANSITION_START_YEAR - 1)));
                    const medianPrice = btcPriceMedian(days, inputs.priceModel) || 0;
                    const baseMedianPrice = btcPriceMedian(baseDays, inputs.priceModel) || 1; // ゼロ除算を防ぐ
                    btcPriceUSD = basePriceUSD * Math.pow(medianPrice / baseMedianPrice, scale);
                }

                if (!btcPriceUSD || btcPriceUSD <= 0) {
                    throw new Error(`Invalid BTC price calculated for year ${year}: ${btcPriceUSD}`);
                }

                const effectiveExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYearNum);
                const btcPriceJPY = btcPriceUSD * effectiveExchangeRate;

                let withdrawalBTC = 0;
                let withdrawalValue = 0;
                let effectiveWithdrawalRate = 0;

                if (!isBeforeStart) {
                    let currentWithdrawalType = inputs.withdrawalType;
                    let currentWithdrawalAmount = inputs.withdrawalAmount;
                    let currentWithdrawalRate = inputs.withdrawalRate;

                    if (inputs.showSecondPhase && year >= parseInt(inputs.secondPhaseYear)) {
                        currentWithdrawalType = inputs.secondPhaseType;
                        currentWithdrawalAmount = inputs.secondPhaseAmount;
                        currentWithdrawalRate = inputs.secondPhaseRate;
                    }

                    if (currentWithdrawalType === 'fixed') {
                        const annualWithdrawalAmount = parseFloat(currentWithdrawalAmount) * 12;
                        const taxableAmount = annualWithdrawalAmount * taxRateNum;
                        const totalWithdrawal = annualWithdrawalAmount + taxableAmount;
                        withdrawalBTC = totalWithdrawal / btcPriceJPY;
                        withdrawalValue = annualWithdrawalAmount;
                        if (withdrawalBTC > currentBTC) {
                            throw new Error(`Withdrawal amount exceeds available BTC in year ${year}.`);
                        }
                        effectiveWithdrawalRate = (withdrawalBTC / currentBTC) * 100;
                    } else {
                        effectiveWithdrawalRate = parseFloat(currentWithdrawalRate);
                        withdrawalBTC = currentBTC * (effectiveWithdrawalRate / 100);
                        withdrawalValue = withdrawalBTC * btcPriceJPY;
                        const taxableAmount = withdrawalValue * taxRateNum;
                        withdrawalValue -= taxableAmount;
                        if (withdrawalBTC > currentBTC) {
                            withdrawalBTC = currentBTC;
                            withdrawalValue = withdrawalBTC * btcPriceJPY * (1 - taxRateNum);
                        }
                    }
                }

                const yearEndBTC = currentBTC - withdrawalBTC;
                const totalValue = currentBTC * btcPriceJPY;

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    withdrawalRate: isBeforeStart ? '-' : effectiveWithdrawalRate,
                    withdrawalAmount: isBeforeStart ? '-' : withdrawalValue,
                    withdrawalBTC: isBeforeStart ? '-' : withdrawalBTC,
                    remainingBTC: yearEndBTC,
                    totalValue,
                    phase: isBeforeStart ? '-' : (inputs.showSecondPhase && year >= parseInt(inputs.secondPhaseYear)) ? '2段階目' : (inputs.showSecondPhase ? '1段階目' : '-'),
                });

                currentBTC = yearEndBTC;
                if (currentBTC < 0 || year >= TARGET_YEAR) break;
            }

            setResults(simulationResults);
            setErrors({});
        } catch (err: any) {
            setErrors({ simulation: 'シミュレーション中にエラーが発生しました: ' + err.message });
        }
    };

    return {
        results,
        errors,
        simulate,
        validateInputs
    };
};