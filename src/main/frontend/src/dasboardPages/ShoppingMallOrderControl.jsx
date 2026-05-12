import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";

const ShoppingMallOrderControl = () => {
	const [tabValue, setTabValue] = useState(0);
	const [orderList, setOrderList] = useState([]);

	const orderState = [
    { value: 0, delivery: "주문 접수" },
		{ value: 1, delivery: "출고 대기" },
		{ value: 2, delivery: "출고" },
		{ value: 3, delivery: "배송중" },
		{ value: 4, delivery: "배송완료" },
		{ value: 5, delivery: "구매확정" },
    { value: -1, delivery: "주문 취소" }
	];

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	return (
		<div>
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					{orderState.map((record, index) => {
						return (
							<Tab
								key={`${record.value}__${index}__${record.delivery}`}
								label={record.delivery}
								value={record.value}
							/>
						);
					})}
				</Tabs>
			</Box>
		</div>
	);
};

export default ShoppingMallOrderControl;
