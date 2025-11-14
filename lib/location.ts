import { LocationInfo, RealEstateTransaction } from '@/types';
import axios from 'axios';

const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';
const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY || '';

/**
 * 카카오맵 API를 사용하여 주소를 좌표로 변환
 */
async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          query: address,
        },
      }
    );

    if (response.data.documents && response.data.documents.length > 0) {
      const { x, y } = response.data.documents[0];
      return {
        lat: parseFloat(y),
        lng: parseFloat(x),
      };
    }

    throw new Error('주소를 찾을 수 없습니다.');
  } catch (error) {
    console.error('좌표 변환 오류:', error);
    throw new Error('주소를 좌표로 변환하는데 실패했습니다.');
  }
}

/**
 * 카카오맵 API를 사용하여 주변 지하철역 검색
 */
async function searchNearbySubways(lat: number, lng: number) {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/category.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          category_group_code: 'SW8', // 지하철역
          x: lng,
          y: lat,
          radius: 2000, // 2km
          sort: 'distance',
        },
      }
    );

    return response.data.documents.map((doc: any) => ({
      name: doc.place_name.replace(/역$/, '역'),
      distance: Math.round(doc.distance),
      line: extractSubwayLine(doc.place_name),
    })).slice(0, 5); // 가장 가까운 5개
  } catch (error) {
    console.error('지하철역 검색 오류:', error);
    return [];
  }
}

/**
 * 카카오맵 API를 사용하여 주변 학교 검색
 */
async function searchNearbySchools(lat: number, lng: number) {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/category.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          category_group_code: 'SC4', // 학교
          x: lng,
          y: lat,
          radius: 2000,
          sort: 'distance',
        },
      }
    );

    return response.data.documents.map((doc: any) => ({
      name: doc.place_name,
      distance: Math.round(doc.distance),
      type: determineSchoolType(doc.place_name),
    })).slice(0, 10);
  } catch (error) {
    console.error('학교 검색 오류:', error);
    return [];
  }
}

/**
 * 카카오맵 API를 사용하여 주변 병원 검색
 */
async function searchNearbyHospitals(lat: number, lng: number) {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/category.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          category_group_code: 'HP8', // 병원
          x: lng,
          y: lat,
          radius: 2000,
          sort: 'distance',
        },
      }
    );

    return response.data.documents.map((doc: any) => ({
      name: doc.place_name,
      distance: Math.round(doc.distance),
    })).slice(0, 5);
  } catch (error) {
    console.error('병원 검색 오류:', error);
    return [];
  }
}

/**
 * 카카오맵 API를 사용하여 주변 대형마트 검색
 */
async function searchNearbyMarkets(lat: number, lng: number) {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/category.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          category_group_code: 'MT1', // 대형마트
          x: lng,
          y: lat,
          radius: 3000,
          sort: 'distance',
        },
      }
    );

    return response.data.documents.map((doc: any) => ({
      name: doc.place_name,
      distance: Math.round(doc.distance),
    })).slice(0, 5);
  } catch (error) {
    console.error('마트 검색 오류:', error);
    return [];
  }
}

/**
 * 카카오맵 키워드 검색을 사용하여 주변 공원 검색
 */
async function searchNearbyParks(lat: number, lng: number) {
  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/keyword.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          query: '공원',
          x: lng,
          y: lat,
          radius: 2000,
          sort: 'distance',
        },
      }
    );

    return response.data.documents
      .filter((doc: any) => doc.place_name.includes('공원'))
      .map((doc: any) => ({
        name: doc.place_name,
        distance: Math.round(doc.distance),
      }))
      .slice(0, 5);
  } catch (error) {
    console.error('공원 검색 오류:', error);
    return [];
  }
}

/**
 * 공공데이터포털 API를 사용하여 아파트 실거래가 정보 조회
 */
async function getRealEstateTransactions(
  address: string,
  exclusiveArea: number
): Promise<RealEstateTransaction[]> {
  if (!PUBLIC_DATA_API_KEY) {
    console.warn('공공데이터포털 API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    // 주소에서 법정동코드와 지역 정보 추출
    const { sigunguCode, dong } = extractRegionInfo(address);

    if (!sigunguCode || !dong) {
      console.warn('주소에서 지역 정보를 추출할 수 없습니다:', address);
      return [];
    }

    // 최근 6개월 데이터 조회
    const today = new Date();
    const dealYmd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const response = await axios.get(
      'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev',
      {
        params: {
          serviceKey: PUBLIC_DATA_API_KEY,
          LAWD_CD: sigunguCode,
          DEAL_YMD: dealYmd,
          numOfRows: 100,
        },
      }
    );

    // XML 파싱 필요 - 실제 구현에서는 xml2js 라이브러리 사용
    // 여기서는 간단한 예시로 빈 배열 반환
    console.log('실거래가 API 응답:', response.data);

    // 실제로는 XML을 파싱하여 RealEstateTransaction[] 형태로 반환
    return [];
  } catch (error) {
    console.error('실거래가 조회 오류:', error);
    return [];
  }
}

/**
 * 주소 기반으로 종합 입지 정보를 수집
 */
export async function getLocationInfo(
  address: string,
  exclusiveArea: number
): Promise<LocationInfo> {
  try {
    // 1. 주소를 좌표로 변환
    console.log('주소를 좌표로 변환 중...', address);
    const coordinates = await getCoordinatesFromAddress(address);

    // 2. 병렬로 주변 시설 정보 수집
    console.log('주변 시설 정보 수집 중...');
    const [subway, schools, hospitals, markets, parks, transactions] = await Promise.all([
      searchNearbySubways(coordinates.lat, coordinates.lng),
      searchNearbySchools(coordinates.lat, coordinates.lng),
      searchNearbyHospitals(coordinates.lat, coordinates.lng),
      searchNearbyMarkets(coordinates.lat, coordinates.lng),
      searchNearbyParks(coordinates.lat, coordinates.lng),
      getRealEstateTransactions(address, exclusiveArea),
    ]);

    // 3. 지역 정보 추출
    const district = extractDistrict(address);

    return {
      address,
      coordinates,
      district,
      nearbyFacilities: {
        subway: subway.length > 0 ? subway : undefined,
        schools: schools.length > 0 ? schools : undefined,
        hospitals: hospitals.length > 0 ? hospitals : undefined,
        markets: markets.length > 0 ? markets : undefined,
        parks: parks.length > 0 ? parks : undefined,
      },
      realEstateTransactions: transactions.length > 0 ? transactions : undefined,
      developmentPlans: await getDevelopmentPlans(district),
    };
  } catch (error) {
    console.error('입지 정보 수집 오류:', error);
    throw error;
  }
}

/**
 * 주소에서 지역(시/구) 추출
 */
function extractDistrict(address: string): string {
  const match = address.match(
    /(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)\s*([^\s]+[시군구])/
  );

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return '정보 없음';
}

/**
 * 지하철 호선 정보 추출
 */
function extractSubwayLine(placeName: string): string {
  const linePatterns = [
    { pattern: /1호선/, line: '1호선' },
    { pattern: /2호선/, line: '2호선' },
    { pattern: /3호선/, line: '3호선' },
    { pattern: /4호선/, line: '4호선' },
    { pattern: /5호선/, line: '5호선' },
    { pattern: /6호선/, line: '6호선' },
    { pattern: /7호선/, line: '7호선' },
    { pattern: /8호선/, line: '8호선' },
    { pattern: /9호선/, line: '9호선' },
    { pattern: /신분당선/, line: '신분당선' },
    { pattern: /경의중앙선/, line: '경의중앙선' },
    { pattern: /경춘선/, line: '경춘선' },
    { pattern: /분당선/, line: '분당선' },
  ];

  for (const { pattern, line } of linePatterns) {
    if (pattern.test(placeName)) {
      return line;
    }
  }

  return '정보 없음';
}

/**
 * 학교 타입 결정
 */
function determineSchoolType(schoolName: string): string {
  if (schoolName.includes('초등학교') || schoolName.includes('초')) {
    return '초등학교';
  } else if (schoolName.includes('중학교') || schoolName.includes('중')) {
    return '중학교';
  } else if (schoolName.includes('고등학교') || schoolName.includes('고')) {
    return '고등학교';
  } else if (schoolName.includes('대학교') || schoolName.includes('대학')) {
    return '대학교';
  }
  return '기타';
}

/**
 * 주소에서 법정동코드 추출 (공공데이터 API용)
 */
function extractRegionInfo(address: string): { sigunguCode?: string; dong?: string } {
  // 실제로는 행정구역코드 DB나 API를 사용해야 합니다
  // 여기서는 주요 지역만 하드코딩
  const regionCodes: { [key: string]: string } = {
    '강남구': '11680',
    '서초구': '11650',
    '송파구': '11710',
    '강동구': '11740',
    '마포구': '11440',
    '용산구': '11170',
    '성동구': '11200',
    '광진구': '11215',
    '동대문구': '11230',
    '중랑구': '11260',
    '성북구': '11290',
    '강북구': '11305',
    '도봉구': '11320',
    '노원구': '11350',
    '은평구': '11380',
    '서대문구': '11410',
    '종로구': '11110',
    '중구': '11140',
    '영등포구': '11560',
    '동작구': '11590',
    '관악구': '11620',
    '구로구': '11530',
    '금천구': '11545',
    '양천구': '11470',
    '강서구': '11500',
  };

  for (const [gu, code] of Object.entries(regionCodes)) {
    if (address.includes(gu)) {
      // 동 정보 추출
      const dongMatch = address.match(/([가-힣]+동)/);
      return {
        sigunguCode: code,
        dong: dongMatch ? dongMatch[1] : undefined,
      };
    }
  }

  return {};
}

/**
 * 개발 계획 정보 조회 (모의 데이터)
 */
async function getDevelopmentPlans(district: string): Promise<string[]> {
  // 실제로는 국토교통부 도시계획 API를 사용해야 합니다
  // 현재는 주요 지역의 알려진 개발 계획만 반환
  const plans: { [key: string]: string[] } = {
    '서울특별시 강남구': ['GTX-C 노선 개통 예정 (2027년)', '삼성동 현대차 GBC 개발'],
    '서울특별시 서초구': ['강남순환도시고속도로 개통 예정'],
    '서울특별시 송파구': ['잠실 운동장 재개발 추진'],
    '서울특별시 마포구': ['마포구 도시재생 뉴딜사업 추진'],
  };

  return plans[district] || [];
}
