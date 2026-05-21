import React, { useContext, useRef, useState } from "react";
import DefaultMaps from "./DefaultMaps";

const Address = ({ isC, form, setForm }) => { //company의 경우 isC에 True, 아니면 false (boolean)
  const addressInputRef = useRef(null); // 주소 검색창

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 37.2635,
    lng: 127.0286,
  });

  const selectAddress = (item) => {
    const newLat = parseFloat(item.y);
    const newLng = parseFloat(item.x);

    isC
      ? setForm((prev) => ({
          ...prev,
          c_addr1: item.roadAddress || item.jibunAddress,
          c_addr:
            prev.c_addr !== null && prev.c_addr?.includes("__")
              ? (item.roadAddress || item.jibunAddress) +
                "__" +
                prev.c_addr.split("__")[1]
              : item.roadAddress || item.jibunAddress,
        }))
      : setForm((prev) => ({
          ...prev,
          addr1: item.roadAddress || item.jibunAddress,
          addr:
            prev.addr !== null && prev.c_addr?.includes("__")
              ? (item.roadAddress || item.jibunAddress) +
                "__" +
                prev.addr.split("__")[1]
              : item.roadAddress || item.jibunAddress,
        }));

    setMapCenter({ lat: newLat, lng: newLng });
    setSearchResults([]);
    setKeyword("");
  };

  return (
    <div>
      <div className="section section-title">위치 정보</div>
      <div className="map-wrapper-section">
        <DefaultMaps
          keyword={keyword}
          setSearchResults={setSearchResults}
          setKeyword={setKeyword}
          center={mapCenter}
          height="300px"
          inputRef={addressInputRef}
        />
      </div>

      {/* 검색 결과 리스트 (클릭하면 selectAddress 실행) */}
      {searchResults.length > 0 && (
        <div className="search-result-box">
          {searchResults.map((item, index) => (
            <div
              key={index}
              onClick={() => selectAddress(item)}
              className="search-item"
            >
              <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                {item.jibunAddress}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>
                {item.roadAddress}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="form-label">주소</div>
      <div className="form-content">
        {/* 1. 검색된 전체 주소 (보여주기 전용, name 속성 제외하여 제출 방지) */}
        <input
          className="zb-input"
          style={{ width: "80%", backgroundColor: "#f5f5f5" }}
          value={isC
      ? form?.c_addr1 : form?.addr1}
          placeholder="지도에서 주소를 검색하세요"
          readOnly
        />
        **아파트 이름이 다를 경우 수정해 주세요!!**
      </div>
    </div>
  );
};

export default Address;
