import React from "react";
import { NavermapsProvider } from "react-naver-maps";
import MapsInner from "./MapsInner";

const Maps = ({ width, height }) => {
	const api_key = process.env.REACT_APP_NAVER_API_KEY;

	return (
		<div style={{ width: width ? width : "100%", height: height ? height : "500px" }}>
			<NavermapsProvider ncpKeyId={api_key}>
				<MapsInner />
			</NavermapsProvider>
		</div>
	);
};

export default Maps;
