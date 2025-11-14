'use client';

import { useState } from 'react';
import PropertyInputForm from '@/components/PropertyInputForm';
import ValuationResultDisplay from '@/components/ValuationResult';
import { AnalysisResponse } from '@/types';

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleAnalysisComplete = (analysisResult: AnalysisResponse) => {
    setResult(analysisResult);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            부동산 감정가 평가 시스템
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI 기반 정밀 부동산 가치 분석 서비스
          </p>
        </header>

        {!result ? (
          <PropertyInputForm onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors duration-200"
              >
                새로운 분석하기
              </button>
            </div>
            <ValuationResultDisplay result={result} />
          </>
        )}
      </div>
    </main>
  );
}
