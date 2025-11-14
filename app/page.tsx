'use client';

import { useMemo, useState } from 'react';
import PropertyInputForm from '@/components/PropertyInputForm';
import ValuationResultDisplay from '@/components/ValuationResult';
import { AnalysisResponse, ValuationResult as ValuationResultType } from '@/types';

const highlightStats = [
  {
    label: '실거래 레이어',
    value: '6개월 누적',
    caption: '국토부·카카오 행정동 코드 매칭',
  },
  {
    label: 'AI 듀얼 엔진',
    value: 'OpenAI + Claude',
    caption: '모델별 프리미엄 분석 비교',
  },
  {
    label: '입지 시그널',
    value: '실시간 5종',
    caption: '지하철·학교·의료·상권·공원',
  },
];

const sellingPoints = [
  '실거래, 입지, AI 분석을 하나의 리포트로',
  '법정동 단위 개발계획 및 규제 조회',
  '투명한 근거와 신뢰할 수 있는 점수 체계',
];

function extractPrimaryValuation(result: AnalysisResponse | null): ValuationResultType | null {
  if (!result?.success || !result.data) return null;
  const { valuation } = result.data;

  if ('estimatedPrice' in valuation) {
    return valuation as ValuationResultType;
  }

  const multiValuation = valuation as { openai?: ValuationResultType; claude?: ValuationResultType };
  return multiValuation.openai ?? multiValuation.claude ?? null;
}

function formatCurrencyKRW(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const primaryValuation = useMemo(() => extractPrimaryValuation(result), [result]);

  const handleAnalysisComplete = (analysisResult: AnalysisResponse) => {
    setResult(analysisResult);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-200px] h-[420px] bg-gradient-to-r from-indigo-500/40 via-sky-400/30 to-emerald-400/30 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <p className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                Real Estate Intelligence Studio
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                섬세한 <span className="text-sky-300">AI 부동산 평가</span>
              </h1>
              <p className="mt-4 text-lg text-slate-200">
                주소 한 줄로 시작하는 럭셔리한 감정 경험. AI가 실거래 데이터, 입지 신호, 도시계획을 한눈에
                펼쳐줍니다.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {sellingPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">●</span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {highlightStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-inner shadow-black/20"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{stat.caption}</p>
                  </div>
                ))}
              </div>
            </div>

            {result && result.data && primaryValuation && (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Latest insight</p>
                    <h2 className="mt-2 text-2xl font-semibold">{result.data.property.address}</h2>
                    <p className="text-sm text-slate-300">
                      {result.data.property.exclusiveArea.toFixed(1)}㎡ ·{' '}
                      {(result.data.property.pyeong ?? result.data.property.exclusiveArea / 3.3058).toFixed(1)}평
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">평균 예상가</p>
                    <p className="text-3xl font-bold text-sky-200">
                      {formatCurrencyKRW(primaryValuation.estimatedPrice.average)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatCurrencyKRW(primaryValuation.pricePerSquareMeter.average)} / ㎡
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    종합 점수 {primaryValuation.analysis.overallScore}/10
                  </span>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    시장 트렌드 체크 완료
                  </span>
                  <button
                    onClick={handleReset}
                    className="ml-auto inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                  >
                    새로운 분석하기
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="lg:sticky lg:top-10">
            {!result ? (
              <PropertyInputForm onAnalysisComplete={handleAnalysisComplete} />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">분석 완료</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">결과가 준비되었습니다</h3>
                <p className="mt-2 text-sm text-slate-300">
                  아래 리포트에서 입지, 실거래, 개발계획까지 한눈에 확인하세요.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-6 w-full rounded-2xl bg-white/90 px-4 py-3 text-base font-semibold text-slate-900 transition hover:bg-white"
                >
                  새 주소로 다시 분석
                </button>
              </div>
            )}
          </section>
        </div>

        {result && (
          <div className="mt-14">
            <ValuationResultDisplay result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
