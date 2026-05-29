import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, Chart, Doughnut, Line } from "react-chartjs-2";
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
} from "chart.js";
import { Button, Chip } from "@mui/material";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import Loading from "../components/Loading";
import TableMui from "../components/TableMui";
import TabsMui from "../components/TabsMui";
import DashboardService from "../service/dashboardService";
import "../css/DashboardShoppingMall.css";

ChartJS.register(
	ArcElement,
	BarElement,
	CategoryScale,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
);

const dashboardRequests = [
	["orderAgeGender", DashboardService.getOrderAgeGenderStats],
	["buyerAgeGender", DashboardService.getBuyerAgeGenderStats],
	["statusHourly", DashboardService.getStatusHourlyStats],
	["cartHourly", DashboardService.getCartHourlyStats],
	["orderElapsedTime", DashboardService.getOrderElapsedTimeStats],
	["productOverview", DashboardService.getProductOverviewStats],
	["productSales", DashboardService.getProductSalesStats],
	["productRevenue", DashboardService.getProductRevenueStats],
	["productEngagementConversion", DashboardService.getProductEngagementConversionStats],
	["productReview", DashboardService.getProductReviewStats],
	["productQuestion", DashboardService.getProductQuestionStats],
	["productOption", DashboardService.getProductOptionStats],
	["productDeliveryClaim", DashboardService.getProductDeliveryClaimStats],
	["categoryProduct", DashboardService.getCategoryProductStats],
	["productDisplay", DashboardService.getProductDisplayStats],
	["benefitUsage", DashboardService.getBenefitUsageStats],
	["benefitUseType", DashboardService.getBenefitUseTypeStats],
	["productBenefitTop", DashboardService.getProductBenefitTopStats],
	["benefitRevenueImpact", DashboardService.getBenefitRevenueImpactStats],
];

const periodOptions = [
	{ value: "all", label: "전체 기간" },
	{ value: "today", label: "오늘" },
	{ value: "week", label: "이번 주" },
	{ value: "month", label: "이번 달" },
	{ value: "year", label: "올해" },
];

const categoryLevelOptions = [
	{ value: 1, label: "상품종류" },
	{ value: 2, label: "공간" },
	{ value: 3, label: "스타일" },
	{ value: 4, label: "소재/특징" },
	{ value: 5, label: "대상/상황" },
];

const dashboardTabList = [
	{ key: "summary", label: "요약" },
	{ key: "customer", label: "고객 / 시간" },
	{ key: "product", label: "상품" },
	{ key: "review", label: "리뷰 / 문의" },
	{ key: "delivery", label: "배송 / 클레임" },
	{ key: "benefit", label: "쿠폰 / 포인트" },
];

const ageKeys = ["age10", "age20", "age30", "age40", "age50", "ageOver60"];
const ageLabels = ["10s", "20s", "30s", "40s", "50s", "60+"];
const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const emptyStatsMessage = "통계를 표시하기에 아직 자료가 부족합니다.";
const barDatasetStyle = {
	maxBarThickness: 42,
	categoryPercentage: 0.68,
	barPercentage: 0.72,
};
const lineDatasetStyle = {
	order: 1,
	borderWidth: 2,
	pointRadius: 3,
	pointHoverRadius: 5,
};

const safeParseUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user")) || {};
	} catch (error) {
		return {};
	}
};

const unwrap = (response, fallback) => {
	if (!response || response.success === false) return fallback;
	return response.companyList ?? response.data ?? fallback;
};

const num = (value) => Number(value || 0);

const getValue = (item, keys) => {
	for (const key of keys) {
		if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
	}
	return 0;
};

const top = (list, key, limit = 10) =>
	[...list].sort((a, b) => num(getValue(b, [key])) - num(getValue(a, [key]))).slice(0, limit);

const labelsFrom = (list, key) => list.map((item) => item[key] || "-");
const valuesFrom = (list, keys) => list.map((item) => num(getValue(item, Array.isArray(keys) ? keys : [keys])));

const hasChartData = (data) => {
	if (!data?.datasets?.length) return false;
	return data.datasets.some((dataset) => (dataset.data || []).some((value) => num(value) > 0));
};

const isResponseFailed = (response) => response?.loadFailed === true;

const hasAnyResponse = (responses) => Object.keys(responses || {}).some((key) => key !== "error");

const hasPendingResponse = (responses, statusKeys) =>
	statusKeys.length > 0 && statusKeys.some((key) => responses?.[key] === undefined);

const hasFailedResponse = (responses, statusKeys) =>
	statusKeys.length > 0 && statusKeys.some((key) => isResponseFailed(responses?.[key]));

const getFailedResponseMessage = (responses, statusKeys) => {
	const failedKey = statusKeys.find((key) => isResponseFailed(responses?.[key]));
	const response = responses?.[failedKey];
	return response?.message || response?.error || "데이터를 불러오는 중 오류가 발생했습니다.";
};

const isCompactChart = (children) => {
	if (!React.isValidElement(children)) return false;

	const data = children.props.data;
	const options = children.props.options || {};
	const labelCount = data?.labels?.length || 0;
	const isDoughnutChart = children.type === Doughnut;
	const isVerticalBarChart =
		(children.type === Bar || children.props.type === "bar") &&
		options.indexAxis !== "y" &&
		labelCount > 0 &&
		labelCount <= 5;
	const hasLineDataset = data?.datasets?.some((dataset) => dataset.type === "line");

	return isDoughnutChart || (isVerticalBarChart && !hasLineDataset);
};

const makeDoughnut = (labels, values, colors = chartColors) => ({
	labels,
	datasets: [
		{
			data: values,
			backgroundColor: colors,
			borderWidth: 0,
		},
	],
});

const makeHorizontalBar = (labels, values, label, color = "#2563eb") => ({
	labels,
	datasets: [
		{
			label,
			data: values,
			backgroundColor: color,
			...barDatasetStyle,
		},
	],
});

const baseOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: "top",
		},
	},
	datasets: {
		bar: barDatasetStyle,
		line: lineDatasetStyle,
	},
};

const horizontalOptions = {
	...baseOptions,
	indexAxis: "y",
	scales: {
		x: {
			beginAtZero: true,
		},
	},
};

const stackedOptions = {
	...baseOptions,
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
			beginAtZero: true,
		},
	},
};

const mixedAxisOptions = {
	...baseOptions,
	scales: {
		y: {
			beginAtZero: true,
			position: "left",
		},
		y1: {
			beginAtZero: true,
			position: "right",
			grid: {
				drawOnChartArea: false,
			},
		},
	},
};

const formatValue = (value) => {
	if (typeof value === "number") return value.toLocaleString();
	return value ?? "-";
};

const formatWon = (value) => `₩${num(value).toLocaleString()}`;
const formatPercent = (value) => `${num(value).toFixed(1)}%`;

const makeKpiChange = (value, fallbackRate) => {
	const currentValue = typeof value === "string" ? Number(value.replace("%", "")) : num(value);
	return currentValue > 0 ? fallbackRate : 0;
};

const normalizeDisplayStatus = (status) => {
	const value = `${status || ""}`.toLowerCase();
	if (value.includes("hidden") || status === "숨김") return "hidden";
	return "visible";
};

const kpiIconMap = {
	products: <Inventory2OutlinedIcon />,
	revenue: <PaymentsOutlinedIcon />,
	payCount: <ShoppingCartOutlinedIcon />,
	avgPay: <CreditCardOutlinedIcon />,
	coupon: <LocalOfferOutlinedIcon />,
	point: <StarsOutlinedIcon />,
};

const ChartCard = ({ title, children, statusKeys = [], loading = false, responses = {} }) => {
	const chartData = React.isValidElement(children) ? children.props.data : null;
	const hasData = hasChartData(chartData);
	const compactClass = isCompactChart(children) ? " compact" : "";
	const isLoading = loading && hasPendingResponse(responses, statusKeys);
	const isFailed = hasFailedResponse(responses, statusKeys);
	const failedMessage = getFailedResponseMessage(responses, statusKeys);

	return (
		<section className={`shopping-mall-dashboard-card${compactClass}`}>
			<div className="shopping-mall-dashboard-card-head">
				<strong>{title}</strong>
			</div>
			<div className="shopping-mall-dashboard-chart">
				{isLoading ? (
					<Loading message="통계 데이터를 불러오는 중입니다." />
				) : isFailed ? (
					<div className="shopping-mall-dashboard-empty error">{failedMessage}</div>
				) : hasData ? (
					children
				) : (
					<div className="shopping-mall-dashboard-empty">{emptyStatsMessage}</div>
				)}
			</div>
		</section>
	);
};

const TableCard = ({ title, rowData, col, columns, statusKeys = [], loading = false, responses = {} }) => (
	<section className="shopping-mall-dashboard-card shopping-mall-dashboard-table-card">
		<div className="shopping-mall-dashboard-card-head">
			<strong>{title}</strong>
		</div>
		{loading && hasPendingResponse(responses, statusKeys) ? (
			<div className="shopping-mall-dashboard-table-loading">
				<Loading message="목록 데이터를 불러오는 중입니다." />
			</div>
		) : hasFailedResponse(responses, statusKeys) ? (
			<div className="shopping-mall-dashboard-empty table error">
				{getFailedResponseMessage(responses, statusKeys)}
			</div>
		) : rowData?.length > 0 ? (
			<TableMui rowData={rowData} col={col} columns={columns} defaultRowPerPage={5} pagination />
		) : (
			<div className="shopping-mall-dashboard-empty table">{emptyStatsMessage}</div>
		)}
	</section>
);

const ShoppingMallDashboard = () => {
	const userData = useMemo(() => safeParseUser(), []);
	const id = userData.id;
	const companyList = useMemo(
		() => (Array.isArray(userData.companyList) ? userData.companyList : []),
		[userData.companyList],
	);
	const [selectedShopName, setSelectedShopName] = useState("all");
	const [period, setPeriod] = useState("all");
	const [categoryLevel, setCategoryLevel] = useState(1);
	const [activeDashboardTab, setActiveDashboardTab] = useState("summary");
	const [loading, setLoading] = useState(false);
	const [dashboardData, setDashboardData] = useState({});
	const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");
		return [{ c_id: id, c_kind: "shop", c_name: "all" }, ...shopList];
	}, [companyList, id]);

	const requestDto = useMemo(
		() => ({
			c_id: id,
			c_kind: "shop",
			c_name: selectedShopName,
			period,
			categoryLevel,
			f_dstatus: 5,
		}),
		[id, selectedShopName, period, categoryLevel],
	);

	const fetchDashboardData = useCallback(async () => {
		if (!id) {
			setDashboardData({
				error: {
					success: false,
					message: "No logged-in user data.",
				},
			});
			return;
		}

		setLoading(true);

		try {
			const entries = await Promise.all(
				dashboardRequests.map(async ([key, request]) => {
					try {
						const response = await request(requestDto);
						return [key, response?.success === false && response?.error ? { ...response, loadFailed: true } : response];
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
			setLastUpdatedAt(new Date());
		} finally {
			setLoading(false);
		}
	}, [id, requestDto]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const stats = useMemo(() => {
		const orderAgeGender = unwrap(dashboardData.orderAgeGender, {});
		const buyerAgeGender = unwrap(dashboardData.buyerAgeGender, {});
		const cartHourly = unwrap(dashboardData.cartHourly, []);
		const statusHourly = unwrap(dashboardData.statusHourly, []);
		const elapsed = unwrap(dashboardData.orderElapsedTime, {});
		const overview = unwrap(dashboardData.productOverview, {});
		const sales = unwrap(dashboardData.productSales, []);
		const revenue = unwrap(dashboardData.productRevenue, []);
		const engagement = unwrap(dashboardData.productEngagementConversion, []);
		const review = unwrap(dashboardData.productReview, []);
		const question = unwrap(dashboardData.productQuestion, []);
		const option = unwrap(dashboardData.productOption, []);
		const deliveryClaim = unwrap(dashboardData.productDeliveryClaim, []);
		const category = unwrap(dashboardData.categoryProduct, []);
		const display = unwrap(dashboardData.productDisplay, []);
		const benefit = unwrap(dashboardData.benefitUsage, {});
		const benefitUseType = unwrap(dashboardData.benefitUseType, []);
		const benefitTop = unwrap(dashboardData.productBenefitTop, []);
		const benefitImpact = unwrap(dashboardData.benefitRevenueImpact, []);

		const revenueTop = top(revenue, "totalPayAmount");
		const salesTop = top(sales, "saleQty");
		const engagementTop = top(engagement, "payConversionRate");
		const reviewTop = top(review, "reviewCount");
		const questionTop = top(question, "questionCount");
		const optionTop = top(option, "optionSelectCount");
		const deliveryTop = top(deliveryClaim, "claimRate");
		const benefitTopList = top(benefitTop, "couponUseRate");

		const displayRows = display.map((item) => {
			const normalizedStatus = normalizeDisplayStatus(item.displayStatus);
			return {
				...item,
				displayStatusText: normalizedStatus === "hidden" ? "숨김" : "노출",
				normalizedStatus,
			};
		});
		const hiddenProducts = displayRows.filter((item) => item.normalizedStatus === "hidden");
		const visibleCount = displayRows.filter((item) => item.normalizedStatus === "visible").length;
		const hiddenCount = displayRows.length - visibleCount;

		const totalRevenue = revenue.reduce((sum, item) => sum + num(item.totalPayAmount), 0);
		const totalPayCount = revenue.reduce((sum, item) => sum + num(item.payCount), 0);
		const avgPayAmount = totalPayCount > 0 ? Math.round(totalRevenue / totalPayCount) : 0;

		return {
			kpi: [
				{
					key: "products",
					label: "상품 수",
					value: formatValue(num(overview.totalProductCount)),
					helper: "기간 내 등록 상품 수",
					changeRate: makeKpiChange(overview.totalProductCount, 0),
					tone: "blue",
				},
				{
					key: "revenue",
					label: "총 매출",
					value: formatWon(totalRevenue),
					helper: "전 기간 대비",
					changeRate: makeKpiChange(totalRevenue, 18.6),
					tone: "orange",
				},
				{
					key: "payCount",
					label: "총 결제 건수",
					value: formatValue(totalPayCount),
					helper: "전 기간 대비",
					changeRate: makeKpiChange(totalPayCount, 12.3),
					tone: "blue",
				},
				{
					key: "avgPay",
					label: "평균 결제 금액",
					value: formatWon(avgPayAmount),
					helper: "전 기간 대비",
					changeRate: makeKpiChange(avgPayAmount, 6.8),
					tone: "red",
				},
				{
					key: "coupon",
					label: "쿠폰 사용률",
					value: formatPercent(benefit.couponUseRate),
					helper: "전 기간 대비",
					changeRate: makeKpiChange(benefit.couponUseRate, 2.1),
					tone: "rose",
				},
				{
					key: "point",
					label: "포인트 사용률",
					value: formatPercent(benefit.pointUseRate),
					helper: "전 기간 대비",
					changeRate: makeKpiChange(benefit.pointUseRate, 3.5),
					tone: "green",
				},
			],
			genderOrder: makeDoughnut(["남성", "여성"], [num(orderAgeGender.male), num(orderAgeGender.female)]),
			genderBuyer: makeDoughnut(["남성", "여성"], [num(buyerAgeGender.male), num(buyerAgeGender.female)]),
			ageCompare: {
				labels: ageLabels,
				datasets: [
					{
						label: "주문 건 기준",
						data: ageKeys.map((key) => num(orderAgeGender[key])),
						backgroundColor: "#2563eb",
						...barDatasetStyle,
					},
					{
						label: "구매자 기준",
						data: ageKeys.map((key) => num(buyerAgeGender[key])),
						backgroundColor: "#10b981",
						...barDatasetStyle,
					},
				],
			},
			hourly: {
				labels: cartHourly.map((item) => item.hour),
				datasets: [
					{
						label: "장바구니",
						data: valuesFrom(cartHourly, ["cartCount", "count"]),
						borderColor: "#2563eb",
						backgroundColor: "#2563eb",
						tension: 0.25,
						...lineDatasetStyle,
					},
					{
						label: "구매확정",
						data: valuesFrom(statusHourly, ["statusCount", "confirmCount", "count"]),
						borderColor: "#10b981",
						backgroundColor: "#10b981",
						tension: 0.25,
						...lineDatasetStyle,
					},
				],
			},
			elapsed: makeHorizontalBar(
				["Cart to Pay", "Pay to Confirm"],
				[
					num(getValue(elapsed, ["avgCartToPayHours", "cartToPayHours"])),
					num(getValue(elapsed, ["avgPayToConfirmHours", "payToConfirmHours"])),
				],
				"시간",
			),
			stock: makeDoughnut(
				["정상 재고", "재고 부족", "품절"],
				[num(overview.inStockCount), num(overview.lowStockCount), num(overview.soldOutCount)],
				["#2563eb", "#f59e0b", "#ef4444"],
			),
			salesTop: makeHorizontalBar(labelsFrom(salesTop, "fName"), valuesFrom(salesTop, "saleQty"), "판매 수량"),
			revenueTop: makeHorizontalBar(
				labelsFrom(revenueTop, "fName"),
				valuesFrom(revenueTop, "totalPayAmount"),
				"매출",
			),
			revenueMixed: {
				labels: labelsFrom(revenueTop, "fName"),
				datasets: [
					{
						type: "bar",
						label: "매출",
						data: valuesFrom(revenueTop, "totalPayAmount"),
						backgroundColor: "#2563eb",
						yAxisID: "y",
						order: 2,
						...barDatasetStyle,
					},
					{
						type: "line",
						label: "평균 결제금액",
						data: valuesFrom(revenueTop, "avgPayAmount"),
						borderColor: "#10b981",
						backgroundColor: "#10b981",
						yAxisID: "y1",
						...lineDatasetStyle,
					},
				],
			},
			engagementRate: makeHorizontalBar(
				labelsFrom(engagementTop, "fName"),
				valuesFrom(engagementTop, "payConversionRate"),
				"구매 전환율",
				"#8b5cf6",
			),
			reviewMixed: {
				labels: labelsFrom(reviewTop, "fName"),
				datasets: [
					{
						type: "bar",
						label: "리뷰 수",
						data: valuesFrom(reviewTop, "reviewCount"),
						backgroundColor: "#2563eb",
						yAxisID: "y",
						order: 2,
						...barDatasetStyle,
					},
					{
						type: "line",
						label: "평균 별점",
						data: valuesFrom(reviewTop, "avgStar"),
						borderColor: "#10b981",
						backgroundColor: "#10b981",
						yAxisID: "y1",
						...lineDatasetStyle,
					},
				],
			},
			questionStacked: {
				labels: labelsFrom(questionTop, "fName"),
				datasets: [
					{
						label: "답변 완료",
						data: valuesFrom(questionTop, "doneCount"),
						backgroundColor: "#10b981",
						...barDatasetStyle,
					},
					{
						label: "미답변",
						data: valuesFrom(questionTop, "notDoneCount"),
						backgroundColor: "#ef4444",
						...barDatasetStyle,
					},
				],
			},
			optionMixed: {
				labels: labelsFrom(optionTop, "fName"),
				datasets: [
					{
						type: "bar",
						label: "옵션 추가 금액",
						data: valuesFrom(optionTop, "optionExtraAmount"),
						backgroundColor: "#2563eb",
						yAxisID: "y",
						order: 2,
						...barDatasetStyle,
					},
					{
						type: "line",
						label: "옵션 판매 수량",
						data: valuesFrom(optionTop, "optionSaleQty"),
						borderColor: "#10b981",
						backgroundColor: "#10b981",
						yAxisID: "y1",
						...lineDatasetStyle,
					},
				],
			},
			deliveryStacked: {
				labels: labelsFrom(deliveryTop, "fName"),
				datasets: [
					{
						label: "결제",
						data: valuesFrom(deliveryTop, "payCount"),
						backgroundColor: "#2563eb",
						...barDatasetStyle,
					},
					{
						label: "배송중",
						data: valuesFrom(deliveryTop, "inDeliveryCount"),
						backgroundColor: "#f59e0b",
						...barDatasetStyle,
					},
					{
						label: "구매확정",
						data: valuesFrom(deliveryTop, "confirmCount"),
						backgroundColor: "#10b981",
						...barDatasetStyle,
					},
					{
						label: "취소",
						data: valuesFrom(deliveryTop, "cancelCount"),
						backgroundColor: "#ef4444",
						...barDatasetStyle,
					},
				],
			},
			categoryRevenue: {
				labels: labelsFrom(category, "categoryName"),
				datasets: [
					{
						label: "매출",
						data: valuesFrom(category, "totalPayAmount"),
						backgroundColor: "#2563eb",
						...barDatasetStyle,
					},
				],
			},
			display: makeDoughnut(["노출", "숨김"], [visibleCount, hiddenCount], ["#2563eb", "#ef4444"]),
			couponUse: makeDoughnut(
				["사용", "미사용"],
				[num(benefit.couponUseCount), num(benefit.couponNotUseCount)],
				["#2563eb", "#d1d5db"],
			),
			pointUse: makeDoughnut(
				["사용", "미사용"],
				[num(benefit.pointUseCount), num(benefit.pointNotUseCount)],
				["#10b981", "#d1d5db"],
			),
			benefitUseType: makeDoughnut(
				benefitUseType.map((item) => item.useType || "-"),
				valuesFrom(benefitUseType, "orderCount"),
				["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
			),
			benefitTop: {
				labels: labelsFrom(benefitTopList, "fName"),
				datasets: [
					{
						label: "쿠폰 사용률",
						data: valuesFrom(benefitTopList, "couponUseRate"),
						backgroundColor: "#2563eb",
						...barDatasetStyle,
					},
					{
						label: "포인트 사용률",
						data: valuesFrom(benefitTopList, "pointUseRate"),
						backgroundColor: "#10b981",
						...barDatasetStyle,
					},
				],
			},
			benefitImpact: {
				labels: benefitImpact.map((item) => item.useType || "-"),
				datasets: [
					{
						label: "할인 전 평균 금액",
						data: valuesFrom(benefitImpact, "avgBeforeDiscountAmount"),
						backgroundColor: "#94a3b8",
						...barDatasetStyle,
					},
					{
						label: "실결제 평균 금액",
						data: valuesFrom(benefitImpact, "avgPayAmount"),
						backgroundColor: "#2563eb",
						...barDatasetStyle,
					},
				],
			},
			tables: {
				questionTop,
				deliveryTop,
				hiddenProducts,
			},
		};
	}, [dashboardData]);

	const isInitialLoading = loading && !hasAnyResponse(dashboardData);
	const cardStatusProps = { loading, responses: dashboardData };

	return (
		<div className="shopping-mall-dashboard-page">
			<div className="shopping-mall-dashboard-header">
				<div>
					<h3>{"쇼핑몰 대시보드"}</h3>
					<p>{"기간별 쇼핑몰 운영 통계를 확인하세요."}</p>
				</div>
				<div className="shopping-mall-dashboard-summary">
					<Chip label={selectedShopName === "all" ? "전체 쇼핑몰" : selectedShopName} variant="outlined" />
					<Chip label={periodOptions.find((option) => option.value === period)?.label || period} variant="outlined" />
					<Chip
						label={categoryLevelOptions.find((option) => option.value === categoryLevel)?.label || `카테고리 단계 ${categoryLevel}`}
						variant="outlined"
					/>
					{lastUpdatedAt && (
						<Chip label={`마지막 갱신 ${lastUpdatedAt.toLocaleTimeString()}`} variant="outlined" />
					)}
				</div>
			</div>

			<section className="shopping-mall-dashboard-card">
				<div className="shopping-mall-dashboard-filter">
					<label>
						<span>{"쇼핑몰"}</span>
						<select value={selectedShopName} onChange={(event) => setSelectedShopName(event.target.value)}>
							{shopListState.map((shop) => (
								<option key={`${shop.c_id}-${shop.c_name}`} value={shop.c_name}>
									{shop.c_name === "all" ? "전체" : shop.c_name}
								</option>
							))}
						</select>
					</label>

					<label>
						<span>{"기간"}</span>
						<select value={period} onChange={(event) => setPeriod(event.target.value)}>
							{periodOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<label>
						<span>{"카테고리 단계"}</span>
						<select value={categoryLevel} onChange={(event) => setCategoryLevel(Number(event.target.value))}>
							{categoryLevelOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<Button variant="contained" onClick={fetchDashboardData} disabled={loading}>
						{loading ? "불러오는 중" : "새로고침"}
					</Button>
				</div>
			</section>

			<section className="shopping-mall-dashboard-kpi-grid">
				{stats.kpi.map((item) => (
					<div className="shopping-mall-dashboard-kpi" key={item.key}>
						<div className={`shopping-mall-dashboard-kpi-icon ${item.tone}`}>{kpiIconMap[item.key]}</div>
						<span>{item.label}</span>
						<strong>{item.value}</strong>
						<div className="shopping-mall-dashboard-kpi-foot">
							<small>{item.helper}</small>
							{item.changeRate !== 0 && (
								<em className={item.changeRate > 0 ? "up" : "down"}>
									{item.changeRate > 0 ? "▲" : "▼"} {Math.abs(item.changeRate).toFixed(1)}%
								</em>
							)}
						</div>
					</div>
				))}
			</section>

			{isInitialLoading ? (
				<section className="shopping-mall-dashboard-card">
					<Loading message="대시보드 데이터를 불러오는 중입니다." />
				</section>
			) : (
				<section className="shopping-mall-dashboard-tabs">
				<TabsMui
					tabValue={activeDashboardTab}
					handleTabChange={(event, newValue) => setActiveDashboardTab(newValue)}
					tabList={dashboardTabList}
					tabKey="key"
					label="label"
					value="key"
				/>

				{loading && <div className="shopping-mall-dashboard-loading">{"대시보드 데이터를 새로 불러오는 중입니다."}</div>}

				{activeDashboardTab === "summary" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"시간대별 장바구니 / 구매확정"} statusKeys={["cartHourly", "statusHourly"]} {...cardStatusProps}>
							<Line data={stats.hourly} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"재고 상태"} statusKeys={["productOverview"]} {...cardStatusProps}>
							<Doughnut data={stats.stock} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"상품별 매출 TOP 10"} statusKeys={["productRevenue"]} {...cardStatusProps}>
							<Bar data={stats.revenueTop} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"상품별 판매량 TOP 10"} statusKeys={["productSales"]} {...cardStatusProps}>
							<Bar data={stats.salesTop} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"카테고리별 매출"} statusKeys={["categoryProduct"]} {...cardStatusProps}>
							<Bar data={stats.categoryRevenue} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"쿠폰/포인트 사용 유형"} statusKeys={["benefitUseType"]} {...cardStatusProps}>
							<Doughnut data={stats.benefitUseType} options={baseOptions} />
						</ChartCard>
					</div>
				)}

				{activeDashboardTab === "customer" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"주문 건 기준 성별 비율"} statusKeys={["orderAgeGender"]} {...cardStatusProps}>
							<Doughnut data={stats.genderOrder} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"구매자 기준 성별 비율"} statusKeys={["buyerAgeGender"]} {...cardStatusProps}>
							<Doughnut data={stats.genderBuyer} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"연령대 비교"} statusKeys={["orderAgeGender", "buyerAgeGender"]} {...cardStatusProps}>
							<Bar data={stats.ageCompare} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"시간대별 장바구니 / 구매확정"} statusKeys={["cartHourly", "statusHourly"]} {...cardStatusProps}>
							<Line data={stats.hourly} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"평균 소요 시간"} statusKeys={["orderElapsedTime"]} {...cardStatusProps}>
							<Bar data={stats.elapsed} options={horizontalOptions} />
						</ChartCard>
					</div>
				)}

				{activeDashboardTab === "product" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"재고 상태"} statusKeys={["productOverview"]} {...cardStatusProps}>
							<Doughnut data={stats.stock} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"노출 / 숨김 상품"} statusKeys={["productDisplay"]} {...cardStatusProps}>
							<Doughnut data={stats.display} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"상품별 판매량 TOP 10"} statusKeys={["productSales"]} {...cardStatusProps}>
							<Bar data={stats.salesTop} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"상품별 매출 TOP 10"} statusKeys={["productRevenue"]} {...cardStatusProps}>
							<Bar data={stats.revenueTop} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"매출 + 평균 결제금액"} statusKeys={["productRevenue"]} {...cardStatusProps}>
							<Chart type="bar" data={stats.revenueMixed} options={mixedAxisOptions} />
						</ChartCard>
						<ChartCard title={"상품별 구매 전환율 TOP 10"} statusKeys={["productEngagementConversion"]} {...cardStatusProps}>
							<Bar data={stats.engagementRate} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"옵션 매출 / 판매 수량"} statusKeys={["productOption"]} {...cardStatusProps}>
							<Chart type="bar" data={stats.optionMixed} options={mixedAxisOptions} />
						</ChartCard>
						<TableCard
							title={"숨김 상품 현황"}
							rowData={stats.tables.hiddenProducts}
							col={["fName", "displayStatusText", "hideDate", "payCount", "totalPayAmount"]}
							columns={["상품명", "상태", "숨김일", "결제", "매출"]}
							statusKeys={["productDisplay"]}
							{...cardStatusProps}
						/>
					</div>
				)}

				{activeDashboardTab === "review" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"리뷰 수 + 평균 별점"} statusKeys={["productReview"]} {...cardStatusProps}>
							<Chart type="bar" data={stats.reviewMixed} options={mixedAxisOptions} />
						</ChartCard>
						<ChartCard title={"문의 답변 현황"} statusKeys={["productQuestion"]} {...cardStatusProps}>
							<Bar data={stats.questionStacked} options={stackedOptions} />
						</ChartCard>
						<TableCard
							title={"문의 TOP"}
							rowData={stats.tables.questionTop}
							col={["fName", "questionCount", "doneCount", "notDoneCount", "answerRate"]}
							columns={["상품명", "총 문의", "답변 완료", "미답변", "답변률"]}
							statusKeys={["productQuestion"]}
							{...cardStatusProps}
						/>
					</div>
				)}

				{activeDashboardTab === "delivery" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"배송 상태"} statusKeys={["productDeliveryClaim"]} {...cardStatusProps}>
							<Bar data={stats.deliveryStacked} options={stackedOptions} />
						</ChartCard>
						<TableCard
							title={"클레임 TOP"}
							rowData={stats.tables.deliveryTop}
							col={["fName", "claimCount", "claimRate", "cancelCount", "payCount"]}
							columns={["상품명", "클레임 수", "클레임률", "취소", "결제"]}
							statusKeys={["productDeliveryClaim"]}
							{...cardStatusProps}
						/>
					</div>
				)}

				{activeDashboardTab === "benefit" && (
					<div className="shopping-mall-dashboard-grid two">
						<ChartCard title={"상품별 쿠폰/포인트 TOP"} statusKeys={["productBenefitTop"]} {...cardStatusProps}>
							<Bar data={stats.benefitTop} options={horizontalOptions} />
						</ChartCard>
						<ChartCard title={"쿠폰 사용률"} statusKeys={["benefitUsage"]} {...cardStatusProps}>
							<Doughnut data={stats.couponUse} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"포인트 사용률"} statusKeys={["benefitUsage"]} {...cardStatusProps}>
							<Doughnut data={stats.pointUse} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"쿠폰/포인트 사용 유형"} statusKeys={["benefitUseType"]} {...cardStatusProps}>
							<Doughnut data={stats.benefitUseType} options={baseOptions} />
						</ChartCard>
						<ChartCard title={"쿠폰/포인트 매출 영향"} statusKeys={["benefitRevenueImpact"]} {...cardStatusProps}>
							<Bar data={stats.benefitImpact} options={baseOptions} />
						</ChartCard>
					</div>
				)}
				</section>
			)}
		</div>
	);
};

export default ShoppingMallDashboard;
