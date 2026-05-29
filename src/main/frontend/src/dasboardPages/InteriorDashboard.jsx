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
import { Button, Chip, LinearProgress } from "@mui/material";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import Loading from "../components/Loading";
import SkeletonMui from "../components/SkeletonMui";
import TableMui from "../components/TableMui";
import TabsMui from "../components/TabsMui";
import DashboardService from "../service/dashboardService";
import "../css/DashboardInterior.css";

import { FaHammer } from "react-icons/fa";
import { TbMessageDots } from "react-icons/tb";
import { FaWonSign } from "react-icons/fa";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";

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
	["bookingOverview", DashboardService.getInteriorBookingOverviewStats],
	["bookingMonthly", DashboardService.getInteriorBookingMonthlyStats],
	["bookingLong", DashboardService.getInteriorBookingLongStats],
	["bookingConversion", DashboardService.getInteriorBookingConversionStats],
	["invoice", DashboardService.getInteriorInvoiceStats],
	["contract", DashboardService.getInteriorContractStats],
	["monthlyContract", DashboardService.getInteriorMonthlyContractStats],
	["invoiceItem", DashboardService.getInteriorInvoiceItemStats],
	["schedule", DashboardService.getInteriorScheduleStats],
	["monthlySchedule", DashboardService.getInteriorMonthlyScheduleStats],
	["customer", DashboardService.getInteriorCustomerStats],
	["repeatCustomer", DashboardService.getInteriorRepeatCustomerStats],
	["answerType", DashboardService.getInteriorAnswerTypeStats],
	["answerBudgetArea", DashboardService.getInteriorAnswerBudgetAreaStats],
	["answerSpace", DashboardService.getInteriorAnswerSpaceStats],
	["review", DashboardService.getInteriorReviewStats],
	["monthlyReview", DashboardService.getInteriorMonthlyReviewStats],
	["portfolio", DashboardService.getInteriorPortfolioStats],
	["exampleTag", DashboardService.getInteriorExampleTagStats],
	["recentExample", DashboardService.getInteriorRecentExampleStats],
	["interest", DashboardService.getInteriorInterestStats],
	["profileCompletion", DashboardService.getInteriorProfileCompletionStats],
	["risk", DashboardService.getInteriorRiskStats],
	["riskList", DashboardService.getInteriorRiskList],
];

const periodOptions = [
	{ value: "all", label: "전체 기간" },
	{ value: "today", label: "오늘" },
	{ value: "week", label: "이번 주" },
	{ value: "month", label: "이번 달" },
	{ value: "year", label: "올해" },
];

const dashboardTabList = [
	{ key: "summary", label: "요약" },
	{ key: "booking", label: "상담/견적" },
	{ key: "contract", label: "계약/일정" },
	{ key: "customer", label: "고객/요청" },
	{ key: "portfolio", label: "리뷰/시공사례" },
	{ key: "risk", label: "리스크" },
];

const statusLabels = {
	pending: "견적 대기",
	quoting: "견적 작성 중",
	confirmed: "확정",
	working: "시공/작업 중",
	done: "완료",
	cancel: "취소",
};

const bookingKindLabels = {
	byemail: "이메일 상담",
	bytel: "전화 상담",
};

const bookingLongLabels = {
	"1day": "1일 이내",
	"2to3days": "2~3일",
	"4to7days": "4~7일",
	"8to14days": "8~14일",
	over14days: "15일 이상",
	unknown: "미입력",
};

const answerValueLabels = {
	apt: "아파트",
	villa: "빌라",
	officetel: "오피스텔",
	house: "단독주택",
	new_house: "신혼집/새집",
	move: "이사",
	remodeling: "리모델링",
	repair: "부분수리",
	flex: "일정 유연",
	fixed: "일정 고정",
	unknown: "미입력",
};

const answerGroupLabels = {
	under500: "500만원 미만",
	"500to1000": "500~1000만원",
	"1000to2000": "1000~2000만원",
	"2000to3000": "2000~3000만원",
	over3000: "3000만원 이상",
	under10: "10평 미만",
	"10to20": "10~20평",
	"20to30": "20~30평",
	"30to40": "30~40평",
	over40: "40평 이상",
	unknown: "미입력",
};

const riskLabels = {
	oldPending: "오래된 상담 대기",
	oldQuoting: "오래된 견적 작성 중",
	noSchedule: "일정 미등록",
	scheduleDelay: "일정 지연 의심",
	reviewRequest: "리뷰 요청 가능",
	normal: "정상",
};

const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b"];
const funnelColors = [
	"#f59e0b", // 완료
	"#06b6d4", // 견적 진행
	"#10b981", // 계약 확정
	"#8b5cf6", // 작업 진행
	"#2563eb", // 상담 요청
	"#ef4444", // 취소
];
const emptyStatsMessage = "표시할 통계 데이터가 아직 부족합니다.";
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

const num = (value) => {
	const numberValue = Number(value ?? 0);
	return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatValue = (value) => {
	if (typeof value === "number") return value.toLocaleString();
	return value ?? "-";
};

const formatManwon = (value) => Math.round(num(value) / 10000).toLocaleString();
const formatPercent = (value) => `${num(value).toFixed(1)}%`;
const formatPercentNumber = (value) => num(value).toFixed(1);

const getValue = (item, keys) => {
	for (const key of keys) {
		if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
	}
	return 0;
};

const top = (list, key, limit = 10) =>
	[...list].sort((a, b) => num(getValue(b, [key])) - num(getValue(a, [key]))).slice(0, limit);

const labelsFrom = (list, key, mapper = (value) => value || "-") =>
	list.map((item) => mapper(item[key]));
const valuesFrom = (list, keys) =>
	list.map((item) => num(getValue(item, Array.isArray(keys) ? keys : [keys])));

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

const makeVerticalBar = (labels, values, label, color = "#2563eb") => ({
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

const ChartCard = ({ title, children, statusKeys = [], loading = false, responses = {} }) => {
	const chartData = React.isValidElement(children) ? children.props.data : null;
	const hasData = hasChartData(chartData);
	const isLoading = loading && hasPendingResponse(responses, statusKeys);
	const isFailed = hasFailedResponse(responses, statusKeys);
	const failedMessage = getFailedResponseMessage(responses, statusKeys);

	return (
		<section className="interior-dashboard-card">
			<div className="interior-dashboard-card-head">
				<strong>{title}</strong>
			</div>
			<div className="interior-dashboard-chart">
				{isLoading ? (
					<Loading message="통계 데이터를 불러오는 중입니다." />
				) : isFailed ? (
					<div className="interior-dashboard-empty error">{failedMessage}</div>
				) : hasData ? (
					children
				) : (
					<div className="interior-dashboard-empty">{emptyStatsMessage}</div>
				)}
			</div>
		</section>
	);
};

const TableCard = ({
	title,
	rowData,
	col,
	columns,
	statusKeys = [],
	loading = false,
	responses = {},
}) => (
	<section className="interior-dashboard-card interior-dashboard-table-card">
		<div className="interior-dashboard-card-head">
			<strong>{title}</strong>
		</div>
		{loading && hasPendingResponse(responses, statusKeys) ? (
			<div className="interior-dashboard-table-loading">
				<Loading message="목록 데이터를 불러오는 중입니다." />
			</div>
		) : hasFailedResponse(responses, statusKeys) ? (
			<div className="interior-dashboard-empty table error">
				{getFailedResponseMessage(responses, statusKeys)}
			</div>
		) : rowData?.length > 0 ? (
			<TableMui
				rowData={rowData}
				col={col}
				columns={columns}
				defaultRowPerPage={5}
				pagination
			/>
		) : (
			<div className="interior-dashboard-empty table">{emptyStatsMessage}</div>
		)}
	</section>
);

const aggregateProfileCompletion = (list) => {
	if (!Array.isArray(list) || list.length === 0) return {};
	if (list.length === 1) return list[0];

	const fields = [
		"telFilled",
		"addrFilled",
		"infoFilled",
		"bossFilled",
		"interiorTagFilled",
		"interiorTextFilled",
		"logoFilled",
		"profileImageFilled",
		"exampleFilled",
		"exampleImageFilled",
		"modelFilled",
	];
	const result = {
		cName: "전체",
		profileCompleteRate:
			list.reduce((sum, item) => sum + num(item.profileCompleteRate), 0) /
			Math.max(list.length, 1),
	};

	fields.forEach((field) => {
		result[field] = list.every((item) => num(item[field]) > 0) ? 1 : 0;
	});

	return result;
};

const aggregateInterest = (list) => {
	if (!Array.isArray(list) || list.length === 0) return {};
	if (list.length === 1) return list[0];

	const likeCount = list.reduce((sum, item) => sum + num(item.likeCount), 0);
	const bookingCount = list.reduce((sum, item) => sum + num(item.bookingCount), 0);
	const contractCount = list.reduce((sum, item) => sum + num(item.contractCount), 0);

	return {
		cName: "전체",
		likeCount,
		bookingCount,
		contractCount,
		likeToBookingRate: likeCount > 0 ? (bookingCount / likeCount) * 100 : 0,
		likeToContractRate: likeCount > 0 ? (contractCount / likeCount) * 100 : 0,
	};
};

const ProgressChecklist = ({ profile }) => {
	const checklist = [
		["telFilled", "전화번호 등록"],
		["addrFilled", "주소 등록"],
		["infoFilled", "소개글 등록"],
		["bossFilled", "대표자 등록"],
		["interiorTagFilled", "인테리어 태그 등록"],
		["interiorTextFilled", "인테리어 소개 등록"],
		["logoFilled", "로고 등록"],
		["profileImageFilled", "프로필 이미지 등록"],
		["exampleFilled", "시공 사례 등록"],
		["exampleImageFilled", "시공 사례 이미지 등록"],
		["modelFilled", "3D 모델 등록"],
	];
	const rate = num(profile.profileCompleteRate);

	return (
		<section className="interior-dashboard-card">
			<div className="interior-dashboard-card-head">
				<strong>프로필 완성도</strong>
				<Chip label={formatPercent(rate)} variant="outlined" size="small" />
			</div>
			<LinearProgress variant="determinate" value={Math.min(rate, 100)} />
			<div className="interior-dashboard-checklist">
				{checklist.map(([key, label]) => {
					const checked = num(profile[key]) > 0;
					return (
						<div className={checked ? "done" : "todo"} key={key}>
							<span>{checked ? "✓" : "!"}</span>
							{label}
						</div>
					);
				})}
			</div>
		</section>
	);
};

const InteriorDashboard = () => {
	const userData = useMemo(() => safeParseUser(), []);
	const id = userData.id;
	const companyList = useMemo(
		() => (Array.isArray(userData.companyList) ? userData.companyList : []),
		[userData.companyList],
	);
	const interiorList = useMemo(() => {
		const list = companyList.filter((company) => company.c_kind === "interior");
		return [{ c_id: id, c_kind: "interior", c_name: "all" }, ...list];
	}, [companyList, id]);

	const [selectedInteriorName, setSelectedInteriorName] = useState("all");
	const [period, setPeriod] = useState("all");
	const [activeDashboardTab, setActiveDashboardTab] = useState("summary");
	const [loading, setLoading] = useState(false);
	const [dashboardData, setDashboardData] = useState({});
	const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

	const requestDto = useMemo(
		() => ({
			c_id: id,
			c_kind: "interior",
			c_name: selectedInteriorName,
			period,
		}),
		[id, selectedInteriorName, period],
	);

	const fetchDashboardData = useCallback(async () => {
		if (!id) {
			setDashboardData({
				error: {
					success: false,
					message: "로그인 사용자 정보를 찾을 수 없습니다.",
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
			setLastUpdatedAt(new Date());
		} finally {
			setLoading(false);
		}
	}, [id, requestDto]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const stats = useMemo(() => {
		const bookingOverview = unwrap(dashboardData.bookingOverview, {});
		const bookingMonthly = unwrap(dashboardData.bookingMonthly, []);
		const bookingLong = unwrap(dashboardData.bookingLong, []);
		const bookingConversion = unwrap(dashboardData.bookingConversion, {});
		const invoice = unwrap(dashboardData.invoice, {});
		const contract = unwrap(dashboardData.contract, {});
		const monthlyContract = unwrap(dashboardData.monthlyContract, []);
		const invoiceItem = unwrap(dashboardData.invoiceItem, []);
		const schedule = unwrap(dashboardData.schedule, {});
		const monthlySchedule = unwrap(dashboardData.monthlySchedule, []);
		const customer = unwrap(dashboardData.customer, {});
		const repeatCustomer = unwrap(dashboardData.repeatCustomer, {});
		const answerType = unwrap(dashboardData.answerType, []);
		const answerBudgetArea = unwrap(dashboardData.answerBudgetArea, []);
		const answerSpace = unwrap(dashboardData.answerSpace, []);
		const review = unwrap(dashboardData.review, {});
		const monthlyReview = unwrap(dashboardData.monthlyReview, []);
		const portfolio = unwrap(dashboardData.portfolio, {});
		const exampleTag = unwrap(dashboardData.exampleTag, []);
		const recentExample = unwrap(dashboardData.recentExample, []);
		const interest = unwrap(dashboardData.interest, []);
		const profileCompletion = unwrap(dashboardData.profileCompletion, []);
		const risk = unwrap(dashboardData.risk, {});
		const riskList = unwrap(dashboardData.riskList, []);

		const selectedProfile =
			selectedInteriorName === "all"
				? aggregateProfileCompletion(profileCompletion)
				: profileCompletion.find((item) => item.cName === selectedInteriorName) || {};
		const selectedInterest =
			selectedInteriorName === "all"
				? aggregateInterest(interest)
				: interest.find((item) => item.cName === selectedInteriorName) || {};

		const housingRows = answerType.filter((item) => item.answerType === "housingType");
		const purposeRows = answerType.filter((item) => item.answerType === "purpose");
		const budgetRows = answerBudgetArea.filter((item) => item.answerType === "budget");
		const areaRows = answerBudgetArea.filter((item) => item.answerType === "area");
		const spaceTop = top(answerSpace, "requestCount");
		const invoiceItemTop = top(invoiceItem, "totalAmount");
		const exampleTagTop = top(exampleTag, "exampleCount");

		const riskRows = [
			{ label: "오래된 상담 대기", value: num(risk.oldPendingCount) },
			{ label: "오래된 견적 작성 중", value: num(risk.oldQuotingCount) },
			{ label: "일정 미등록", value: num(risk.confirmedNoScheduleCount) },
			{ label: "일정 지연 의심", value: num(risk.scheduleDelaySuspectCount) },
			{ label: "견적서 없음", value: num(risk.noInvoiceCount) },
			{ label: "리뷰 요청 가능", value: num(risk.reviewRequestTargetCount) },
		];
		const totalRiskCount = riskRows.reduce((sum, item) => sum + item.value, 0);

		return {
			kpi: [
				{
					key: "booking",
					label: "전체 상담",
					value: formatValue(num(bookingOverview.totalBookingCount)),
					unit: "건",
					helper: `오늘 ${formatValue(num(bookingOverview.todayBookingCount))}건`,
					icon: <TbMessageDots />,
					tone: "blue",
				},
				{
					key: "invoiceRate",
					label: "견적 확정률",
					value: formatPercentNumber(invoice.invoiceConfirmRate),
					unit: "%",
					helper: `확정 ${formatValue(num(invoice.confirmedInvoiceCount))}건`,
					icon: <LiaFileInvoiceDollarSolid />,
					tone: "green",
				},
				{
					key: "contract",
					label: "총 계약 금액",
					value: formatManwon(contract.totalContractAmount),
					unit: "만원",
					helper: `평균 ${formatManwon(contract.avgContractAmount)}만원`,
					icon: <FaWonSign />,
					tone: "orange",
				},
				{
					key: "schedule",
					label: "진행 중 일정",
					value: formatValue(num(schedule.workingScheduleCount)),
					unit: "건",
					helper: `이번 달 시작 ${formatValue(num(schedule.monthStartCount))}건`,
					icon: <FaHammer />,
					tone: "purple",
				},
				{
					key: "reviewRate",
					label: "리뷰 작성률",
					value: formatPercentNumber(review.reviewWriteRate),
					unit: "%",
					helper: `작성 ${formatValue(num(review.reviewWrittenCount))}건`,
					icon: <RateReviewOutlinedIcon />,
					tone: "yellow",
				},
				{
					key: "risk",
					label: "관리 필요",
					value: formatValue(totalRiskCount),
					unit: "건",
					helper: `지연 의심 ${formatValue(num(risk.scheduleDelaySuspectCount))}건`,
					icon: <ReportProblemOutlinedIcon />,
					tone: "red",
				},
			],
			bookingStatus: makeDoughnut(Object.values(statusLabels), [
				num(bookingOverview.pendingCount),
				num(bookingOverview.quotingCount),
				num(bookingOverview.confirmedCount),
				num(bookingOverview.workingCount),
				num(bookingOverview.doneCount),
				num(bookingOverview.cancelCount),
			]),
			bookingKind: makeDoughnut(
				Object.values(bookingKindLabels),
				[num(bookingOverview.emailBookingCount), num(bookingOverview.telBookingCount)],
				["#2563eb", "#10b981"],
			),
			bookingFunnel: makeHorizontalBar(
				["상담 요청", "견적 진행", "계약 확정", "작업 진행", "완료", "취소"],
				[
					num(bookingConversion.totalCount),
					num(bookingConversion.quoteStartCount),
					num(bookingConversion.confirmedCount),
					num(bookingConversion.workingCount),
					num(bookingConversion.doneCount),
					num(bookingConversion.cancelCount),
				],
				"건수",
				funnelColors,
			),
			bookingMonthly: makeVerticalBar(
				labelsFrom(bookingMonthly, "month"),
				valuesFrom(bookingMonthly, "bookingCount"),
				"상담 요청",
				"#2563eb",
			),
			bookingLong: makeVerticalBar(
				labelsFrom(
					bookingLong,
					"longGroup",
					(value) => bookingLongLabels[value] || value || "미입력",
				),
				valuesFrom(bookingLong, "bookingCount"),
				"상담 수",
				"#06b6d4",
			),
			invoiceKind: makeDoughnut(
				["확정 견적", "미확정 견적"],
				[num(invoice.confirmedInvoiceCount), num(invoice.normalInvoiceCount)],
				["#10b981", "#94a3b8"],
			),
			contractMonthly: {
				labels: labelsFrom(monthlyContract, "month"),
				datasets: [
					{
						type: "bar",
						label: "총 계약 금액",
						data: valuesFrom(monthlyContract, "totalContractAmount"),
						backgroundColor: "#2563eb",
						yAxisID: "y",
						order: 2,
						...barDatasetStyle,
					},
					{
						type: "line",
						label: "평균 계약 금액",
						data: valuesFrom(monthlyContract, "avgContractAmount"),
						borderColor: "#10b981",
						backgroundColor: "#10b981",
						yAxisID: "y1",
						...lineDatasetStyle,
					},
				],
			},
			invoiceItemTop: makeHorizontalBar(
				labelsFrom(invoiceItemTop, "invoiceText"),
				valuesFrom(invoiceItemTop, "totalAmount"),
				"견적 금액",
				"#8b5cf6",
			),
			scheduleStatus: makeDoughnut(
				["진행 중", "이번 달 시작", "지연 의심"],
				[
					num(schedule.workingScheduleCount),
					num(schedule.monthStartCount),
					num(schedule.delaySuspectCount),
				],
				["#2563eb", "#10b981", "#ef4444"],
			),
			scheduleMonthly: makeVerticalBar(
				labelsFrom(monthlySchedule, "month"),
				valuesFrom(monthlySchedule, "scheduleCount"),
				"시공 일정",
				"#10b981",
			),
			customerGender: makeDoughnut(
				["남성", "여성"],
				[num(customer.maleCount), num(customer.femaleCount)],
				["#2563eb", "#ef4444"],
			),
			customerAge: makeVerticalBar(
				["10대", "20대", "30대", "40대", "50대", "60대 이상"],
				[
					num(customer.age10),
					num(customer.age20),
					num(customer.age30),
					num(customer.age40),
					num(customer.age50),
					num(customer.ageOver60),
				],
				"고객 수",
				"#2563eb",
			),
			housingType: makeDoughnut(
				labelsFrom(
					housingRows,
					"answerValue",
					(value) => answerValueLabels[value] || value || "미입력",
				),
				valuesFrom(housingRows, "bookingCount"),
			),
			purpose: makeDoughnut(
				labelsFrom(
					purposeRows,
					"answerValue",
					(value) => answerValueLabels[value] || value || "미입력",
				),
				valuesFrom(purposeRows, "bookingCount"),
				["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"],
			),
			budget: makeVerticalBar(
				labelsFrom(
					budgetRows,
					"answerGroup",
					(value) => answerGroupLabels[value] || value || "미입력",
				),
				valuesFrom(budgetRows, "bookingCount"),
				"상담 수",
				"#f59e0b",
			),
			area: makeVerticalBar(
				labelsFrom(
					areaRows,
					"answerGroup",
					(value) => answerGroupLabels[value] || value || "미입력",
				),
				valuesFrom(areaRows, "bookingCount"),
				"상담 수",
				"#06b6d4",
			),
			spaceTop: makeHorizontalBar(
				labelsFrom(spaceTop, "spaceName"),
				valuesFrom(spaceTop, "requestCount"),
				"요청 수",
				"#8b5cf6",
			),
			reviewWritten: makeDoughnut(
				["리뷰 작성", "리뷰 미작성"],
				[num(review.reviewWrittenCount), num(review.reviewNotWrittenCount)],
				["#10b981", "#d1d5db"],
			),
			reviewMonthly: {
				labels: labelsFrom(monthlyReview, "month"),
				datasets: [
					{
						label: "리뷰 수",
						data: valuesFrom(monthlyReview, "reviewCount"),
						borderColor: "#2563eb",
						backgroundColor: "#2563eb",
						tension: 0.25,
						...lineDatasetStyle,
					},
				],
			},
			exampleTag: makeVerticalBar(
				labelsFrom(exampleTagTop, "exampleTag"),
				valuesFrom(exampleTagTop, "exampleCount"),
				"시공 사례",
				"#2563eb",
			),
			exampleImage: makeDoughnut(
				["이미지 있음", "이미지 없음"],
				[num(portfolio.imageExampleCount), num(portfolio.noImageExampleCount)],
				["#10b981", "#d1d5db"],
			),
			interestFlow: makeVerticalBar(
				["찜", "상담", "계약"],
				[
					num(selectedInterest.likeCount),
					num(selectedInterest.bookingCount),
					num(selectedInterest.contractCount),
				],
				"건수",
				"#2563eb",
			),
			riskBar: makeHorizontalBar(
				riskRows.map((item) => item.label),
				riskRows.map((item) => item.value),
				"관리 필요",
				"#ef4444",
			),
			profile: selectedProfile,
			riskRows,
			riskList: riskList.map((item) => ({
				...item,
				statusText: statusLabels[item.status] || item.status,
				riskTypeText: riskLabels[item.riskType] || item.riskType,
			})),
			recentExample: recentExample.map((item) => ({
				...item,
				ieContentSummary:
					item.ieContent && item.ieContent.length > 40
						? `${item.ieContent.slice(0, 40)}...`
						: item.ieContent,
			})),
			repeatCustomer,
			review,
			invoice,
			contract,
			schedule,
			portfolio,
			interest: selectedInterest,

			miniMetrics: [
				{
					key: "repeat",
					label: "재상담률",
					value: formatPercent(repeatCustomer.repeatCustomerRate),
					helper: "기존 고객 재유입 확인",
					tone: "blue",
				},
				{
					key: "review",
					label: "리뷰 작성률",
					value: formatPercent(review.reviewWriteRate),
					helper: "완료 후 후기 확보율",
					tone: "green",
				},
				{
					key: "workDays",
					label: "평균 시공 기간",
					value: `${formatValue(num(schedule.avgWorkDays))}일`,
					helper: "일정 운영 효율 확인",
					tone: "purple",
				},
				{
					key: "portfolio",
					label: "포트폴리오 등록률",
					value: formatPercent(portfolio.imageFillRate),
					helper: "업체 신뢰도 관리 지표",
					tone: "orange",
				},
				{
					key: "likeBooking",
					label: "찜 → 상담",
					value: formatPercent(selectedInterest.likeToBookingRate),
					helper: "관심 고객 상담 전환율",
					tone: "cyan",
				},
				{
					key: "likeContract",
					label: "찜 → 계약",
					value: formatPercent(selectedInterest.likeToContractRate),
					helper: "관심 고객 최종 계약률",
					tone: "red",
				},
			],
		};
	}, [dashboardData, selectedInteriorName]);

	const isInitialLoading = loading && !hasAnyResponse(dashboardData);
	const cardStatusProps = { loading, responses: dashboardData };

	return (
		<div className="interior-dashboard-page">
			<div className="interior-dashboard-header">
				<div>
					<h3>인테리어 대시보드</h3>
					<p>상담, 계약, 일정, 고객 니즈와 운영 리스크를 한눈에 확인합니다.</p>
				</div>
				<div className="interior-dashboard-summary">
					<Chip
						label={selectedInteriorName === "all" ? "전체 업체" : selectedInteriorName}
						variant="outlined"
					/>
					<Chip
						label={
							periodOptions.find((option) => option.value === period)?.label || period
						}
						variant="outlined"
					/>
					{lastUpdatedAt && (
						<Chip
							label={`마지막 갱신 ${lastUpdatedAt.toLocaleTimeString()}`}
							variant="outlined"
						/>
					)}
				</div>
			</div>

			<section className="interior-dashboard-card">
				<div className="interior-dashboard-filter">
					<label>
						<span>업체</span>
						<select
							value={selectedInteriorName}
							onChange={(event) => setSelectedInteriorName(event.target.value)}>
							{interiorList.map((company) => (
								<option
									key={`${company.c_id}-${company.c_name}`}
									value={company.c_name}>
									{company.c_name === "all" ? "전체" : company.c_name}
								</option>
							))}
						</select>
					</label>

					<label>
						<span>기간</span>
						<select value={period} onChange={(event) => setPeriod(event.target.value)}>
							{periodOptions.map((option) => (
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

			<section className="interior-dashboard-kpi-grid">
				{isInitialLoading ? (
					<SkeletonMui variant="kpi" count={6} />
				) : (
					stats.kpi.map((item) => <KpiCard key={item.key} {...item} />)
				)}
			</section>

			{isInitialLoading ? (
				<section className="interior-dashboard-card">
					<Loading message="대시보드 데이터를 불러오는 중입니다." />
				</section>
			) : (
				<section className="interior-dashboard-tabs">
					<TabsMui
						tabValue={activeDashboardTab}
						handleTabChange={(event, newValue) => setActiveDashboardTab(newValue)}
						tabList={dashboardTabList}
						tabKey="key"
						label="label"
						value="key"
					/>

					{loading && (
						<div className="interior-dashboard-loading">
							대시보드 데이터를 새로 불러오는 중입니다.
						</div>
					)}

					{activeDashboardTab === "summary" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="상담 진행 퍼널"
								statusKeys={["bookingConversion"]}
								{...cardStatusProps}>
								<Bar data={stats.bookingFunnel} options={horizontalOptions} />
							</ChartCard>
							<ChartCard
								title="월별 계약 금액"
								statusKeys={["monthlyContract"]}
								{...cardStatusProps}>
								<Chart
									type="bar"
									data={stats.contractMonthly}
									options={mixedAxisOptions}
								/>
							</ChartCard>
							<ChartCard
								title="시공 일정 상태"
								statusKeys={["schedule"]}
								{...cardStatusProps}>
								<Doughnut data={stats.scheduleStatus} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="운영 리스크"
								statusKeys={["risk"]}
								{...cardStatusProps}>
								<Bar data={stats.riskBar} options={horizontalOptions} />
							</ChartCard>
							<section className="interior-dashboard-card interior-dashboard-assist-card">
								<div className="interior-dashboard-card-head interior-dashboard-assist-head">
									<div>
										<strong>보조 지표</strong>
										<p>운영 효율과 전환 흐름을 빠르게 확인합니다.</p>
									</div>
									<ChecklistOutlinedIcon />
								</div>

								<div className="interior-dashboard-assist-grid">
									{stats.miniMetrics.map((item) => (
										<div
											className={`interior-dashboard-assist-item ${item.tone}`}
											key={item.key}>
											<div className="assist-item-label">
												<span>{item.label}</span>
											</div>

											<strong>{item.value}</strong>
											<small>{item.helper}</small>
										</div>
									))}
								</div>
							</section>
						</div>
					)}

					{activeDashboardTab === "booking" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="상담 상태별 현황"
								statusKeys={["bookingOverview"]}
								{...cardStatusProps}>
								<Doughnut data={stats.bookingStatus} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="상담 진행 퍼널"
								statusKeys={["bookingConversion"]}
								{...cardStatusProps}>
								<Bar data={stats.bookingFunnel} options={horizontalOptions} />
							</ChartCard>
							<ChartCard
								title="월별 상담 요청"
								statusKeys={["bookingMonthly"]}
								{...cardStatusProps}>
								<Bar data={stats.bookingMonthly} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="상담 방식 비율"
								statusKeys={["bookingOverview"]}
								{...cardStatusProps}>
								<Doughnut data={stats.bookingKind} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="상담 소요 기간 분포"
								statusKeys={["bookingLong"]}
								{...cardStatusProps}>
								<Bar data={stats.bookingLong} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="확정 / 미확정 견적"
								statusKeys={["invoice"]}
								{...cardStatusProps}>
								<Doughnut data={stats.invoiceKind} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="견적 항목 TOP 10"
								statusKeys={["invoiceItem"]}
								{...cardStatusProps}>
								<Bar data={stats.invoiceItemTop} options={horizontalOptions} />
							</ChartCard>
						</div>
					)}

					{activeDashboardTab === "contract" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="월별 계약 금액"
								statusKeys={["monthlyContract"]}
								{...cardStatusProps}>
								<Chart
									type="bar"
									data={stats.contractMonthly}
									options={mixedAxisOptions}
								/>
							</ChartCard>
							<ChartCard
								title="찜 / 상담 / 계약 비교"
								statusKeys={["interest"]}
								{...cardStatusProps}>
								<Bar data={stats.interestFlow} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="시공 일정 상태"
								statusKeys={["schedule"]}
								{...cardStatusProps}>
								<Doughnut data={stats.scheduleStatus} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="월별 시공 일정"
								statusKeys={["monthlySchedule"]}
								{...cardStatusProps}>
								<Bar data={stats.scheduleMonthly} options={baseOptions} />
							</ChartCard>
						</div>
					)}

					{activeDashboardTab === "customer" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="고객 성별 비율"
								statusKeys={["customer"]}
								{...cardStatusProps}>
								<Doughnut data={stats.customerGender} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="고객 연령대 분포"
								statusKeys={["customer"]}
								{...cardStatusProps}>
								<Bar data={stats.customerAge} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="주거 유형"
								statusKeys={["answerType"]}
								{...cardStatusProps}>
								<Doughnut data={stats.housingType} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="인테리어 목적"
								statusKeys={["answerType"]}
								{...cardStatusProps}>
								<Doughnut data={stats.purpose} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="예산 구간"
								statusKeys={["answerBudgetArea"]}
								{...cardStatusProps}>
								<Bar data={stats.budget} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="평수 구간"
								statusKeys={["answerBudgetArea"]}
								{...cardStatusProps}>
								<Bar data={stats.area} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="요청 공간 TOP 10"
								statusKeys={["answerSpace"]}
								{...cardStatusProps}>
								<Bar data={stats.spaceTop} options={horizontalOptions} />
							</ChartCard>
						</div>
					)}

					{activeDashboardTab === "portfolio" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="리뷰 작성 여부"
								statusKeys={["review"]}
								{...cardStatusProps}>
								<Doughnut data={stats.reviewWritten} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="월별 리뷰 수"
								statusKeys={["monthlyReview"]}
								{...cardStatusProps}>
								<Line data={stats.reviewMonthly} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="시공 사례 태그"
								statusKeys={["exampleTag"]}
								{...cardStatusProps}>
								<Bar data={stats.exampleTag} options={baseOptions} />
							</ChartCard>
							<ChartCard
								title="시공 사례 이미지 등록 상태"
								statusKeys={["portfolio"]}
								{...cardStatusProps}>
								<Doughnut data={stats.exampleImage} options={baseOptions} />
							</ChartCard>
							<TableCard
								title="최근 시공 사례"
								rowData={stats.recentExample}
								col={["cName", "ieIndex", "ieTag", "ieTag2", "ieContentSummary"]}
								columns={["업체명", "번호", "태그", "보조 태그", "내용"]}
								statusKeys={["recentExample"]}
								{...cardStatusProps}
							/>
							<ProgressChecklist profile={stats.profile} />
						</div>
					)}

					{activeDashboardTab === "risk" && (
						<div className="interior-dashboard-grid two">
							<ChartCard
								title="운영 리스크"
								statusKeys={["risk"]}
								{...cardStatusProps}>
								<Bar data={stats.riskBar} options={horizontalOptions} />
							</ChartCard>
							<TableCard
								title="관리 필요 목록"
								rowData={stats.riskList}
								col={[
									"id",
									"cName",
									"createdDate",
									"bookingDate",
									"statusText",
									"riskTypeText",
								]}
								columns={[
									"고객 ID",
									"업체명",
									"상담 생성일",
									"상담 희망일",
									"상태",
									"리스크 유형",
								]}
								statusKeys={["riskList"]}
								{...cardStatusProps}
							/>
							<ProgressChecklist profile={stats.profile} />
						</div>
					)}
				</section>
			)}
		</div>
	);
};

export default InteriorDashboard;
