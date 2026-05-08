import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useNavermaps, useMap } from "react-naver-maps";

const MapInfoWindowGetLink = ({ selectedHouse, selectedMarker }) => {
	const navermaps = useNavermaps();
	const map = useMap();
	const history = useHistory();
	const infoWindowRef = useRef(null);
	const formatPrice = (price) => {
		if (!price || price === 0) return "0";
		const numPrice = Number(price);
		const uk = Math.floor(numPrice / 10000); //억단위
		const remain = numPrice % 10000; //만 단위 추출

		if (uk > 0) {
		//억이 있을 때
		return remain > 0 ? `${uk}억 ${remain.toLocaleString()}만` : `${uk}억`;
		} else {
		//억이 없을 때 (만 단위만 있을 때)
		return `${numPrice.toLocaleString()}만`;
		}
	};

	useEffect(() => {
		window.goToDetail = () => {
			history.push(`/PropertyDetail/${selectedHouse._id}`);
		};
		if (!navermaps || !map) return;

		if (!infoWindowRef.current) {
			infoWindowRef.current = new navermaps.InfoWindow({
        borderWidth: 0,
        backgroundColor: "#transparent",
        anchorSize: new navermaps.Size(0, 0),
        pixelOffset: new navermaps.Point(0, -5),
      });
		
		}

		const infoWindow = infoWindowRef.current;

		if (selectedHouse && selectedMarker) {			
			const content = `
        <div style="padding:10px; min-width:140px;" class="custom-marker-info">
        	<div class="custom-marker-info-title">${
            selectedHouse.tag === "apt"
              ? "아파트"
              : selectedHouse.tag === "officetel"
                ? "오피스텔"
                : "빌라"
          }</div>
        	<div class="custom-marker-info-deal">${
            selectedHouse.deal === "trade"
              ? "매매"
              : selectedHouse.deal === "yrent"
                ? "전세"
                : "월세"
          }</div>
        	<div class="custom-marker-info-price">${
            selectedHouse.deal === "trade"
              ? "매매금"
              : selectedHouse.deal === "yrent"
                ? "전세금"
                : "보증금"
          }: ${formatPrice(selectedHouse.bf)}원</div>
		  ${selectedHouse.deal === "mrent" ? `<div class="custom-marker-info-rent">월세 : ${selectedHouse.sf}만원</div>` : ""}
		  
			<button onclick="goToDetail()"class="custom-marker-info-btn">
            	Detail 보기
            </button>
        </div>
      `;

			infoWindow.setContent(content);
			infoWindow.open(map, selectedMarker);
		} else {
			infoWindow.close();
		}

		return () => {
			if (infoWindowRef.current) {
				infoWindowRef.current.close();
			}
		};
	}, [navermaps, map, selectedHouse, selectedMarker]);

	return null;
};

export default MapInfoWindowGetLink;
