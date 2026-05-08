import React, { useEffect, useState } from "react";
import {
  Container as MapDiv,
  NaverMap,
  Marker,
  useNavermaps,
} from "react-naver-maps";

const MapsInner = ({ c_addr, height = "500px" }) => {
  const navermaps = useNavermaps();

  const defaultCenter = new navermaps.LatLng(37.2633, 127.0283);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (!c_addr) return;
    if (!window.naver?.maps?.Service) {
      console.error("geocoder submodule이 로드되지 않았습니다.");
      return;
    }

    window.naver.maps.Service.geocode({ query: c_addr }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        console.error("주소 변환 실패");
        return;
      }

      const result = response.v2.addresses[0];
      if (!result) {
        console.error("검색된 주소가 없습니다.");
        return;
      }

      const lat = parseFloat(result.y);
      const lng = parseFloat(result.x);

      setCenter(new navermaps.LatLng(lat, lng));
    });
  }, [c_addr, navermaps]);

  return (
    <MapDiv style={{ width: "100%", height }}>
      <NaverMap
        center={center}
        defaultZoom={16}
        draggable={false}
        pinchZoom={false}
        scrollWheel={false}
        keyboardShortcuts={false}
        disableDoubleTapZoom={true}
        disableDoubleClickZoom={true}
      >
        <Marker position={center} />
      </NaverMap>
    </MapDiv>
  );
};

export default MapsInner;
