import React from "react";
import { NavermapsProvider } from "react-naver-maps";
import DefaultMapsInner from "./DefaultMapsInner";
import MapSearchAddress from "./MapSearchAddress";
import "../css/DefaultMaps.css";

const DefaultMaps = (props) => {
	const {
		width = "100%",
		height = "500px",
		keyword,
		setSearchResults,
		setKeyword,
		center,
		inputRef,
		layout = "legacy",
	} = props;

	const apiKey = process.env.REACT_APP_NAVER_API_KEY;

	return (
		<div
			className="default-maps"
			style={{
				width,
				height,
			}}>
			<NavermapsProvider ncpKeyId={apiKey} submodules={["geocoder"]}>
				{layout === "stacked" ? (
					<div className="default-maps-layout">
						<MapSearchAddress
							keyword={keyword}
							setSearchResults={setSearchResults}
							setKeyword={setKeyword}
							inputRef={inputRef}
						/>

						<div className="default-maps-canvas">
							<DefaultMapsInner center={center} />
						</div>
					</div>
				) : (
					<>
						<DefaultMapsInner center={center} />
						<MapSearchAddress
							keyword={keyword}
							setSearchResults={setSearchResults}
							setKeyword={setKeyword}
							inputRef={inputRef}
						/>
					</>
				)}
			</NavermapsProvider>
		</div>
	);
};

export default DefaultMaps;
