import React, { useEffect, useState } from "react";
import CouponService from "../service/couponService";
import TableChkMui from "../components/TableChkMui";

const CouponListDeve = (props) => {
	const [coupon, setCoupon] = useState();

	const { selectedCouponKeys, setSelectedCouponKeys, setReloadFunc } = props;

	const fetchCoupon = async () => {
		const result = await CouponService.selectCouponDev();
		if (!result.success) {
			return;
		}

		const couponList = (result.data || []).map((item, index) => ({
			no: index + 1,
			...item,
		}));

		setCoupon(couponList);
	};

	useEffect(() => {
		fetchCoupon();
		setReloadFunc(() => fetchCoupon);
	}, []);

	useEffect(() => {
		console.log("선택된 쿠폰", selectedCouponKeys);
	}, [selectedCouponKeys]);

	return (
		<div>
			<TableChkMui
				rowData={coupon}
				col={["번호", "쿠폰코드", "쿠폰코드 확인", "할인율", "유효기간", "최대 할인 금액", "쿠폰정보","사용여부","쿠폰 타입"]}
				selectedKeys={selectedCouponKeys}
				setSelectedKeys={setSelectedCouponKeys}
				pagination={true}
				defaultRowPerPage={5}
			/>
		</div>
	);
};

export default CouponListDeve;
