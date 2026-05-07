import React from "react";

const ShoppingMallInfo = ({ userData }) => {
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const shopList = companyList.filter((data) => data.c_kind === "shop");
	// c_addr, c_boss, c_id, c_info, c_kind, c_name, c_tel
	return (
		<div>
			ShoppingMallInfo
			{shopList?.map((record, index) => {
				return (
					<div>
						{record.c_name} && {record.c_addr}
					</div>
				);
			})}
		</div>
	);
};

export default ShoppingMallInfo;
