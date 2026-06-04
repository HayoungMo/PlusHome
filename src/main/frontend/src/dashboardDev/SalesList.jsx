import React, { useCallback, useEffect, useMemo, useState } from "react";
import userService from "../service/userService";
import TableChkMui from "../components/TableChkMui";
import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import TableMui from "../components/TableMui";
import DashboardService from "../service/dashboardService";
import SkeletonMui from "../components/SkeletonMui";
import { TbMessageDots } from "react-icons/tb";
import { FaWonSign } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Loading from "../components/Loading";

const KpiCard = ({ icon, label, value, unit, helper, tone = "blue" }) => (
	<div className="interior-dashboard-kpi">
		<div className={`interior-dashboard-kpi-icon ${tone}`}>{icon}</div>
		<div className="interior-dashboard-kpi-body">
			<span>{label}</span>
			<strong>
				{value}
				{unit && <em>{unit}</em>}
			</strong>
			{helper && (
				<div className="interior-dashboard-kpi-foot">
					<small>{helper}</small>
				</div>
			)}
		</div>
	</div>
);

const hasAnyResponse = (responses) => Object.keys(responses || {}).some((key) => key !== "error");

const formatValue = (value) => {
	if (typeof value === "number") return value.toLocaleString();
	return value ?? "-";
};

const num = (value) => {
	const numberValue = Number(value ?? 0);
	return Number.isFinite(numberValue) ? numberValue : 0;
};

const unwrap = (response, fallback) => {
	if (!response || response.success === false) return fallback;
	return response.companyList ?? response.data ?? fallback;
};

const dashboardRequests = [
	["categoryProduct", DashboardService.getCategoryProductStats],
	["totalStaticData", userService.getCatagoryStatistics],
];

const Saleslist = () => {
	const [loading, setLoading] = useState(false);

	const [dashboardData, setDashboardData] = useState({});

	const [statisticsList, setStatisticsList] = useState([]);

	const [openCategory, setOpenCategory] = useState(null);

	const [categoryTotalTableList, setCategoryTotalTableList] = useState([]);

	const [category1List, setCategory1List] = useState([]);
	const [category2List, setCategory2List] = useState([]);
	const [category3List, setCategory3List] = useState([]);
	const [category4List, setCategory4List] = useState([]);
	const [category5List, setCategory5List] = useState([]);

	const [category1SelectedRow, setCategory1SelectedRow] = useState(null);
	const [category2SelectedRow, setCategory2SelectedRow] = useState(null);
	const [category3SelectedRow, setCategory3SelectedRow] = useState(null);
	const [category4SelectedRow, setCategory4SelectedRow] = useState(null);

	

	const requestDto = useMemo(() => ({ f_catagory1: "y" }), []);

	const loadDashboardData = async () => {
		setLoading(true);
		console.log("loadDashboardData ====================");
		try {
			const entries = await Promise.all(
				dashboardRequests.map(async ([key, request]) => {
					try {
						let response;
						if (key === "totalStaticData") response = await request(requestDto);
						else response = await request({});
						return [
							key,
							response?.success === false && response?.error
								? { ...response, loadFailed: true }
								: response,
						];
					} catch (error) {
						return [
							key,
							{
								success: false,
								loadFailed: true,
								error: String(error),
								message: "대시보드 데이터를 불러오는 중 오류가 발생했습니다.",
							},
						];
					}
				}),
			);

			setDashboardData(Object.fromEntries(entries));
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const loadCategory2 = async () => {
		try {
			if (!category1SelectedRow) return;

			const result = await userService.getCatagoryStatistics({
				f_catagory1: category1SelectedRow.f_catagory1,
				f_catagory2: "y",
			});
			setCategory2List(result.list);
		} catch (error) {
			console.log(error);
		}
	};

	const loadCategory3 = async () => {
		try {
			if (!category2SelectedRow) return;

			const result = await userService.getCatagoryStatistics({
				f_catagory1: category1SelectedRow.f_catagory1,
				f_catagory2: category2SelectedRow.f_catagory2,
				f_catagory3: "y",
			});
			setCategory3List(result.list);
		} catch (error) {
			console.log(error);
		}
	};

	const loadCategory4 = async () => {
		try {
			if (!category3SelectedRow) return;

			const result = await userService.getCatagoryStatistics({
				f_catagory1: category1SelectedRow.f_catagory1,
				f_catagory2: category2SelectedRow.f_catagory2,
				f_catagory3: category3SelectedRow.f_catagory3,
				f_catagory4: "y",
			});

			setCategory4List(result.list);
		} catch (error) {
			console.log(error);
		}
	};

	const loadCategory5 = async () => {
		try {
			if (!category4SelectedRow) return;

			const result = await userService.getCatagoryStatistics({
				f_catagory1: category1SelectedRow.f_catagory1,
				f_catagory2: category2SelectedRow.f_catagory2,
				f_catagory3: category3SelectedRow.f_catagory3,
				f_catagory4: category4SelectedRow.f_catagory4,
				f_catagory5: "y",
			});

			setCategory5List(result.list);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		loadDashboardData();
	}, []);

	useEffect(() => {
		setOpenCategory(category1SelectedRow?.f_catagory1 || null);
		loadCategory2();
	}, [category1SelectedRow]);

	useEffect(() => {
		loadCategory3();
	}, [category2SelectedRow]);

	useEffect(() => {
		loadCategory4();
	}, [category3SelectedRow]);

	useEffect(() => {
		loadCategory5();
	}, [category4SelectedRow]);

	const stats = useMemo(() => {
		const categoryProduct = unwrap(dashboardData.categoryProduct, []);
		const totalStaticData = dashboardData.totalStaticData?.list || [];

		let totalCount = 0;

		for (let item of totalStaticData) {
			totalCount += item.f_count || 0;
		}

		let totalPrice = 0;

		for (let item of totalStaticData) {
			console.log(item);
			totalPrice += item.f_price || 0;
		}

		return {
			kpi: [
				{
					key: "totalCount",
					label: "총 판매 건수",
					value: formatValue(num(totalCount)),
					unit: "개",
					helper: "전체 판매 물품 수",
					icon: <HiOutlineShoppingBag />,
					tone: "red",
				},
				{
					key: "totalPrice",
					label: "총 매출액",
					value: formatValue(num(totalPrice)),
					unit: "원",
					helper: "전체 매출 총액",
					icon: <FaWonSign />,
					tone: "blue",
				},
			],
			category1List: totalStaticData,
			categoryProduct: categoryProduct,
		};
	}, [dashboardData]);
	const isInitialLoading = loading && !hasAnyResponse(dashboardData);

	if (loading) {
    return <Loading variant="table" count={5} />;
}

	return (
		<div>
			<section className="interior-dashboard-kpi-grid">
				{isInitialLoading ? (
					<SkeletonMui variant="kpi" count={2} />
				) : (
					stats.kpi.map((item) => <KpiCard key={item.key} {...item} />)
				)}
			</section>

			<h2>카테고리별 판매 통계</h2>

			<TableMui
				rowData={stats.category1List}
				col={["f_catagory1", "f_count", "f_price"]}
				columns={["카테고리1", "판매량", "매출액"]}
				selectedRow={category1SelectedRow}
				setSelectedRow={setCategory1SelectedRow}
			/>
			<div style={{ marginTop: "30px" }}>
				<h3>{openCategory}상세 통계</h3>

				<TableMui
					rowData={category2List}
					col={["f_catagory2", "f_count", "f_price"]}
					columns={["카테고리2", "판매량", "매출액"]}
					selectedRow={category2SelectedRow}
					setSelectedRow={setCategory2SelectedRow}
				/>

				<TableMui
					rowData={category3List}
					col={["f_catagory3", "f_count", "f_price"]}
					columns={["카테고리3", "판매량", "매출액"]}
					selectedRow={category3SelectedRow}
					setSelectedRow={setCategory3SelectedRow}
				/>
				<TableMui
					rowData={category4List}
					col={["f_catagory4", "f_count", "f_price"]}
					columns={["카테고리4", "판매량", "매출액"]}
					selectedRow={category4SelectedRow}
					setSelectedRow={setCategory4SelectedRow}
				/>
				<TableMui
					rowData={category5List}
					col={["f_catagory5", "f_count", "f_price"]}
					columns={["카테고리5", "판매량", "매출액"]}
				/>

				<hr />
				<h3>카테고리별 통계</h3>
				<TableMui
					rowData={stats.categoryProduct}
					col={[
						"categoryName",
						"productCount",
						"stockCount",
						"payCount",
						"saleQty",
						"totalPayAmount",
						"viewCount",
						"reviewCount",
						"avgStar",
					]}
					columns={[
						"카테고리명",
						"상품 수",
						"재고 합계",
						"결제 건수",
						"판매 수량",
						"총 결제금액",
						"조회수",
						"리뷰 수",
						"평균 별점",
					]}
				/>
			</div>
		</div>
	);
};

export default Saleslist;
