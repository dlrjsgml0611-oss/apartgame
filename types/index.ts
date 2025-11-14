// 부동산 정보 타입
export interface PropertyInput {
  address: string;
  pyeong: number; // 평형
  squareMeters?: number; // 제곱미터 (자동 계산)
}

// 입지 정보 타입
export interface LocationInfo {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  nearbyFacilities: {
    subway?: Array<{ name: string; distance: number; line: string }>;
    schools?: Array<{ name: string; distance: number; type: string }>;
    hospitals?: Array<{ name: string; distance: number }>;
    markets?: Array<{ name: string; distance: number }>;
    parks?: Array<{ name: string; distance: number }>;
  };
  district?: string;
  developmentPlans?: string[];
}

// AI 분석 결과 타입
export interface ValuationResult {
  estimatedPrice: {
    min: number;
    max: number;
    average: number;
  };
  pricePerPyeong: {
    min: number;
    max: number;
    average: number;
  };
  analysis: {
    locationScore: number; // 1-10
    accessibilityScore: number; // 1-10
    developmentPotential: number; // 1-10
    overallScore: number; // 1-10
  };
  strengths: string[];
  weaknesses: string[];
  marketTrend: string;
  detailedAnalysis: string;
  aiProvider: 'openai' | 'claude';
  analyzedAt: string;
}

// API 요청/응답 타입
export interface AnalysisRequest {
  property: PropertyInput;
  aiProvider?: 'openai' | 'claude' | 'both';
}

export interface AnalysisResponse {
  success: boolean;
  data?: {
    property: PropertyInput;
    locationInfo: LocationInfo;
    valuation: ValuationResult | {
      openai?: ValuationResult;
      claude?: ValuationResult;
    };
  };
  error?: string;
}
