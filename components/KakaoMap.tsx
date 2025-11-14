'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  address: string;
  className?: string;
}

export default function KakaoMap({ address, className = '' }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markerInstance = useRef<kakao.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !address) {
      setIsLoading(false);
      return;
    }

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 API가 로드되지 않았습니다.');
        setError('카카오맵 API를 로드할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      console.log('카카오맵 초기화 시작, 주소:', address);

      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result, status) => {
          console.log('주소 검색 결과:', status, result);

          if (status === 'OK' && result.length > 0) {
            const location = result[0].road_address || result[0].address;
            const coords = new window.kakao.maps.LatLng(
              parseFloat(location.y),
              parseFloat(location.x)
            );

            console.log('좌표:', location.y, location.x);

            if (!mapInstance.current && mapContainer.current) {
              mapInstance.current = new window.kakao.maps.Map(mapContainer.current, {
                center: coords,
                level: 3,
              });
              console.log('지도 생성 완료');
            } else if (mapInstance.current) {
              mapInstance.current.setCenter(coords);
            }

            if (markerInstance.current) {
              markerInstance.current.setMap(null);
            }

            if (mapInstance.current) {
              markerInstance.current = new window.kakao.maps.Marker({
                position: coords,
                map: mapInstance.current,
              });
              console.log('마커 생성 완료');
            }

            setIsLoading(false);
            setError(null);
          } else {
            console.error('주소 검색 실패:', status, result);
            setError(`주소를 찾을 수 없습니다: ${address}`);
            setIsLoading(false);
          }
        });
      });
    };

    // 약간의 딜레이 후 초기화 시작 (스크립트 로드 대기)
    const initTimeout = setTimeout(() => {
      console.log('window.kakao 존재 여부:', !!window.kakao);
      console.log('window.kakao.maps 존재 여부:', !!(window.kakao && window.kakao.maps));

      if (window.kakao && window.kakao.maps) {
        console.log('카카오맵 즉시 초기화');
        initMap();
      } else {
        console.log('카카오맵 API 로딩 대기 중...');
        let attempts = 0;
        const checkKakaoInterval = setInterval(() => {
          attempts++;
          console.log(`로딩 시도 ${attempts}/100, kakao:`, !!window.kakao, 'maps:', !!(window.kakao && window.kakao.maps));

          if (window.kakao && window.kakao.maps) {
            console.log('카카오맵 API 로드 완료');
            clearInterval(checkKakaoInterval);
            initMap();
          } else if (attempts > 100) {
            console.error('카카오맵 API 로드 시간 초과');
            clearInterval(checkKakaoInterval);
            setError('카카오맵 API 로드 시간이 초과되었습니다. 페이지를 새로고침해주세요.');
            setIsLoading(false);
          }
        }, 100);

        return () => clearInterval(checkKakaoInterval);
      }
    }, 500);

    return () => clearTimeout(initTimeout);
  }, [address]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400">지도 로딩 중...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div
        ref={mapContainer}
        className={className || 'h-[400px] w-full rounded-2xl overflow-hidden'}
      />
    </div>
  );
}
