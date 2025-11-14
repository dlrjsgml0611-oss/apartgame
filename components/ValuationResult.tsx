'use client';

import {
  AnalysisResponse,
  RealEstateTransaction,
  ValuationResult as ValuationResultType,
} from '@/types';

interface ValuationResultProps {
  result: AnalysisResponse;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price);
}

function SingleValuationDisplay({ valuation, title }: { valuation: ValuationResultType; title?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-6 text-slate-900 shadow-2xl shadow-black/5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/30 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_50%)]" />
      <div className="relative space-y-6">
        {title && (
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
            {title}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <PriceStat label="최소" value={valuation.estimatedPrice.min} accent="text-slate-500" />
          <PriceStat label="평균" value={valuation.estimatedPrice.average} accent="text-indigo-600 dark:text-indigo-300" large />
          <PriceStat label="최대" value={valuation.estimatedPrice.max} accent="text-slate-600 dark:text-slate-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PriceStat label="㎡당 최소" value={valuation.pricePerSquareMeter.min} />
          <PriceStat label="㎡당 평균" value={valuation.pricePerSquareMeter.average} accent="text-emerald-600 dark:text-emerald-300" />
          <PriceStat label="㎡당 최대" value={valuation.pricePerSquareMeter.max} />
        </div>

        <div className="rounded-2xl border border-slate-100/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">종합 스코어</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ScoreBar label="입지" score={valuation.analysis.locationScore} />
            <ScoreBar label="접근성" score={valuation.analysis.accessibilityScore} />
            <ScoreBar label="개발 잠재력" score={valuation.analysis.developmentPotential} />
            <ScoreBar label="종합" score={valuation.analysis.overallScore} color="blue" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TagPanel title="핵심 장점" colorClass="from-emerald-500/10 to-emerald-500/5" textColor="text-emerald-700 dark:text-emerald-300" items={valuation.strengths} />
          <TagPanel title="주의 포인트" colorClass="from-rose-500/10 to-rose-500/5" textColor="text-rose-700 dark:text-rose-300" items={valuation.weaknesses} />
        </div>

        <div className="rounded-2xl border border-yellow-200/60 bg-yellow-50/80 p-4 dark:border-yellow-400/20 dark:bg-yellow-900/20">
          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">시장 트렌드</h4>
          <p className="mt-2 text-sm text-yellow-900/80 dark:text-yellow-100">{valuation.marketTrend}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">상세 분석</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {valuation.detailedAnalysis}
          </p>
        </div>

        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
          {valuation.aiProvider === 'openai' ? 'OpenAI' : 'Claude'} · {new Date(valuation.analyzedAt).toLocaleString('ko-KR')}
        </div>
      </div>
    </div>
  );
}

function PriceStat({ label, value, accent, large }: { label: string; value: number; accent?: string; large?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-center shadow-inner shadow-black/5 dark:border-slate-800 dark:bg-slate-900/40">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className={`mt-2 font-semibold ${large ? 'text-2xl' : 'text-xl'} ${accent ?? 'text-slate-700 dark:text-slate-100'}`}>
        {formatPrice(value)}
      </p>
    </div>
  );
}

function TagPanel({
  title,
  items,
  colorClass,
  textColor,
}: {
  title: string;
  items: string[];
  colorClass: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorClass} p-4`}>
      <h4 className={`text-sm font-semibold ${textColor}`}>{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBar({ label, score, color = 'green' }: { label: string; score: number; color?: 'green' | 'blue' }) {
  const percentage = (score / 10) * 100;
  const colorClass = color === 'blue' ? 'from-sky-400 to-indigo-500' : 'from-emerald-400 to-green-500';

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
        <span>{label}</span>
        <span>{score}/10</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function FacilityList({ title, facilities }: { title: string; facilities: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-100">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {facilities.map((facility, idx) => (
          <li
            key={`${facility}-${idx}`}
            className="rounded-xl border border-slate-100/80 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
          >
            {facility}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DevelopmentPlanList({ plans }: { plans: string[] }) {
  return (
    <div className="rounded-3xl border border-indigo-200/60 bg-indigo-50/80 p-6 dark:border-indigo-500/30 dark:bg-indigo-950/20">
      <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">도시계획·규제 정보</h4>
      <ul className="mt-4 space-y-3 text-sm text-indigo-900/80 dark:text-indigo-100/80">
        {plans.map((plan, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
            <span>{plan}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-indigo-900/60 dark:text-indigo-200/60">국토부 NSDI OpenAPI 기반 최신 데이터</p>
    </div>
  );
}

function TransactionList({ transactions }: { transactions: RealEstateTransaction[] }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 dark:border-slate-700 dark:bg-slate-900/70">
      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">최근 실거래 {transactions.length}건</h4>
      <div className="mt-4 divide-y divide-slate-200/70 dark:divide-slate-800/80">
        {transactions.slice(0, 6).map((tx, idx) => (
          <div key={`${tx.apartmentName}-${tx.dealYear}-${idx}`} className="flex flex-wrap items-center gap-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex-1 font-semibold text-slate-800 dark:text-white">
              {tx.apartmentName} · {tx.floor}층
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              {tx.dealYear}.{String(tx.dealMonth).padStart(2, '0')}.{String(tx.dealDay).padStart(2, '0')}
            </div>
            <div className="text-emerald-600 dark:text-emerald-300">{formatPrice(tx.dealAmount * 10000)}</div>
            <div className="text-xs text-slate-400">{tx.exclusiveArea.toFixed(1)}㎡ · {tx.buildYear}년식</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ValuationResultDisplay({ result }: ValuationResultProps) {
  if (!result.success || !result.data) {
    return (
      <div className="rounded-3xl border border-red-200/70 bg-red-50/80 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-100">
        {result.error || '분석 결과를 표시할 수 없습니다.'}
      </div>
    );
  }

  const { property, locationInfo, valuation } = result.data;
  const facilityCounts = [
    { label: '지하철', count: locationInfo.nearbyFacilities.subway?.length ?? 0 },
    { label: '학교', count: locationInfo.nearbyFacilities.schools?.length ?? 0 },
    { label: '병원', count: locationInfo.nearbyFacilities.hospitals?.length ?? 0 },
    { label: '상권', count: locationInfo.nearbyFacilities.markets?.length ?? 0 },
    { label: '공원', count: locationInfo.nearbyFacilities.parks?.length ?? 0 },
  ].filter((item) => item.count > 0);

  const valuationsToRender =
    'openai' in valuation || 'claude' in valuation
      ? [
          { title: 'OpenAI 분석 결과', data: (valuation as { openai?: ValuationResultType }).openai },
          { title: 'Claude 분석 결과', data: (valuation as { claude?: ValuationResultType }).claude },
        ].filter((entry) => entry.data) as Array<{ title: string; data: ValuationResultType }>
      : [{ title: undefined, data: valuation as ValuationResultType }];

  return (
    <div className="space-y-10 text-slate-900 dark:text-slate-50">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Property Snapshot</p>
            <h2 className="mt-2 text-3xl font-semibold">{property.address}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {locationInfo.district || '지역 정보 없음'}
            </p>
          </div>
          <div className="flex gap-3">
            <DetailChip label="전용면적" value={`${property.exclusiveArea.toFixed(1)}㎡`} />
            <DetailChip label="평형" value={`${(property.pyeong ?? property.exclusiveArea / 3.3058).toFixed(1)}평`} />
          </div>
        </div>
        {facilityCounts.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {facilityCounts.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-50/70 px-4 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
              >
                {item.label} {item.count}곳
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {locationInfo.nearbyFacilities.subway && locationInfo.nearbyFacilities.subway.length > 0 && (
          <FacilityList
            title="지하철역"
            facilities={locationInfo.nearbyFacilities.subway.map((s) => `${s.name} · ${s.line} · ${s.distance}m`)}
          />
        )}
        {locationInfo.nearbyFacilities.schools && locationInfo.nearbyFacilities.schools.length > 0 && (
          <FacilityList
            title="학교"
            facilities={locationInfo.nearbyFacilities.schools.map((s) => `${s.name} · ${s.type} · ${s.distance}m`)}
          />
        )}
        {locationInfo.nearbyFacilities.hospitals && locationInfo.nearbyFacilities.hospitals.length > 0 && (
          <FacilityList
            title="의료 시설"
            facilities={locationInfo.nearbyFacilities.hospitals.map((h) => `${h.name} · ${h.distance}m`)}
          />
        )}
        {locationInfo.nearbyFacilities.markets && locationInfo.nearbyFacilities.markets.length > 0 && (
          <FacilityList
            title="상권"
            facilities={locationInfo.nearbyFacilities.markets.map((m) => `${m.name} · ${m.distance}m`)}
          />
        )}
        {locationInfo.nearbyFacilities.parks && locationInfo.nearbyFacilities.parks.length > 0 && (
          <FacilityList
            title="공원"
            facilities={locationInfo.nearbyFacilities.parks.map((p) => `${p.name} · ${p.distance}m`)}
          />
        )}
      </section>

      <section className="grid gap-6">
        {valuationsToRender.map((entry) => (
          <SingleValuationDisplay key={entry.title ?? 'single'} valuation={entry.data} title={entry.title} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {locationInfo.developmentPlans && locationInfo.developmentPlans.length > 0 && (
          <DevelopmentPlanList plans={locationInfo.developmentPlans} />
        )}
        {locationInfo.realEstateTransactions && locationInfo.realEstateTransactions.length > 0 && (
          <TransactionList transactions={locationInfo.realEstateTransactions} />
        )}
      </section>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2 text-center text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
