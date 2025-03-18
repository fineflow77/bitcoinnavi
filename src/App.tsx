import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './pages/Home';
import InvestmentSimulator from './components/simulators/InvestmentSimulator';
import WithdrawalSimulator from './components/simulators/WithdrawalSimulator';
import PowerLawExplanation from './pages/PowerLawExplanation';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulators/investment" element={<InvestmentSimulator />} />
          <Route path="/simulators/withdrawal" element={<WithdrawalSimulator />} />
          <Route path="/power-law-explanation" element={<PowerLawExplanation />} />
        </Routes>
      </main>
      <footer className="text-center text-gray-400 mt-12 py-4 border-t border-gray-800">
        <p>
          © {new Date().getFullYear()} BTCパワーロー博士{' '}
          <a
            href="https://x.com/lovewaves711"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            @lovewaves711
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;