import { LocationInfo } from '@/types';

/**
 * 주소 기반으로 입지 정보를 수집합니다.
 * 실제 환경에서는 공공 데이터 API (카카오맵, 네이버맵, 공공데이터포털 등)를 사용해야 합니다.
 * 이 구현은 데모용 모의 데이터를 반환합니다.
 */
export async function getLocationInfo(address: string): Promise<LocationInfo> {
  // 실제 구현에서는 여기서 다음과 같은 API를 호출해야 합니다:
  // 1. 카카오맵 API - 주소를 좌표로 변환
  // 2. 주변 시설 검색 (지하철역, 학교, 병원 등)
  // 3. 공공데이터포털 - 도시계획 정보

  // 주소에서 지역 추출 (간단한 파싱)
  const district = extractDistrict(address);

  // 데모용 모의 데이터
  const mockLocationInfo: LocationInfo = {
    address,
    coordinates: {
      lat: 37.5665 + Math.random() * 0.1,
      lng: 126.9780 + Math.random() * 0.1,
    },
    district,
    nearbyFacilities: {
      subway: [
        { name: '역삼역', distance: 350, line: '2호선' },
        { name: '강남역', distance: 800, line: '2호선, 신분당선' },
      ],
      schools: [
        { name: '○○초등학교', distance: 400, type: '초등학교' },
        { name: '△△중학교', distance: 650, type: '중학교' },
        { name: '□□고등학교', distance: 900, type: '고등학교' },
      ],
      hospitals: [
        { name: '○○병원', distance: 300 },
        { name: '△△의원', distance: 150 },
      ],
      markets: [
        { name: '이마트', distance: 1200 },
        { name: '전통시장', distance: 600 },
      ],
      parks: [
        { name: '○○공원', distance: 450 },
      ],
    },
    developmentPlans: [
      '2025년 GTX 개통 예정',
      '재개발 예정 구역 인근',
    ],
  };

  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockLocationInfo;
}

/**
 * 주소에서 지역(구) 추출
 */
function extractDistrict(address: string): string {
  const match = address.match(/(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)\s*([^\s]+[시군구])/);

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return '정보 없음';
}

/**
 * 실제 API 구현 예시 (주석 처리)
 *
 * 카카오맵 API를 사용한 주소 검색 예시:
 *
 * export async function getCoordinates(address: string) {
 *   const response = await fetch(
 *     `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
 *     {
 *       headers: {
 *         Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
 *       },
 *     }
 *   );
 *   const data = await response.json();
 *   return {
 *     lat: parseFloat(data.documents[0].y),
 *     lng: parseFloat(data.documents[0].x),
 *   };
 * }
 *
 * export async function searchNearbyPlaces(lat: number, lng: number, category: string) {
 *   const response = await fetch(
 *     `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=${lng}&y=${lat}&radius=2000`,
 *     {
 *       headers: {
 *         Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
 *       },
 *     }
 *   );
 *   return await response.json();
 * }
 */
