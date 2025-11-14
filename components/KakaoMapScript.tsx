'use client';

import { useEffect } from 'react';

export default function KakaoMapScript() {
  useEffect(() => {
    const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

    if (!kakaoApiKey) {
      console.error('카카오 API 키가 설정되지 않았습니다.');
      return;
    }

    console.log('카카오 API 키:', kakaoApiKey);

    // 이미 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('카카오맵 이미 로드됨');
      return;
    }

    // 스크립트 동적 추가
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      console.log('카카오맵 스크립트 로드 완료');
    };

    script.onerror = (error) => {
      console.error('카카오맵 스크립트 로드 실패:', error);
      console.error('스크립트 URL:', script.src);
      console.error('API 키를 확인하세요. JavaScript 키여야 합니다 (REST API 키 아님)');
    };

    document.head.appendChild(script);

    return () => {
      // cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
