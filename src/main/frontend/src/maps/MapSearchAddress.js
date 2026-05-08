import React from "react";
import { useNavermaps } from "react-naver-maps";

const MapSearchAddress = (props) => {
	const { keyword, setSearchResults, setKeyword, inputRef } = props;
	const navermaps = useNavermaps();

	const searchAddress = () => {
		if (!keyword.trim()) {
			alert("주소를 입력해주세요.");
			if (inputRef && inputRef.current) {
            inputRef.current.focus(); 
        }
			return;
		}

		navermaps.Service.geocode(
			{
				query: keyword,
			},
			(status, response) => {
				if (status !== navermaps.Service.Status.OK) {
					alert("주소 검색에 실패했어.");
					inputRef?.current?.focus();
					return;
				}

				const items = response.v2.addresses || [];

				if (items.length === 0) {
					alert("검색 결과가 없어.");
					setKeyword(""); // 입력창 비워주기 (선택)
                	inputRef?.current?.focus();
					setSearchResults([]);
					return;
				}

				setSearchResults(items);
			},
		);
	};
	return (
		<div className="search-box-container">
        <input
			ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
			onKeyDown={(e) => {
				if (e.key === 'Enter') 
					{e.preventDefault();
						searchAddress();}
			}}
            placeholder="예: 원천동 606, 영통로 232"
            className="search-box-input" 
        />
        <button 
            type="button" 
            onClick={searchAddress}
            className="search-box-button" 
        >
            주소 검색
        </button>
    </div>
	);
};

export default MapSearchAddress;
