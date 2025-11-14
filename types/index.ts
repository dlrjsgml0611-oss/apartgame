// 부동산 정보 타입
export interface PropertyInput {
  address: string;
  exclusiveArea: number; // 전용면적 (제곱미터)
  pyeong?: number; // 평형 (자동 계산)
}

// 입지 정보 타입
export interface LocationInfo {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyFacilities: {
    subway?: Array<{ name: string; distance: number; line: string }>;
    schools?: Array<{ name: string; distance: number; type: string }>;
    hospitals?: Array<{ name: string; distance: number }>;
    markets?: Array<{ name: string; distance: number }>;
    parks?: Array<{ name: string; distance: number; area?: number }>;
  };
  district?: string;
  developmentPlans?: string[];
  realEstateTransactions?: RealEstateTransaction[];
}

// 실거래가 정보 타입
export interface RealEstateTransaction {
  dealAmount: number; // 거래금액 (만원)
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  exclusiveArea: number; // 전용면적
  floor: number;
  buildYear: number;
  apartmentName: string;
}

// AI 분석 결과 타입
export interface ValuationResult {
  estimatedPrice: {
    min: number;
    max: number;
    average: number;
  };
  pricePerSquareMeter: {
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
