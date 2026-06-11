import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Chip, Dialog } from "@mui/material";
import AlertMui from "../components/AlertMui";
import DateRangeFilter from "../components/DateRangeFilter";
import FilterBar from "../components/FilterBar";
import TableCheckBoxMui from "../components/TableCheckBoxMui";
import TableMui from "./../components/TableMui";
import TabsMui from "../components/TabsMui";
import ImageService from "../service/imageService";
import OrderClaimService from "../service/orderClaimService";
import "../css/DashboardShoppingMall.css";
import dayjs from "dayjs";
import Loading from "../components/Loading";

const TEXT = {
	statusRequest: "신청완료",
	statusReceived: "접수",
	statusProcessing: "처리중",
	statusDone: "처리완료",
	statusReject: "거절",
	exchange: "교환",
	returnClaim: "반품",
	requestDate: "신청일",
	requestCode: "신청번호",
	type: "유형",
	status: "상태",
	company: "회사",
	productName: "상품명",
	requesterId: "신청자 ID",
	requesterName: "신청자명",
	tel: "연락처",
	count: "수량",
	payTotal: "결제금액",
	reason: "사유",
	success: "조회 성공",
	empty: "데이터 없음",
	fail: "조회 실패",
	title: "교환/반품 관리",
	description: "쇼핑몰별 교환/반품 신청 내역을 조회하고 처리 상태를 확인합니다.",
	total: "전체",
	caseUnit: "건",
	listTitle: "교환/반품 신청 목록",
	newListTitle: "신규 신청 목록",
	managedListTitle: "처리 관리 목록",
	noData: "조회된 교환/반품 신청이 없습니다.",
	noNewData: "신규 교환/반품 신청이 없습니다.",
	accept: "접수",
	bulkProcessing: "처리중",
	bulkDone: "처리 완료",
	bulkReject: "거절",
	bulkSuccess: "상태 변경 완료",
	bulkFail: "상태 변경 실패",
	acceptSuccess: "접수 처리 완료",
	acceptFail: "접수 처리 실패",
	detailTitle: "선택 신청 상세",
	detailEmpty: "목록에서 신청 건을 선택하면 상세 정보와 첨부 이미지를 확인할 수 있습니다.",
	imageEmpty: "첨부 이미지가 없습니다.",
	imageLoading: "이미지를 불러오는 중입니다.",
	startDate: "시작일",
	endDate: "종료일",
	dateReset: "기간 초기화",
	dateRangeFail: "기간 확인 필요",
};

const claimStatusTabs = [
	{ label: "전체", value: "all" },
	{ label: TEXT.statusReceived, value: "1" },
	{ label: TEXT.statusProcessing, value: "2" },
	{ label: TEXT.statusDone, value: "3" },
	{ label: TEXT.statusReject, value: "-1" },
];

const newClaimTableColumns = [
	"claim_createddate",
	"claim_type_name",
	"f_name",
	"user_name",
	"pay_total",
];

const newClaimTableColumnLabels = [
	TEXT.requestDate,
	TEXT.type,
	TEXT.productName,
	TEXT.requesterName,
	TEXT.payTotal,
];

const managedTableColumns = [
	"claim_createddate",
	"claim_type_name",
	"claim_status_name",
	"f_name",
	"user_name",
	"pay_total",
];

const managedTableColumnLabels = [
	TEXT.requestDate,
	TEXT.type,
	TEXT.status,
	TEXT.productName,
	TEXT.requesterName,
	TEXT.payTotal,
];
const alertInit = { severity: null, title: "", text: "", open: false };

const getClaimImageKey = (claimCode, userId) => `${claimCode || ""}__${userId || ""}`;

const formatWon = (value) => {
	if (value === null || value === undefined || value === "") return "-";

	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) return value;

	return `${numberValue.toLocaleString()}\uc6d0`;
};

const renderClaimCell = (row, column) => {
	if (column === "pay_total") return formatWon(row[column]);

	return row[column];
};

const sortClaimImages = (imageList) =>
	[...(imageList || [])].sort((a, b) => {
		if (a.img_tag === "THUMBNAIL" && b.img_tag !== "THUMBNAIL") return -1;
		if (a.img_tag !== "THUMBNAIL" && b.img_tag === "THUMBNAIL") return 1;

		return Number(a.img_idx || 0) - Number(b.img_idx || 0);
	});

const ShoppingMallClaim = () => {
	const localUserData = localStorage.getItem("user");
	const userData = localUserData ? JSON.parse(localUserData) : {};
	const { id, companyList = [] } = userData;

	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("교환/반품 신청 목록을 불러오는 중입니다...");
	const [selectedNewClaim, setSelectedNewClaim] = useState({});
	const [selectedManagedClaim, setSelectedManagedClaim] = useState({});
	const [claimStatus, setClaimStatus] = useState("all");
	const [filterBarState, setFilterBarState] = useState({});
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedFilterBarState, setAppliedFilterBarState] = useState({});
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });
	const [searchKey, setSearchKey] = useState(0);
	const [alertInfo, setAlertInfo] = useState(alertInit);
	const [claimList, setClaimList] = useState([]);
	const [statusCounts, setStatusCounts] = useState({});
	const [totalCount, setTotalCount] = useState(0);
	const [acceptingClaimCode, setAcceptingClaimCode] = useState("");
	const [checkedClaimCodes, setCheckedClaimCodes] = useState([]);
	const [updatingStatus, setUpdatingStatus] = useState(null);
	const [claimImageMap, setClaimImageMap] = useState({});
	const [isImageLoading, setIsImageLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const shopFilterOptions = useMemo(() => {
		return companyList
			.filter((data) => data.c_kind === "shop")
			.map((data) => ({
				title: data.c_name,
				value: data.c_name,
			}));
	}, [companyList]);

	const claimFilterList = useMemo(
		() =>
			[
				{
					key: "c_name",
					title: TEXT.company,
					options: shopFilterOptions,
				},
				{
					key: "claim_type",
					title: TEXT.type,
					options: [
						{ title: TEXT.exchange, value: "1" },
						{ title: TEXT.returnClaim, value: "2" },
					],
				},
			].filter((filter) => filter.options.length > 0),
		[shopFilterOptions],
	);

	const selectedCompanyName = appliedFilterBarState.c_name || "all";
	const claimType = appliedFilterBarState.claim_type || "all";
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));

	const requestParams = useMemo(
		() => ({
			c_id: id,
			c_name: selectedCompanyName,
			claimType,
			startDate: appliedDateRange.startDate,
			endDate: appliedDateRange.endDate,
			page: 1,
			size: 100,
		}),
		[id, selectedCompanyName, claimType, appliedDateRange.startDate, appliedDateRange.endDate],
	);

	useEffect(() => {
		setSelectedNewClaim({});
		setSelectedManagedClaim({});
		setCheckedClaimCodes([]);
	}, [appliedFilterBarState, appliedDateRange]);

	const newClaimList = useMemo(
		() =>
			claimList
				.filter((record) => Number(record.claim_status) === 0)
				.map((record) => {
					return {
						...record,
						claim_createddate: dayjs(record.claim_createddate).format("YYYY-MM-DD"),
					};
				}),
		[claimList],
	);

	const managedClaimList = useMemo(
		() =>
			claimList
				.filter((record) => {
					const isManaged = Number(record.claim_status) !== 0;
					const matchStatus =
						claimStatus === "all" || String(record.claim_status) === claimStatus;

					return isManaged && matchStatus;
				})
				.map((record) => {
					return {
						...record,
						claim_createddate: dayjs(record.claim_createddate).format("YYYY-MM-DD"),
					};
				}),
		[claimList, claimStatus],
	);

	const reloadData = useCallback(
		async (showLoading = true) => {
			if (showLoading) {
				setIsLoading(true);
				setLoadingText("교환/반품 신청 목록을 불러오는 중입니다...");
			}

			try {
				if (isAppliedDateRangeInvalid) {
					setClaimList([]);
					setStatusCounts({});
					setTotalCount(0);
					setClaimImageMap({});
					setAlertInfo({
						severity: "warning",
						title: TEXT.dateRangeFail,
						text: "시작일은 종료일보다 늦을 수 없습니다.",
						open: true,
					});
					return;
				}

				const result = await OrderClaimService.getListByCompany(requestParams);
				const isSuccess = result.success;
				const nextClaimList = isSuccess ? result.claimList || [] : [];

				setClaimList(nextClaimList);
				setStatusCounts(isSuccess ? result.statusCounts || {} : {});
				setTotalCount(Number(result.totalCount || 0));
				setClaimImageMap({});

				setAlertInfo({
					severity: nextClaimList.length > 0 ? "success" : isSuccess ? "info" : "error",
					title:
						nextClaimList.length > 0
							? TEXT.success
							: isSuccess
								? TEXT.empty
								: TEXT.fail,
					text: result.message,
					open: true,
				});

				if (!isSuccess || nextClaimList.length === 0) return;

				try {
					setIsImageLoading(true);

					const imageList = await ImageService.getImageData({
						kind: "CLAIM",
						range: "ALL",
						idx: -1,
					});

					const claimKeySet = new Set(
						nextClaimList.map((record) =>
							getClaimImageKey(record.claim_code, record.id),
						),
					);

					const nextImageMap = (imageList || []).reduce((acc, image) => {
						const imageKey = getClaimImageKey(image.dir_a, image.dir_d);

						if (!claimKeySet.has(imageKey)) return acc;

						return {
							...acc,
							[imageKey]: [...(acc[imageKey] || []), image],
						};
					}, {});

					Object.keys(nextImageMap).forEach((imageKey) => {
						nextImageMap[imageKey] = sortClaimImages(nextImageMap[imageKey]);
					});

					setClaimImageMap(nextImageMap);
				} catch (error) {
					console.error(error);

					setClaimImageMap({});
					setAlertInfo({
						severity: "error",
						title: TEXT.fail,
						text: "첨부 이미지를 불러오는 중 오류가 발생했습니다.",
						open: true,
					});
				} finally {
					setIsImageLoading(false);
				}
			} catch (error) {
				console.error(error);

				setClaimList([]);
				setStatusCounts({});
				setTotalCount(0);
				setClaimImageMap({});

				setAlertInfo({
					severity: "error",
					title: TEXT.fail,
					text: "교환/반품 신청 목록을 불러오는 중 오류가 발생했습니다.",
					open: true,
				});
			} finally {
				if (showLoading) {
					setIsLoading(false);
				}
			}
		},
		[isAppliedDateRangeInvalid, requestParams],
	);

	const handleSearch = () => {
		setAppliedFilterBarState(filterBarState);
		setAppliedDateRange(dateRange);
		setSearchKey((prev) => prev + 1);
	};

	useEffect(() => {
		reloadData();
	}, [reloadData, searchKey]);

	useEffect(() => {
		const managedClaimCodeSet = new Set(managedClaimList.map((record) => record.claim_code));

		setCheckedClaimCodes((prev) =>
			prev.filter((claimCode) => managedClaimCodeSet.has(claimCode)),
		);
	}, [managedClaimList]);

	const selectedClaim = selectedNewClaim.claim_code ? selectedNewClaim : selectedManagedClaim;
	const selectedClaimImages = useMemo(() => {
		if (!selectedClaim?.claim_code || !selectedClaim?.id) return [];

		return claimImageMap[getClaimImageKey(selectedClaim.claim_code, selectedClaim.id)] || [];
	}, [claimImageMap, selectedClaim?.claim_code, selectedClaim?.id]);

	const handleStatusChange = (event, newValue) => {
		if (newValue === false || newValue === null) return;

		setClaimStatus(newValue);
	};

	const handleAcceptClaim = useCallback(
		async (row) => {
			const claimCode = row.claim_code;

			if (!claimCode) return;

			setIsLoading(true);
			setLoadingText("신규 신청을 접수 처리하는 중입니다...");

			try {
				setAcceptingClaimCode(claimCode);

				await OrderClaimService.updateClaim({
					claim_code: claimCode,
					claim_type: Number(row.claim_type),
					claim_status: 1,
				});

				setSelectedNewClaim({});
				setSelectedManagedClaim({});
				setClaimStatus("all");

				setLoadingText("교환/반품 신청 목록을 다시 불러오는 중입니다...");
				await reloadData(false);

				setAlertInfo({
					severity: "success",
					title: TEXT.acceptSuccess,
					text: "신규 신청이 접수 상태로 변경되었습니다.",
					open: true,
				});
			} catch (error) {
				setAlertInfo({
					severity: "error",
					title: TEXT.acceptFail,
					text: error.response?.data?.message || "접수 처리 중 오류가 발생했습니다.",
					open: true,
				});
			} finally {
				setAcceptingClaimCode("");
				setIsLoading(false);
			}
		},
		[reloadData],
	);

	const acceptButtonData = useMemo(
		() => [
			{
				title: TEXT.accept,
				variant: "contained",
				color: "primary",
				onClick: handleAcceptClaim,
				disabled: Boolean(acceptingClaimCode) || isLoading,
			},
		],
		[acceptingClaimCode, handleAcceptClaim, isLoading],
	);
	const handleBulkStatusChange = useCallback(
		async (nextStatus) => {
			const selectedClaims = managedClaimList.filter((record) =>
				checkedClaimCodes.includes(record.claim_code),
			);

			if (selectedClaims.length === 0) {
				setAlertInfo({
					severity: "info",
					title: TEXT.empty,
					text: "상태를 변경할 항목을 선택해주세요.",
					open: true,
				});
				return;
			}

			setIsLoading(true);
			setLoadingText("선택한 신청 건의 상태를 변경하는 중입니다...");

			try {
				setUpdatingStatus(nextStatus);

				await OrderClaimService.updateBulk(
					selectedClaims.map((record) => ({
						claim_code: record.claim_code,
						claim_type: Number(record.claim_type),
						claim_status: nextStatus,
					})),
				);

				setSelectedManagedClaim({});
				setCheckedClaimCodes([]);
				setClaimStatus(String(nextStatus));

				setLoadingText("교환/반품 신청 목록을 다시 불러오는 중입니다...");
				await reloadData(false);

				setAlertInfo({
					severity: "success",
					title: TEXT.bulkSuccess,
					text: `${selectedClaims.length}건의 상태가 변경되었습니다.`,
					open: true,
				});
			} catch (error) {
				setAlertInfo({
					severity: "error",
					title: TEXT.bulkFail,
					text: error.response?.data?.message || "상태 변경 중 오류가 발생했습니다.",
					open: true,
				});
			} finally {
				setUpdatingStatus(null);
				setIsLoading(false);
			}
		},
		[checkedClaimCodes, managedClaimList, reloadData],
	);

	const isBulkActionDisabled =
		checkedClaimCodes.length === 0 || updatingStatus !== null || isLoading;

	return (
		<div className="shopping-mall-claim-page">
			<div className="shopping-mall-claim-header">
				<div>
					<h3>{TEXT.title}</h3>
					<p>{TEXT.description}</p>
				</div>
				<div className="shopping-mall-claim-summary">
					<Chip
						label={`${TEXT.total} ${statusCounts.totalCount || totalCount}${TEXT.caseUnit}`}
						variant="outlined"
					/>
					<Chip
						label={`${TEXT.exchange} ${statusCounts.exchangeCount || 0}${TEXT.caseUnit}`}
						color="primary"
						variant="outlined"
					/>
					<Chip
						label={`${TEXT.returnClaim} ${statusCounts.returnCount || 0}${TEXT.caseUnit}`}
						color="warning"
						variant="outlined"
					/>
					<Chip
						label={`${TEXT.statusProcessing} ${statusCounts.processingCount || 0}${TEXT.caseUnit}`}
						color="info"
						variant="outlined"
					/>
				</div>
			</div>

			<section className="shopping-mall-claim-filter-card">
				<div className="shopping-mall-claim-filter-row">
					<FilterBar
						filterList={claimFilterList}
						value={filterBarState}
						onChange={setFilterBarState}
					/>

					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
						startLabel={TEXT.startDate}
						endLabel={TEXT.endDate}
						resetLabel={TEXT.dateReset}
					/>
					<Button variant="contained" onClick={handleSearch} disabled={isLoading}>
						검색
					</Button>
				</div>
			</section>

			<section className="shopping-mall-claim-card">
				<div className="shopping-mall-claim-card-head">
					<div>
						<strong>{TEXT.newListTitle}</strong>
					</div>
				</div>

				<div className="shopping-mall-claim-table">
					{isLoading ? (
						<Loading message={loadingText} />
					) : newClaimList.length > 0 ? (
						<TableMui
							rowData={newClaimList}
							col={newClaimTableColumns}
							columns={newClaimTableColumnLabels}
							buttonData={acceptButtonData}
							buttonCol={["accept"]}
							buttonColumns={[TEXT.accept]}
							pagination={true}
							resetPageKey={`new-${selectedCompanyName}-${claimType}-${appliedDateRange.startDate}-${appliedDateRange.endDate}`}
							selectedRow={selectedNewClaim}
							setSelectedRow={setSelectedNewClaim}
							onRowClick={() => setSelectedManagedClaim({})}
							renderCell={renderClaimCell}
						/>
					) : (
						<div className="shopping-mall-claim-empty">{TEXT.noNewData}</div>
					)}
				</div>
			</section>

			<section className="shopping-mall-claim-card">
				<div className="shopping-mall-claim-card-head">
					<div>
						<strong>{TEXT.managedListTitle}</strong>
					</div>
				</div>

				<div className="shopping-mall-claim-status-tabs">
					<TabsMui
						tabValue={claimStatus}
						handleTabChange={handleStatusChange}
						tabList={claimStatusTabs}
						tabKey="value"
						label="label"
						value="value"
					/>
				</div>

				<div className="shopping-mall-claim-bulk-actions">
					<span>선택 {checkedClaimCodes.length}건</span>
					<Button
						variant="outlined"
						color="info"
						disabled={isBulkActionDisabled}
						onClick={() => handleBulkStatusChange(2)}>
						{TEXT.bulkProcessing}
					</Button>
					<Button
						variant="outlined"
						color="success"
						disabled={isBulkActionDisabled}
						onClick={() => handleBulkStatusChange(3)}>
						{TEXT.bulkDone}
					</Button>
					<Button
						variant="outlined"
						color="error"
						disabled={isBulkActionDisabled}
						onClick={() => handleBulkStatusChange(-1)}>
						{TEXT.bulkReject}
					</Button>
				</div>

				<div className="shopping-mall-claim-table">
					{isLoading ? (
						<Loading message={loadingText} />
					) : managedClaimList.length > 0 ? (
						<TableCheckBoxMui
							rowData={managedClaimList}
							col={managedTableColumns}
							columns={managedTableColumnLabels}
							rowKey="claim_code"
							checkedList={checkedClaimCodes}
							setCheckedList={setCheckedClaimCodes}
							pagination={true}
							resetPageKey={`managed-${selectedCompanyName}-${claimStatus}-${claimType}-${appliedDateRange.startDate}-${appliedDateRange.endDate}`}
							selectedRow={selectedManagedClaim}
							setSelectedRow={setSelectedManagedClaim}
							onRowClick={() => setSelectedNewClaim({})}
							renderCell={renderClaimCell}
						/>
					) : (
						<div className="shopping-mall-claim-empty">{TEXT.noData}</div>
					)}
				</div>
			</section>

			<Dialog
				open={Boolean(selectedClaim?.claim_code)}
				onClose={() => {
					setSelectedNewClaim({});
					setSelectedManagedClaim({});
				}}
				maxWidth="md"
				fullWidth>
				<div className="shopping-mall-claim-detail-dialog">
					<div className="shopping-mall-claim-card-head">
						<div>
							<strong>{TEXT.detailTitle}</strong>
							<span>{selectedClaim?.claim_code || TEXT.detailEmpty}</span>
						</div>
						<Button
							variant="outlined"
							color="inherit"
							size="small"
							onClick={() => {
								setSelectedNewClaim({});
								setSelectedManagedClaim({});
							}}>
							닫기
						</Button>
					</div>

					{selectedClaim?.claim_code && (
						<div className="shopping-mall-claim-detail">
							<div className="shopping-mall-claim-detail-grid">
								<div>
									<span>{TEXT.type}</span>
									<strong>{selectedClaim.claim_type_name}</strong>
								</div>
								<div>
									<span>{TEXT.status}</span>
									<strong>{selectedClaim.claim_status_name}</strong>
								</div>
								<div>
									<span>{TEXT.productName}</span>
									<strong>{selectedClaim.f_name}</strong>
								</div>
								<div>
									<span>{TEXT.requesterName}</span>
									<strong>{selectedClaim.user_name || selectedClaim.id}</strong>
								</div>
								<div>
									<span>{TEXT.company}</span>
									<strong>{selectedClaim.c_name}</strong>
								</div>
								<div>
									<span>{TEXT.requesterId}</span>
									<strong>{selectedClaim.id}</strong>
								</div>
								<div>
									<span>{TEXT.tel}</span>
									<strong>{selectedClaim.user_tel || "-"}</strong>
								</div>
								<div>
									<span>이메일</span>
									<strong>{selectedClaim.user_email || "-"}</strong>
								</div>
								<div>
									<span>{TEXT.count}</span>
									<strong>{selectedClaim.f_count || "-"}</strong>
								</div>
								<div>
									<span>{TEXT.payTotal}</span>
									<strong>{formatWon(selectedClaim.pay_total)}</strong>
								</div>
							</div>

							<div className="shopping-mall-claim-reason">
								<span>{TEXT.reason}</span>
								<p>{selectedClaim.claim_reason || "-"}</p>
							</div>

							<div className="shopping-mall-claim-images">
								{isImageLoading ? (
									<div className="shopping-mall-claim-empty">
										{TEXT.imageLoading}
									</div>
								) : selectedClaimImages.length > 0 ? (
									selectedClaimImages.map((image) => (
										<button
											type="button"
											key={image.img_name}
											onClick={() => setPreviewImage(image)}
											className="shopping-mall-claim-image-button">
											<img
												src={`/api/images/CLAIM/${image.img_name}`}
												alt={image.img_tag || "claim"}
											/>
										</button>
									))
								) : (
									<div className="shopping-mall-claim-empty">
										{TEXT.imageEmpty}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</Dialog>

			<Dialog
				className="shopping-mall-claim-preview-dialog"
				open={Boolean(previewImage)}
				onClose={() => setPreviewImage(null)}
				maxWidth="md"
				fullWidth>
				{previewImage && (
					<div className="shopping-mall-claim-preview-shell">
						<div className="shopping-mall-claim-preview-head">
							<div>
								<strong>첨부 이미지 미리보기</strong>
								<span>{previewImage.img_tag || previewImage.img_name}</span>
							</div>
							<Button
								variant="outlined"
								color="inherit"
								size="small"
								onClick={() => setPreviewImage(null)}>
								닫기
							</Button>
						</div>
						<div className="shopping-mall-claim-preview-frame">
							<img
								className="shopping-mall-claim-preview-image"
								src={`/api/images/CLAIM/${previewImage.img_name}`}
								alt={previewImage.img_tag || "claim preview"}
							/>
						</div>
					</div>
				)}
			</Dialog>

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

export default ShoppingMallClaim;
