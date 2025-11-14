'use client';

import { useState } from 'react';
import { PropertyInput, AnalysisResponse } from '@/types';

interface PropertyInputFormProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

export default function PropertyInputForm({ onAnalysisComplete }: PropertyInputFormProps) {
  const [address, setAddress] = useState('');
  const [exclusiveArea, setExclusiveArea] = useState('');
  const [buildYear, setBuildYear] = useState('');
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
        buildYear: parseInt(buildYear),
        exclusiveArea: parseFloat(exclusiveArea),
        pyeong: parseFloat(exclusiveArea) / 3.3058, // 제곱미터를 평으로 변환
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
    <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/90 text-slate-900 shadow-2xl shadow-black/20 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-200/30 via-transparent to-sky-200/20 dark:from-indigo-500/10 dark:to-sky-500/5" />
      <div className="relative p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white dark:bg-white/10">
            AI Valuation
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">5분 내 상세 리포트</span>
        </div>
        <h2 className="mt-4 text-3xl font-semibold">주소만 입력하면 바로 감정 시작</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          실거래·입지·개발 계획을 한 번에 분석합니다. 정확한 주소와 전용면적을 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-slate-600 dark:text-slate-200">
              주소
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="예: 서울특별시 강남구 역삼동 123-45"
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-base placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="buildYear" className="text-sm font-medium text-slate-600 dark:text-slate-200">
              건축년도
            </label>
            <input
              type="number"
              id="buildYear"
              value={buildYear}
              onChange={(e) => setBuildYear(e.target.value)}
              required
              min="1900"
              max={new Date().getFullYear()}
              placeholder="예: 2015"
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-base placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">등기부등본 또는 건축물대장 기준 준공년도를 입력하세요.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="exclusiveArea" className="text-sm font-medium text-slate-600 dark:text-slate-200">
              전용면적 (㎡)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="number"
                id="exclusiveArea"
                value={exclusiveArea}
                onChange={(e) => setExclusiveArea(e.target.value)}
                required
                step="0.01"
                min="0"
                placeholder="예: 84.50"
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-base placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
              />
              {exclusiveArea && (
                <div className="flex min-w-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  {(parseFloat(exclusiveArea) / 3.3058).toFixed(2)}평
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">등기부등본 또는 분양공고 기준 전용면적을 입력하세요.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
              AI 분석 제공자
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: 'both', label: '듀얼 모드', desc: 'OpenAI + Claude 비교' },
                { value: 'openai', label: 'OpenAI', desc: 'OpenAI 심층 분석' },
                { value: 'claude', label: 'Claude', desc: 'Claude' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={aiProvider === option.value}
                    onChange={(e) => setAiProvider(e.target.value as typeof aiProvider)}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-700 transition group-hover:text-indigo-600 peer-checked:text-indigo-600 dark:text-slate-100">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{option.desc}</span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent transition peer-checked:ring-indigo-400 peer-checked:ring-offset-2 peer-checked:ring-offset-white dark:peer-checked:ring-indigo-500/70 dark:peer-checked:ring-offset-slate-900" />
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '분석 중...' : 'AI 감정 리포트 생성'}
          </button>
        </form>
      </div>
    </div>
  );
}
