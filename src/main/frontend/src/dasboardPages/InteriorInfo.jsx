import React from "react";

const InteriorInfo = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior");

	return (
		<div>
			InteriorInfo
			{interior.length !== 0 ? (
				interior?.map((record, index) => {
					return (
						<div>
							{record.c_name} && {record.c_addr}
						</div>
					);
				})
			) : (
				<div>등록된 인테리어 업체가 없습니다.</div>
			)}
		</div>
	);
};

export default InteriorInfo;
