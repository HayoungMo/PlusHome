import React, { useEffect, useMemo, useState } from "react";
import TableMui from "./../components/TableMui";
import TabsMui from "../components/TabsMui";
import AlertMui from "../components/AlertMui";
import CouponService from "./../service/couponService";
import CouponAdd from "../components/CouponAdd";
import ToggleButtonMui from "../components/ToggleButtonMui";
import { Chip } from "@mui/material";
import dayjs from "dayjs";
import "../css/DashboardShoppingMall.css";

const ShoppingMallCouponControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

	const alertInit = { severity: null, text: "", open: false };
	const [tabValue, setTabValue] = useState("all");
	const [selectedTabCompany, setSelectedTabCompany] = useState({ c_id: id, c_name: "all" });
	const [alertInfo, setAlertInfo] = useState(alertInit);
	const [allCouponList, setAllCouponList] = useState([]);
	const [viewDataType, setViewDataType] = useState("all");

	const today = useMemo(() => dayjs().startOf("day"), []);
	const emptyList = useMemo(() => [], []);

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList, id]);

	const displayCouponList = useMemo(() => {
		if (!allCouponList || allCouponList.length === 0) return emptyList;

		return allCouponList.filter((record) => {
			const matchTab = tabValue === "all" || tabValue === record.c_name;
			const couponEnd = dayjs(record.coupon_end).startOf("day");
			const matchViewType =
				viewDataType === "all" ||
				(viewDataType === "available" && couponEnd.isValid() && !couponEnd.isBefore(today)) ||
				(viewDataType === "expired" && couponEnd.isValid() && couponEnd.isBefore(today));

			return matchTab && matchViewType;
		});
	}, [allCouponList, tabValue, emptyList, viewDataType, today]);

	const couponStats = useMemo(() => {
		const available = allCouponList.filter((record) => {
			const couponEnd = dayjs(record.coupon_end).startOf("day");
			return couponEnd.isValid() && !couponEnd.isBefore(today);
		}).length;

		return {
			total: allCouponList.length,
			available,
			expired: Math.max(allCouponList.length - available, 0),
		};
	}, [allCouponList, today]);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);

		const selectedCompany = shopListState.find((record) => record.c_name === newValue);
		setSelectedTabCompany(selectedCompany);
	};

	const handleViewType = (event, newAlignment) => {
		if (newAlignment === null) return;

		setViewDataType(newAlignment);
	};

	const reLoadData = async () => {
		const result = await CouponService.getCouponListByCompanyId({ c_id: id });

		const isSuccess = result.success;
		const hasData = isSuccess && result.size > 0;

		setAlertInfo({
			severity: hasData ? "success" : isSuccess ? "info" : "error",
			title: hasData ? "조회 성공" : isSuccess ? "데이터 없음" : "조회 실패",
			text: result.message,
			open: true,
		});

		let couponList = emptyList;

		if (hasData) {
			couponList = result.couponList.map((record) => {
				const [c_id = "", c_kind = "", ...cNameParts] = (
					record.coupon_catagory || ""
				).split("_");

				return {
					...record,
					c_id,
					c_kind,
					c_name: cNameParts.join("_"),
				};
			});
		}

		setAllCouponList(couponList);
	};

	useEffect(() => {
		reLoadData();
	}, [id]);

	return (
		<div className="shopping-mall-coupon-page">
			<div className="shopping-mall-coupon-header">
				<div>
					<h3>쿠폰 관리</h3>
					<p>쇼핑몰별 쿠폰을 조회하고 새 쿠폰을 발급합니다.</p>
				</div>
				<div className="shopping-mall-coupon-summary">
					<Chip label={`전체 ${couponStats.total}개`} variant="outlined" />
					<Chip label={`사용 가능 ${couponStats.available}개`} color="primary" variant="outlined" />
					<Chip label={`만료 ${couponStats.expired}개`} color="warning" variant="outlined" />
				</div>
			</div>

			<section className="shopping-mall-coupon-card">
				<div className="shopping-mall-coupon-card-head">
					<div>
						<strong>
							{tabValue === "all" ? "전체 쇼핑몰" : selectedTabCompany?.c_name || tabValue}
						</strong>
						<span>쿠폰 목록</span>
					</div>
				</div>

				<div className="shopping-mall-coupon-filters">
					<TabsMui
						tabValue={tabValue}
						handleTabChange={handleTabChange}
						tabList={shopListState}
						tabKey="c_id"
						label="c_name"
						value="c_name"
					/>
					<ToggleButtonMui
						value={viewDataType}
						exclusive={true}
						onChange={handleViewType}
						ButtonList={[
							{ title: "전체 보기", value: "all" },
							{ title: "사용 가능", value: "available" },
							{ title: "만료", value: "expired" },
						]}
					/>
				</div>

				<div className="shopping-mall-coupon-table">
					<TableMui
						rowData={displayCouponList}
						col={[
							"id",
							"coupon_code",
							"discount",
							"coupon_end",
							"coupon_max",
							"coupon_info",
							"coupon_used",
							"userIds",
						]}
						columns={[
							"발급 대상",
							"쿠폰 코드",
							"할인율",
							"만료일",
							"최대 할인",
							"쿠폰 정보",
							"사용 여부",
							"사용자",
						]}
					/>
				</div>
			</section>

			<section className="shopping-mall-coupon-create">
				<div className="shopping-mall-coupon-create-head">
					<h4>쿠폰 등록</h4>
					<p>쇼핑몰 고객에게 발급할 쿠폰 정보를 입력합니다.</p>
				</div>
				<CouponAdd onCreated={reLoadData} />
			</section>

			{alertInfo.open && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertInfo({ ...alertInfo, open: false })}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default ShoppingMallCouponControl;
