'use client';

import { AnalysisResponse, ValuationResult as ValuationResultType } from '@/types';

interface ValuationResultProps {
  result: AnalysisResponse;
}

function SingleValuationDisplay({
  valuation,
  title
}: {
  valuation: ValuationResultType;
  title?: string;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      {title && (
        <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          {title}
        </h3>
      )}

      {/* 감정가 요약 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          예상 감정가
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">최소</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {formatPrice(valuation.estimatedPrice.min)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">평균</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(valuation.estimatedPrice.average)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">최대</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {formatPrice(valuation.estimatedPrice.max)}
            </p>
          </div>
        </div>
      </div>

      {/* ㎡당 가격 */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          ㎡당 가격
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">최소</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {formatPrice(valuation.pricePerSquareMeter.min)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">평균</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatPrice(valuation.pricePerSquareMeter.average)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">최대</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {formatPrice(valuation.pricePerSquareMeter.max)}
            </p>
          </div>
        </div>
      </div>

      {/* 점수 분석 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          종합 분석
        </h4>
        <div className="space-y-3">
          <ScoreBar label="입지 점수" score={valuation.analysis.locationScore} />
          <ScoreBar label="접근성 점수" score={valuation.analysis.accessibilityScore} />
          <ScoreBar label="개발 잠재력" score={valuation.analysis.developmentPotential} />
          <ScoreBar label="종합 점수" score={valuation.analysis.overallScore} color="blue" />
        </div>
      </div>

      {/* 장단점 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-400">
            장점
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {valuation.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400">
            단점
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {valuation.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 시장 트렌드 */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          시장 트렌드
        </h4>
        <p className="text-gray-700 dark:text-gray-300">{valuation.marketTrend}</p>
      </div>

      {/* 상세 분석 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          상세 분석
        </h4>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {valuation.detailedAnalysis}
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-right">
        분석 제공: {valuation.aiProvider === 'openai' ? 'OpenAI' : 'Claude'} |
        분석 시각: {new Date(valuation.analyzedAt).toLocaleString('ko-KR')}
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color = 'green'
}: {
  label: string;
  score: number;
  color?: 'green' | 'blue';
}) {
  const percentage = (score / 10) * 100;
  const colorClass = color === 'blue'
    ? 'bg-blue-500'
    : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {score}/10
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ValuationResultDisplay({ result }: ValuationResultProps) {
  if (!result.success || !result.data) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <p className="text-red-600 dark:text-red-400">
          {result.error || '분석 결과를 표시할 수 없습니다.'}
        </p>
      </div>
    );
  }

  const { property, locationInfo, valuation } = result.data;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* 부동산 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          부동산 정보
        </h3>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">주소:</span> {property.address}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">전용면적:</span> {property.exclusiveArea.toFixed(2)}㎡
            ({property.pyeong?.toFixed(2)}평)
          </p>
          {locationInfo.district && (
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">지역:</span> {locationInfo.district}
            </p>
          )}
        </div>
      </div>

      {/* 입지 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          주변 시설
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {locationInfo.nearbyFacilities.subway && locationInfo.nearbyFacilities.subway.length > 0 && (
            <FacilityList
              title="지하철역"
              facilities={locationInfo.nearbyFacilities.subway.map(s =>
                `${s.name} (${s.line}, ${s.distance}m)`
              )}
            />
          )}
          {locationInfo.nearbyFacilities.schools && locationInfo.nearbyFacilities.schools.length > 0 && (
            <FacilityList
              title="학교"
              facilities={locationInfo.nearbyFacilities.schools.map(s =>
                `${s.name} (${s.type}, ${s.distance}m)`
              )}
            />
          )}
          {locationInfo.nearbyFacilities.hospitals && locationInfo.nearbyFacilities.hospitals.length > 0 && (
            <FacilityList
              title="병원"
              facilities={locationInfo.nearbyFacilities.hospitals.map(h =>
                `${h.name} (${h.distance}m)`
              )}
            />
          )}
          {locationInfo.nearbyFacilities.markets && locationInfo.nearbyFacilities.markets.length > 0 && (
            <FacilityList
              title="대형마트/시장"
              facilities={locationInfo.nearbyFacilities.markets.map(m =>
                `${m.name} (${m.distance}m)`
              )}
            />
          )}
        </div>
      </div>

      {/* AI 감정가 분석 결과 */}
      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        AI 감정가 분석
      </h3>

      {'openai' in valuation || 'claude' in valuation ? (
        <>
          {(valuation as any).openai && (
            <SingleValuationDisplay
              valuation={(valuation as any).openai}
              title="OpenAI 분석 결과"
            />
          )}
          {(valuation as any).claude && (
            <SingleValuationDisplay
              valuation={(valuation as any).claude}
              title="Claude 분석 결과"
            />
          )}
        </>
      ) : (
        <SingleValuationDisplay valuation={valuation as ValuationResultType} />
      )}
    </div>
  );
}

function FacilityList({ title, facilities }: { title: string; facilities: string[] }) {
  return (
    <div>
      <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h4>
      <ul className="list-disc list-inside space-y-1">
        {facilities.map((facility, idx) => (
          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
            {facility}
          </li>
        ))}
      </ul>
    </div>
  );
}
