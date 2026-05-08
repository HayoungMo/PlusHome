import React from "react";
import { NavermapsProvider } from "react-naver-maps";
import DefaultMapsInner from "./DefaultMapsInner";
import MapSearchAddress from "./MapSearchAddress";

const DefaultMaps = (props) => {
	const { width, height, keyword, setSearchResults, setKeyword,center,inputRef } = props;
	const api_key = process.env.REACT_APP_NAVER_API_KEY;

	return (
		<div style={{ width: width ? width : "100%", height: height ? height : "500px" }}>
			<NavermapsProvider ncpKeyId={api_key} submodules={["geocoder"]}>
				<DefaultMapsInner center={center}/>
				<MapSearchAddress
					keyword={keyword}
					setSearchResults={setSearchResults}
					setKeyword={setKeyword}
					inputRef={inputRef}
				/>
			</NavermapsProvider>
		</div>
	);
};

export default DefaultMaps;
