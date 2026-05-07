import React from "react";

const InteriorInfo = ({ userData }) => {
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior");
	return (
		<div>
			InteriorInfo
			{interior?.map((record, index) => {
				return (
					<div>
						{record.c_name} && {record.c_addr}
					</div>
				);
			})}
		</div>
	);
};

export default InteriorInfo;
