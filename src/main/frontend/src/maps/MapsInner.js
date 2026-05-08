import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container as MapDiv, NaverMap, Marker, useNavermaps } from "react-naver-maps";

const MapsInner = (props) => {
	const { setMapHouseList, filteredList, onSelectedItem } = props;
	const navermaps = useNavermaps();
	const markerRefs = useRef({});
	const mapRef = useRef(null);

	const makeNaverPosition = (lat, lng) => {
		return new navermaps.LatLng(lat, lng);
	};

	const fixedCenter = makeNaverPosition(37.2633, 127.0283);

	const [center, setCenter] = useState(fixedCenter);

	const [hoveredId, setHoveredId] = useState(null);

	const [selectedHouse, setSelectedHouse] = useState(null);
	const [selectedMarker, setSelectedMarker] = useState(null);

	const markerClickHandler = (e, value) => {
		setSelectedHouse(value);
		setCenter(makeNaverPosition(value.position[0], value.position[1]));
		setSelectedMarker(markerRefs.current[value._id] || null);

		//Home.js로 보낼 env
		onSelectedItem && onSelectedItem(value);
	};

	const markerHoverHandler = (e, value) => {
		if (e.domEvent.type === "mouseenter") {
			// 마우스 들어옴
			setHoveredId(value.tag);
		} else if (e.domEvent.type === "mouseleave") {
			// 마우스 나감
			setHoveredId(null);
		}
	};

	const getHtmlMarker = (house) => {
		const isSelected = selectedHouse?._id === house._id;
		const isApartment = house.tag === "apt";
		const bgColor = isSelected ? "#73d366" : "#ffffff";
		const borderColor = isSelected ? "#rgba(45, 106, 79, 0.9)" : "#333";
		const size = isSelected ? 52 : 44;

		return {
			content: `
          	<div style="
            	width:${size}px;
            	height:${size}px;
            	background:${bgColor};
            	border:2px solid ${borderColor};
            	border-radius:50%;
            	display:flex;
            	align-items:center;
            	justify-content:center;
            	box-shadow:0 2px 8px rgba(45, 106, 79, 0.9);
            	box-sizing:border-box;
          	">
          	</div>`,
			size: new navermaps.Size(size, size),
			anchor: new navermaps.Point(size / 2, size / 2),
		};
	};

	const limitBounds = useMemo(() => {
		const gap = 1.025;
		const sw = new navermaps.LatLng(fixedCenter.lat() - gap, fixedCenter.lng() - gap);
		const ne = new navermaps.LatLng(fixedCenter.lat() + gap, fixedCenter.lng() + gap);
		return new navermaps.LatLngBounds(sw, ne);
	}, [navermaps, fixedCenter]);

	const handleMapIdle = () => {
		const map = mapRef.current;
		if (!map) return;

		const currentCenter = map.getCenter();

		if (!limitBounds.hasLatLng(currentCenter)) {
			map.panTo(fixedCenter);
			setCenter(fixedCenter);
			return;
		}
		setVisibleData();
	};

	const setVisibleData = () => {
		const map = mapRef.current;
		if (!map) return;
		const bounds = map.getBounds();
		if (!bounds) return;
		const sw = bounds.getSW();
		const ne = bounds.getNE();

		const visibleList = filteredList.filter((house) => {
			const lat = house.position[0];
			const lng = house.position[1];

			return lat >= sw.lat() && lat <= ne.lat() && lng >= sw.lng() && lng <= ne.lng();
		});
		setMapHouseList(visibleList);
	};

	useEffect(() => {
		setVisibleData();
	}, [filteredList]);

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
					minZoom={14}
					maxZoom={20}
					onIdle={handleMapIdle}
					// onInit={() => {setVisibleData();}}
				>
					{filteredList.map((house, index) => (
						<Marker
							key={house._id}
							position={makeNaverPosition(house.position[0], house.position[1])}
							onClick={(e) => markerClickHandler(e, house)}
							onMouseover={(e) => markerHoverHandler(e, house)}
							onMouseout={(e) => markerHoverHandler(e, house)}
							// icon={getIconByType(house)}
							//icon={getHtmlMarker(house)}
							ref={(ref) => {
								if (ref) markerRefs.current[house._id] = ref;
							}}
						/>
					))}
				</NaverMap>
			</MapDiv>
			<div style={{ marginTop: 16 }}>
				{hoveredId ? (
					<p>현재 호버 중인 마커 ID: {hoveredId}</p>
				) : (
					<p>마커에 마우스를 올려봐.</p>
				)}
			</div>
		</>
	);
};

export default MapsInner;
