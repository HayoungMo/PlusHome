import React from "react";

const ShoppingMallFurnitureInfo = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const shopList = companyList.filter((data) => data.c_kind === "shop");
	// c_addr, c_boss, c_id, c_info, c_kind, c_name, c_tel
	return (
		<div>
			ShoppingMallFurnitureInfo
			{shopList.length !== 0 ? (
				shopList?.map((record, index) => {
					return (
						<div>
							{record.c_name} && {record.c_addr}
						</div>
					);
				})
			) : (
				<div>등록된 쇼핑몰 업체가 없습니다.</div>
			)}
		</div>
	);
};

export default ShoppingMallFurnitureInfo;
