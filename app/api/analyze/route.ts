import { NextRequest, NextResponse } from 'next/server';
import { AnalysisRequest, AnalysisResponse } from '@/types';
import { getLocationInfo } from '@/lib/location';
import { analyzeWithOpenAI, analyzeWithClaude } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    // 입력 검증
    if (!body.property || !body.property.address || !body.property.exclusiveArea) {
      return NextResponse.json(
        {
          success: false,
          error: '주소와 전용면적 정보가 필요합니다.',
        } as AnalysisResponse,
        { status: 400 }
      );
    }

    const { property, aiProvider = 'both' } = body;

    // 제곱미터를 평으로 변환
    property.pyeong = property.exclusiveArea / 3.3058;

    // 1. 입지 정보 수집
    console.log('입지 정보 수집 중...');
    const locationInfo = await getLocationInfo(property.address, property.exclusiveArea);

    // 2. AI 분석 수행
    console.log(`AI 분석 중 (제공자: ${aiProvider})...`);
    let valuation: any;

    if (aiProvider === 'both') {
      // 두 AI 모두 사용
      const [openaiResult, claudeResult] = await Promise.allSettled([
        analyzeWithOpenAI(property, locationInfo),
        analyzeWithClaude(property, locationInfo),
      ]);

      valuation = {};

      if (openaiResult.status === 'fulfilled') {
        valuation.openai = openaiResult.value;
      } else {
        console.error('OpenAI 분석 실패:', openaiResult.reason);
      }

      if (claudeResult.status === 'fulfilled') {
        valuation.claude = claudeResult.value;
      } else {
        console.error('Claude 분석 실패:', claudeResult.reason);
      }

      // 두 AI 모두 실패한 경우
      if (!valuation.openai && !valuation.claude) {
        throw new Error('모든 AI 분석이 실패했습니다.');
      }
    } else if (aiProvider === 'openai') {
      valuation = await analyzeWithOpenAI(property, locationInfo);
    } else if (aiProvider === 'claude') {
      valuation = await analyzeWithClaude(property, locationInfo);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 AI 제공자입니다.',
        } as AnalysisResponse,
        { status: 400 }
      );
    }

    // 3. 결과 반환
    const response: AnalysisResponse = {
      success: true,
      data: {
        property,
        locationInfo,
        valuation,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('분석 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      } as AnalysisResponse,
      { status: 500 }
    );
  }
}
