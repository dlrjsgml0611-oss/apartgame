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
      pricePerPyeong: result.pricePerPyeong,
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
      pricePerPyeong: result.pricePerPyeong,
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
  return `
다음 부동산에 대한 종합적인 감정가 평가를 수행해주세요:

## 부동산 정보
- 주소: ${property.address}
- 평형: ${property.pyeong}평 (약 ${property.squareMeters?.toFixed(2)}㎡)
- 지역: ${locationInfo.district}

## 입지 정보

### 주변 교통
${locationInfo.nearbyFacilities.subway?.map(s => `- ${s.name} (${s.line}): ${s.distance}m`).join('\n') || '정보 없음'}

### 교육 시설
${locationInfo.nearbyFacilities.schools?.map(s => `- ${s.name} (${s.type}): ${s.distance}m`).join('\n') || '정보 없음'}

### 의료 시설
${locationInfo.nearbyFacilities.hospitals?.map(h => `- ${h.name}: ${h.distance}m`).join('\n') || '정보 없음'}

### 편의 시설
${locationInfo.nearbyFacilities.markets?.map(m => `- ${m.name}: ${m.distance}m`).join('\n') || '정보 없음'}

### 개발 계획
${locationInfo.developmentPlans?.join('\n- ') || '정보 없음'}

## 요청사항
다음 JSON 형식으로 분석 결과를 제공해주세요:

{
  "estimatedPrice": {
    "min": <최소 예상 가격 (숫자)>,
    "max": <최대 예상 가격 (숫자)>,
    "average": <평균 예상 가격 (숫자)>
  },
  "pricePerPyeong": {
    "min": <평당 최소 가격 (숫자)>,
    "max": <평당 최대 가격 (숫자)>,
    "average": <평당 평균 가격 (숫자)>
  },
  "analysis": {
    "locationScore": <입지 점수 1-10>,
    "accessibilityScore": <접근성 점수 1-10>,
    "developmentPotential": <개발 잠재력 점수 1-10>,
    "overallScore": <종합 점수 1-10>
  },
  "strengths": [
    "장점 1",
    "장점 2",
    "장점 3"
  ],
  "weaknesses": [
    "단점 1",
    "단점 2"
  ],
  "marketTrend": "현재 시장 트렌드에 대한 설명",
  "detailedAnalysis": "상세한 분석 내용 (여러 문단으로 작성)"
}

※ 한국 부동산 시장의 특성, 해당 지역의 실제 시세, 입지 조건 등을 종합적으로 고려하여 현실적인 가격을 제시해주세요.
※ 모든 가격은 원(KRW) 단위입니다.
`;
}
