import { LocationInfo, RealEstateTransaction } from '@/types';
import axios from 'axios';

const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';
const PUBLIC_DATA_API_KEY = decodeApiKey(process.env.PUBLIC_DATA_API_KEY);
const PUBLIC_DATA_API_BASE =
  'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade';
const RECENT_MONTHS_TO_FETCH = 6;
const MAX_TRANSACTION_RESULTS = 12;

type Coordinates = { lat: number; lng: number };
interface RegionInfo {
  sigunguCode?: string;
  dong?: string;
  bcode?: string;
}

function decodeApiKey(key?: string | null) {
  if (!key) {
    return '';
  }

  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

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
  exclusiveArea: number,
  coordinates?: Coordinates,
  regionInfoOverride?: RegionInfo
): Promise<RealEstateTransaction[]> {
  if (!PUBLIC_DATA_API_KEY) {
    console.warn('공공데이터포털 API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const regionInfo = regionInfoOverride ?? (await resolveRegionInfo(address, coordinates));
    const { sigunguCode, dong } = regionInfo;

    if (!sigunguCode) {
      console.warn('주소에서 지역 정보를 추출할 수 없습니다:', address);
      return [];
    }

    const recentDealMonths = buildRecentDealMonths(RECENT_MONTHS_TO_FETCH);
    const transactions: RealEstateTransaction[] = [];
    const deduplicationKey = new Set<string>();

    for (const dealYmd of recentDealMonths) {
      try {
        const response = await axios.get(`${PUBLIC_DATA_API_BASE}/getRTMSDataSvcAptTrade?type=json`, {
          params: {
            type: 'json',
            serviceKey: PUBLIC_DATA_API_KEY,
            LAWD_CD: sigunguCode,
            DEAL_YMD: dealYmd,
            numOfRows: 100,
            pageNo: 1,
          },
        });

        //console.dir(response.data, { depth: null });

        const data = response.data;

        // -----------------------------------------
        // 🔥 1) JSON 형태인지 검사
        // -----------------------------------------
       // 1) JSON 응답일 경우
        if (typeof data === 'object' && data?.response?.body?.items?.item) {
          const parsedList = parseTransactionsFromJson(
            data.response.body.items.item,
            { exclusiveArea }
          );

          for (const tx of parsedList) {
            const key = `${tx.apartmentName}-${tx.dealYear}-${tx.dealMonth}-${tx.dealDay}-${tx.exclusiveArea}-${tx.floor}`;
            if (!deduplicationKey.has(key)) {
              deduplicationKey.add(key);
              transactions.push(tx);
            }
          }

          continue; // 이번 Month 처리 끝
        }

        // -----------------------------------------
        // 🔥 2) 그렇지 않으면 XML 파싱으로 처리
        // -----------------------------------------
        const xml = typeof data === 'string' ? data : '';

        if (!xml) continue;

        const resultCodeMatch = xml.match(/<resultCode>(.*?)<\/resultCode>/);
        if (resultCodeMatch && resultCodeMatch[1] !== '000') {
          const resultMsgMatch = xml.match(/<resultMsg>(.*?)<\/resultMsg>/);
          console.warn(
            `실거래가 API 오류 (${resultCodeMatch[1]}): ${resultMsgMatch ? resultMsgMatch[1] : '알 수 없는 오류'}`
          );
          continue;
        }

        const parsed = parseTransactionsFromXml(xml, { exclusiveArea, dong });

        for (const tx of parsed) {
          const key = `${tx.apartmentName}-${tx.dealYear}-${tx.dealMonth}-${tx.dealDay}-${tx.exclusiveArea}-${tx.floor}`;
          if (!deduplicationKey.has(key)) {
            deduplicationKey.add(key);
            transactions.push(tx);
          }
        }
      } catch (error) {
        console.error(`실거래가 API 호출 실패 (${dealYmd}):`, error);
      }
    }

    return transactions
      .sort((a, b) => {
        const aDate = new Date(a.dealYear, a.dealMonth - 1, a.dealDay).getTime();
        const bDate = new Date(b.dealYear, b.dealMonth - 1, b.dealDay).getTime();
        return bDate - aDate;
      })
      .slice(0, MAX_TRANSACTION_RESULTS);
  } catch (error) {
    console.error('실거래가 조회 오류:', error);
    return [];
  }
}



function parseTransactionsFromJson(
  items: any[] | any,
  opts: { exclusiveArea?: number }
): RealEstateTransaction[] {
  if (!items) return [];

  // API는 item 이 하나일 경우 object로 반환되어 배열이 아닐 수 있음
  const list = Array.isArray(items) ? items : [items];

  const result: RealEstateTransaction[] = [];

  for (const item of list) {
    const exclusive = Number(item.excluUseAr);

    // 전용면적 필터가 있을 경우
    if (
      typeof opts.exclusiveArea === 'number' &&
      Math.abs(exclusive - opts.exclusiveArea) > 1
    ) {
      continue;
    }

    const dealAmount = Number(item.dealAmount?.replace(/,/g, '')) || 0;

    result.push({
      dealAmount, // 만원 단위 유지
      dealYear: Number(item.dealYear),
      dealMonth: Number(item.dealMonth),
      dealDay: Number(item.dealDay),
      exclusiveArea: exclusive,
      floor: Number(item.floor),
      buildYear: Number(item.buildYear),
      apartmentName: String(item.aptNm ?? '').trim(),
    });
  }

  return result;
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
    const regionInfo = await resolveRegionInfo(address, coordinates);

    // 2. 병렬로 주변 시설 정보 수집
    console.log('주변 시설 정보 수집 중...');
    const [subway, schools, hospitals, markets, parks, transactions] = await Promise.all([
      searchNearbySubways(coordinates.lat, coordinates.lng),
      searchNearbySchools(coordinates.lat, coordinates.lng),
      searchNearbyHospitals(coordinates.lat, coordinates.lng),
      searchNearbyMarkets(coordinates.lat, coordinates.lng),
      searchNearbyParks(coordinates.lat, coordinates.lng),
      getRealEstateTransactions(address, exclusiveArea, coordinates, regionInfo),
    ]);

    // 3. 지역 정보 추출
    const district = extractDistrict(address);
    //const developmentPlans = await getDevelopmentPlans(district, regionInfo);

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
      //developmentPlans: developmentPlans.length > 0 ? developmentPlans : undefined,
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
 * 주소에서 법정동코드를 추출하거나, Kakao 좌표→법정동 API로 보정
 */
async function resolveRegionInfo(
  address: string,
  coordinates?: Coordinates
): Promise<RegionInfo> {
  const regionFromAddress = extractRegionInfo(address);

  // 이미 시군구 코드와 동을 모두 추출했다면 그대로 사용
  if (regionFromAddress.sigunguCode && regionFromAddress.dong) {
    return regionFromAddress;
  }

  if (!KAKAO_API_KEY) {
    return regionFromAddress;
  }

  try {
    const resolvedCoordinates = coordinates ?? (await getCoordinatesFromAddress(address));
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          x: resolvedCoordinates.lng,
          y: resolvedCoordinates.lat,
          input_coord: 'WGS84',
        },
      }
    );

    const documents = response.data?.documents || [];
    const legalRegion =
      documents.find((doc: any) => doc.region_type === 'H') ??
      documents.find((doc: any) => doc.region_type === 'B') ??
      documents[0];

    if (legalRegion?.code) {
      return {
        sigunguCode: regionFromAddress.sigunguCode || legalRegion.code.slice(0, 5),
        dong: regionFromAddress.dong || legalRegion.region_3depth_name || legalRegion.region_2depth_name,
        bcode: regionFromAddress.bcode || legalRegion.code,
      };
    }
  } catch (error) {
    console.error('카카오 법정동 코드 조회 오류:', error);
  }

  return regionFromAddress;
}

/**
 * 주소에서 법정동코드 추출 (공공데이터 API용)
 */
function extractRegionInfo(address: string): RegionInfo {
  // 실제로는 행정구역코드 DB나 API를 사용해야 합니다
  // 여기서는 주요 지역만 하드코딩
  const regionCodes: { [key: string]: string } = {
 
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

interface TransactionParseOptions {
  exclusiveArea: number;
  dong?: string;
}

function buildRecentDealMonths(monthCount: number): string[] {
  const months: string[] = [];
  const base = new Date();

  for (let i = 0; i < monthCount; i++) {
    const cursor = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push(`${cursor.getFullYear()}${String(cursor.getMonth() + 1).padStart(2, '0')}`);
  }

  return months;
}

function parseTransactionsFromXml(xml: string, options: TransactionParseOptions): RealEstateTransaction[] {
  const items: RealEstateTransaction[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const normalizedDong = normalizeHangul(options.dong);
  const areaTolerance = options.exclusiveArea > 0 ? Math.max(3, options.exclusiveArea * 0.08) : 0;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const rawItem = match[1];
    const dongValue = normalizeHangul(extractTagValue(rawItem, 'umdNm'));
    if (!isDongSimilar(normalizedDong, dongValue)) {
      continue;
    }

    const areaValueRaw = extractTagValue(rawItem, 'excluUseAr');
    const areaValue = areaValueRaw ? parseFloat(areaValueRaw) : 0;

    if (!areaValue) {
      continue;
    }

    if (options.exclusiveArea > 0 && Math.abs(areaValue - options.exclusiveArea) > areaTolerance) {
      continue;
    }

    const dealAmountRaw = extractTagValue(rawItem, 'dealAmount');
    const dealYear = Number(extractTagValue(rawItem, 'dealYear') || 0);
    const dealMonth = Number(extractTagValue(rawItem, 'dealMonth') || 0);
    const dealDay = Number(extractTagValue(rawItem, 'dealDay') || 1);

    if (!dealAmountRaw || !dealYear || !dealMonth) {
      continue;
    }

    const dealAmount = Number(dealAmountRaw.replace(/[^\d]/g, ''));
    if (!dealAmount) {
      continue;
    }

    items.push({
      dealAmount,
      dealYear,
      dealMonth,
      dealDay,
      exclusiveArea: Number(areaValue.toFixed(2)),
      floor: Number(extractTagValue(rawItem, 'floor') || 0),
      buildYear: Number(extractTagValue(rawItem, 'buildYear') || 0),
      apartmentName: extractTagValue(rawItem, 'aptNm') || '정보 없음',
    });
  }

  return items;
}

function extractTagValue(source: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const match = source.match(regex);
  return match ? match[1].trim() : undefined;
}

function normalizeHangul(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.replace(/\s+/g, '').trim();
}

function isDongSimilar(expected?: string, actual?: string): boolean {
  if (!expected || !actual) {
    return true;
  }

  if (expected === actual) {
    return true;
  }

  return actual.startsWith(expected) || expected.startsWith(actual);
}

/**
 * 개발 계획 정보 조회 (국토부 OpenAPI + 모의 데이터 폴백)
 */
//async function getDevelopmentPlans(district: string, regionInfo?: RegionInfo): Promise<string[]> {

//}



function ensureJson(payload: unknown): any | undefined {
  if (!payload) {
    return undefined;
  }
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.error('도시계획 JSON 파싱 오류:', error);
      return undefined;
    }
  }

  return payload;
}

const PLAN_ITEM_KEY_CANDIDATES = [
  'planSeCodeNm',
  'prposAreaDstrcCodeNm',
  'prposDstrcCodeNm',
  'useDistrictNm',
  'ctyPlanFacilityNm',
  'planNm',
  'plnDc',
  'ctyPlanNm',
];

function collectPlanItems(value: any): Record<string, any>[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPlanItems(entry));
  }

  if (typeof value === 'object') {
    if (isPlanItem(value)) {
      return [value as Record<string, any>];
    }

    return Object.values(value).flatMap((entry) => collectPlanItems(entry));
  }

  return [];
}

function isPlanItem(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return PLAN_ITEM_KEY_CANDIDATES.some((key) => {
    const candidate = (value as Record<string, any>)[key];
    return typeof candidate === 'string' && candidate.trim().length > 0;
  });
}

function formatPlanItem(item: Record<string, any>): string | undefined {
  const kind =
    item.planSeCodeNm ||
    item.planSeCodeName ||
    item.planNm ||
    item.planClNm ||
    item.ctyPlanSeNm ||
    item.ctyPlanSe;

  const name =
    item.prposAreaDstrcCodeNm ||
    item.prposDstrcCodeNm ||
    item.useDistrictNm ||
    item.ctyPlanFacilityNm ||
    item.ctyPlanNm ||
    item.prposAreaNm ||
    item.planNm;

  const area = item.lawdNm || item.sigunguNm || item.admSectNm || item.regionNm;
  const period = item.aprvdYmd || item.confmDe || item.prdSe;
  const summarySource = item.plnDc || item.remark || item.ctyPlanDetail || item.cn;
  const summary = summarySource ? summarySource.replace(/\s+/g, ' ').trim() : '';

  if (!kind && !name && !summary) {
    return undefined;
  }

  const base = `${kind ? `[${kind}] ` : ''}${name || '도시계획'}${area ? ` (${area})` : ''}`.trim();
  const suffixParts = [period, summary].filter((part) => part && String(part).length > 0);
  if (suffixParts.length === 0) {
    return base;
  }

  return `${base} - ${suffixParts.join(' | ')}`.trim();
}
