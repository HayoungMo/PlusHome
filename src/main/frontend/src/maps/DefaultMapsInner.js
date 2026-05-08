import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container as MapDiv, NaverMap, Marker, useNavermaps } from "react-naver-maps";
const DefaultMapsInner = ({center}) => {
	const navermaps = useNavermaps();
	const markerRefs = useRef({});
	const mapRef = useRef(null);

	const mapCenter = useMemo(() => {
        // 부모(AddProperty)가 준 center에 lat, lng 정보가 있다면 그걸 사용
        if (center && center.lat && center.lng) {
            return new navermaps.LatLng(center.lat, center.lng);
        }
        // 값이 없으면 기본값 (서울시청)
        return new navermaps.LatLng(37.5665, 126.978);
    }, [center, navermaps]);

	
	const makeNaverPosition = (lat, lng) => {
		return new navermaps.LatLng(lat, lng);
	};

	const fixedCenter = makeNaverPosition(37.5665, 126.978);

	//const [center, setCenter] = useState(fixedCenter);

	useEffect(() => {
    if (center && center.lat && center.lng && mapRef.current) {
        const newCenter = new navermaps.LatLng(center.lat, center.lng);
        // 직접 지도 객체의 setCenter를 호출하여 이동시킵니다.
        mapRef.current.setCenter(newCenter);
    }
}, [center, navermaps]);


	return (
		<>
			<MapDiv
				style={{
					width: "100%",
					height: "100%",
				}}>
				<NaverMap
					ref={mapRef}
					center={center}
					defaultZoom={14}
					// minZoom={14}
					// maxZoom={20}
				>
					<Marker 
                    position={mapCenter} 
                />
				</NaverMap>
			</MapDiv>
		</>
	);
};

export default DefaultMapsInner;
