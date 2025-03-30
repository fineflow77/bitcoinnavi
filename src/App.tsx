import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { X } from 'lucide-react'; // Twitter から X に変更
import Header from './components/layout/Header';
import { useBitcoinData } from './hooks/useBitcoinData';

// ページを動的インポート
const Dashboard = lazy(() => import('./pages/Home'));
const BitcoinBasics = lazy(() => import('./pages/BitcoinBasics'));
const AnalysisNews = lazy(() => import('./pages/AnalysisNews'));
const PowerLawExplanation = lazy(() => import('./pages/PowerLawExplanation'));
const InvestmentSimulator = lazy(() => import('./components/simulators/InvestmentSimulator'));
const WithdrawalSimulator = lazy(() => import('./components/simulators/WithdrawalSimulator'));
const PowerLawChart = lazy(() => import('./components/charts/PowerLawChart'));

const App: React.FC = () => {
  const {
    loading,
    error,
    currentPrice,
    powerLawData,
    exchangeRate,
    rSquared,
  } = useBitcoinData();

  const shareUrl = window.location.href;
  const shareText = 'ビットコイン長期投資研究所で価格予測をチェック！';

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[500px] bg-gray-800 rounded-lg"><p className="text-xl text-gray-400">Loading...</p></div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bitcoin-basics" element={<BitcoinBasics />} />
            <Route path="/analysis-news" element={<AnalysisNews />} />
            <Route path="/simulators/investment" element={<InvestmentSimulator />} />
            <Route path="/simulators/withdrawal" element={<WithdrawalSimulator />} />
            <Route
              path="/power-law-explanation"
              element={
                <PowerLawExplanation
                  chartComponent={
                    loading ? (
                      <div className="flex items-center justify-center min-h-[500px] bg-gray-800 rounded-lg">
                        <p className="text-xl text-gray-400">Loading...</p>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center min-h-[500px] bg-gray-800 rounded-lg">
                        <p className="text-xl text-red-500">Error: {error.message}</p>
                      </div>
                    ) : (
                      <PowerLawChart
                        exchangeRate={exchangeRate || 1}
                        rSquared={rSquared || 0}
                        chartData={powerLawData || []}
                        currentPrice={currentPrice?.prices.usd ?? 0}
                        height={500}
                      />
                    )
                  }
                />
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer className="bg-[#1a202c] py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>※ 予測は理論モデルに基づく参考値です。投資は自己責任で。</p>
          <p className="mt-2">
            © 2025 ビットコイン長期投資研究所{' '}
            <a href="https://x.com/DrPowerLaw" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:text-[#2b6cb0]">
              @DrPowerLaw
            </a>
          </p>
          <div className="mt-2 flex justify-center">
            <button
              onClick={shareToTwitter}
              className="text-gray-400 hover:text-[#3B82F6] transition-colors duration-300"
              aria-label="Xでシェア"
            >
              <X size={20} /> {/* Twitter アイコンを X アイコンに変更 */}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;