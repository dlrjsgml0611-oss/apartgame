declare namespace kakao.maps {
  class LatLng {
    constructor(latitude: number, longitude: number);
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  namespace services {
    interface GeocoderResult {
      road_address: {
        address_name: string;
        x: string;
        y: string;
      } | null;
      address: {
        address_name: string;
        x: string;
        y: string;
      };
    }

    type GeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';

    class Geocoder {
      addressSearch(
        address: string,
        callback: (result: GeocoderResult[], status: GeocoderStatus) => void
      ): void;
    }
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: typeof kakao;
}
