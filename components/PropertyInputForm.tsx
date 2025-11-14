'use client';

import { useState } from 'react';
import { PropertyInput, AnalysisResponse } from '@/types';

interface PropertyInputFormProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

export default function PropertyInputForm({ onAnalysisComplete }: PropertyInputFormProps) {
  const [address, setAddress] = useState('');
  const [pyeong, setPyeong] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const propertyData: PropertyInput = {
        address,
        pyeong: parseFloat(pyeong),
        squareMeters: parseFloat(pyeong) * 3.3058, // 평을 제곱미터로 변환
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property: propertyData,
          aiProvider,
        }),
      });

      const data: AnalysisResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      onAnalysisComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        부동산 감정가 평가
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            주소
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="예: 서울특별시 강남구 역삼동 123-45"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="pyeong" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            평형
          </label>
          <input
            type="number"
            id="pyeong"
            value={pyeong}
            onChange={(e) => setPyeong(e.target.value)}
            required
            step="0.1"
            min="0"
            placeholder="예: 32"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          {pyeong && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              약 {(parseFloat(pyeong) * 3.3058).toFixed(2)}㎡
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI 분석 제공자
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="both"
                checked={aiProvider === 'both'}
                onChange={(e) => setAiProvider(e.target.value as 'both')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">양쪽 모두 (OpenAI + Claude)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="openai"
                checked={aiProvider === 'openai'}
                onChange={(e) => setAiProvider(e.target.value as 'openai')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">OpenAI만</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="claude"
                checked={aiProvider === 'claude'}
                onChange={(e) => setAiProvider(e.target.value as 'claude')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Claude만</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors duration-200"
        >
          {isLoading ? '분석 중...' : '감정가 분석하기'}
        </button>
      </form>
    </div>
  );
}
