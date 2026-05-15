import { useState } from "react";

import InteriorUpdate from "../components/InteriorUpdate";
import InteriorExUpdate from "../components/InteriorExUpdate";
import BookingUpdate from "../components/BookingUpdate";

//테스트용 파일
function InteriorUpdateAll(/*{ company }*/) {
	const [company, setCompany] = useState({
		c_id: "test1",
		c_kind: "interior",
		c_name: "인테리어",
	});

	return (
		<div>
			{/* <InteriorUpdate company={company} /> */}

			{/* <InteriorExUpdate company={company} /> */}

			<BookingUpdate
				company={{
					c_id: "testCompany",
					c_kind: "interior",
					c_name: "테스트업체인테리어1",
				}}
			/>
		</div>
	);
}

export default InteriorUpdateAll;
