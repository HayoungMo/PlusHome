import React, { useEffect, useMemo, useState } from "react";
import SelectMui from "./../components/SelectMui";
import TableMui from "./../components/TableMui";

const ShoppingMallReviewControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const [furnitureList, setFurnitureList] = useState([]);
	const [reviewList, setReviewList] = useState([]);

	useEffect(() => {
    
  }, []);

	return (
		<div>
			{/* <SelectMui
					label="배송 상태"
					value={deliveryChangeState}
					onChange={(e) => {
						setDeliveryChangeState(e.target.value);
					}}
					option={orderState}
					width="180px"
				/> */}

			<TableMui rowData={furnitureList} />
		</div>
	);
};

export default ShoppingMallReviewControl;
