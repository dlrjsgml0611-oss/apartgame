import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { PropertyInput, LocationInfo, ValuationResult } from '@/types';

/**
 * OpenAI를 사용한 부동산 감정가 분석
 */
export async function analyzeWithOpenAI(
  property: PropertyInput,
  locationInfo: LocationInfo
): Promise<ValuationResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = createAnalysisPrompt(property, locationInfo);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 대한민국의 전문 부동산 감정평가사입니다.
부동산의 입지, 주변 환경, 개발 계획 등을 종합적으로 분석하여 정확한 감정가를 산정합니다.
반드시 JSON 형식으로만 응답해주세요.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      estimatedPrice: result.estimatedPrice,
      pricePerSquareMeter: result.pricePerSquareMeter,
      analysis: result.analysis,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      marketTrend: result.marketTrend,
      detailedAnalysis: result.detailedAnalysis,
      aiProvider: 'openai',
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('OpenAI 분석 오류:', error);
    throw new Error('OpenAI 분석 중 오류가 발생했습니다.');
  }
}

/**
 * Claude를 사용한 부동산 감정가 분석
 */
export async function analyzeWithClaude(
  property: PropertyInput,
  locationInfo: LocationInfo
): Promise<ValuationResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = createAnalysisPrompt(property, locationInfo);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `당신은 대한민국의 전문 부동산 감정평가사입니다.
부동산의 입지, 주변 환경, 개발 계획 등을 종합적으로 분석하여 정확한 감정가를 산정합니다.
반드시 JSON 형식으로만 응답해주세요.

${prompt}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('예상치 못한 응답 형식입니다.');
    }

    const result = JSON.parse(content.text);

    return {
      estimatedPrice: result.estimatedPrice,
      pricePerSquareMeter: result.pricePerSquareMeter,
      analysis: result.analysis,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      marketTrend: result.marketTrend,
      detailedAnalysis: result.detailedAnalysis,
      aiProvider: 'claude',
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Claude 분석 오류:', error);
    throw new Error('Claude 분석 중 오류가 발생했습니다.');
  }
}

/**
 * AI 분석을 위한 프롬프트 생성
 */
function createAnalysisPrompt(property: PropertyInput, locationInfo: LocationInfo): string {
  // 실거래가 정보 포맷팅
  const transactionsInfo = locationInfo.realEstateTransactions && locationInfo.realEstateTransactions.length > 0
    ? locationInfo.realEstateTransactions.map(t =>
        `- ${t.apartmentName}: ${t.dealAmount}만원 (${t.exclusiveArea}㎡, ${t.floor}층, ${t.dealYear}년 ${t.dealMonth}월)`
      ).join('\n')
    : '실거래가 정보 없음';

  // 공원 정보 포맷팅
  const parksInfo = locationInfo.nearbyFacilities.parks?.map(p => `- ${p.name}: ${p.distance}m`).join('\n') || '정보 없음';

  return `
다음 부동산에 대한 종합적인 감정가 평가를 수행해주세요:

## 부동산 정보
- 주소: ${property.address}
- 전용면적: ${property.exclusiveArea.toFixed(2)}㎡ (약 ${property.pyeong?.toFixed(2)}평)
- 지역: ${locationInfo.district}
- 좌표: 위도 ${locationInfo.coordinates.lat.toFixed(6)}, 경도 ${locationInfo.coordinates.lng.toFixed(6)}

## 입지 정보

### 주변 교통 (지하철역)
${locationInfo.nearbyFacilities.subway?.map(s => `- ${s.name} (${s.line}): ${s.distance}m`).join('\n') || '정보 없음'}

### 교육 시설
${locationInfo.nearbyFacilities.schools?.map(s => `- ${s.name} (${s.type}): ${s.distance}m`).join('\n') || '정보 없음'}

### 의료 시설
${locationInfo.nearbyFacilities.hospitals?.map(h => `- ${h.name}: ${h.distance}m`).join('\n') || '정보 없음'}

### 편의 시설 (대형마트)
${locationInfo.nearbyFacilities.markets?.map(m => `- ${m.name}: ${m.distance}m`).join('\n') || '정보 없음'}

### 근린공원
${parksInfo}

### 주변 실거래가 정보
${transactionsInfo}

### 개발 계획
${locationInfo.developmentPlans && locationInfo.developmentPlans.length > 0 ? locationInfo.developmentPlans.map(p => `- ${p}`).join('\n') : '개발 계획 정보 없음'}

## 요청사항
다음 JSON 형식으로 분석 결과를 제공해주세요:

{
  "estimatedPrice": {
    "min": <최소 예상 가격 (숫자, 원 단위)>,
    "max": <최대 예상 가격 (숫자, 원 단위)>,
    "average": <평균 예상 가격 (숫자, 원 단위)>
  },
  "pricePerSquareMeter": {
    "min": <㎡당 최소 가격 (숫자, 원 단위)>,
    "max": <㎡당 최대 가격 (숫자, 원 단위)>,
    "average": <㎡당 평균 가격 (숫자, 원 단위)>
  },
  "analysis": {
    "locationScore": <입지 점수 1-10>,
    "accessibilityScore": <접근성 점수 1-10 (대중교통, 도보 편의성)>,
    "developmentPotential": <개발 잠재력 점수 1-10>,
    "overallScore": <종합 점수 1-10>
  },
  "strengths": [
    "장점 1 (구체적으로)",
    "장점 2",
    "장점 3"
  ],
  "weaknesses": [
    "단점 1 (구체적으로)",
    "단점 2"
  ],
  "marketTrend": "현재 시장 트렌드에 대한 상세 설명",
  "detailedAnalysis": "입지, 교통, 교육환경, 생활편의시설, 개발계획, 실거래가 추이 등을 종합한 상세한 분석 내용 (여러 문단으로 작성)"
}

※ 중요 고려사항:
1. 제공된 실거래가 정보를 참고하여 현실적인 가격을 산정하세요
2. 지하철역까지의 거리는 부동산 가치에 중요한 영향을 미칩니다 (도보 10분 이내가 프리미엄)
3. 학군 및 교육환경은 한국 부동산 시장에서 중요한 요소입니다
4. 근린공원 접근성도 가격에 영향을 미칩니다
5. 향후 개발 계획은 미래 가치 상승 가능성을 나타냅니다
6. 모든 가격은 원(KRW) 단위입니다
`;
}
