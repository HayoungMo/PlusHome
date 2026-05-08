import React from "react";
import { NavermapsProvider } from "react-naver-maps";
import MapsInner from "./MapsInner";

const Maps = ({c_addr }) => {
	const api_key = process.env.REACT_APP_NAVER_API_KEY;

	return (
    <div
    >
      <NavermapsProvider ncpKeyId={api_key} submodules={["geocoder"]}>
        <MapsInner c_addr={c_addr} />
      </NavermapsProvider>
    </div>
  );
};

export default Maps;
