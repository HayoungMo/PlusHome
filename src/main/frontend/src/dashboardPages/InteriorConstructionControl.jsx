import React, { useEffect, useMemo, useState } from "react";
import TableMui from "../components/TableMui";
import { Button, Chip, Dialog, DialogContent, DialogTitle } from "@mui/material";
import AlertMui from "../components/AlertMui";
import DateRangeFilter from "../components/DateRangeFilter";
import SelectMui from "../components/SelectMui";
import InteriorService from "../service/interiorService";
import dayjs from "dayjs";
import Loading from "../components/Loading";
import "../css/DashboardInterior.css";

const InteriorConstructionControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;

	const dialogInfoInit = {
		title: "",
		text: "",
		row: null,
		type: "",
	};
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("시공 진행 목록을 불러오는 중입니다...");
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(false);
	const [allList, setAllList] = useState([]);
	const [workingList, setWorkingList] = useState([]);
	const [doneList, setDoneList] = useState([]);
	const [cancelList, setCancelList] = useState([]);
	const [workStateChangeDialogOpen, setWorkStateChangeDialogOpen] = useState(false);
	const [workStateChangeDialogInfo, setWorkStateChangeDialogInfo] = useState(dialogInfoInit);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));

	const filteredAllList = useMemo(() => {
		if (!allList || allList.length === 0) return [];

		return allList.filter((dto) => {
			const targetDate = dayjs(dto.b_date || dto.b_createdDate);
			const matchStart =
				!appliedDateRange.startDate ||
				(targetDate.isValid() &&
					!targetDate.isBefore(dayjs(appliedDateRange.startDate), "day"));
			const matchEnd =
				!appliedDateRange.endDate ||
				(targetDate.isValid() &&
					!targetDate.isAfter(dayjs(appliedDateRange.endDate), "day"));

			return !isAppliedDateRangeInvalid && matchStart && matchEnd;
		});
	}, [allList, appliedDateRange, isAppliedDateRangeInvalid]);

	const displayWorkingList = useMemo(
		() => filteredAllList.filter((dto) => dto.b_status === "working"),
		[filteredAllList],
	);
	const displayDoneList = useMemo(
		() => filteredAllList.filter((dto) => dto.b_status === "done"),
		[filteredAllList],
	);
	const displayCancelList = useMemo(
		() => filteredAllList.filter((dto) => dto.b_status === "cancel"),
		[filteredAllList],
	);

	const reloadData = async (showLoading = true) => {
		if (showLoading) {
			setIsLoading(true);
			setLoadingText("시공 진행 목록을 불러오는 중입니다...");
		}

		try {
			const result = await InteriorService.selectWorkingAndDone(id);

			if (result.success === false) {
				setAlertInfo({
					severity: "error",
					title: "조회 실패",
					text: result.message,
				});
				setAlertOpen(true);

				setAllList([]);
				setWorkingList([]);
				setDoneList([]);
				setCancelList([]);
				return;
			}

			if (result.dtoList == null) {
				setAlertInfo({
					severity: "info",
					title: "조회 결과 없음",
					text: result.message,
				});
				setAlertOpen(true);

				setAllList([]);
				setWorkingList([]);
				setDoneList([]);
				setCancelList([]);
				return;
			}

			setAllList(result.dtoList);
			setWorkingList(result.dtoList.filter((dto) => dto.b_status === "working"));
			setDoneList(result.dtoList.filter((dto) => dto.b_status === "done"));
			setCancelList(result.dtoList.filter((dto) => dto.b_status === "cancel"));
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "시공 진행 목록을 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);

			setAllList([]);
			setWorkingList([]);
			setDoneList([]);
			setCancelList([]);
		} finally {
			setWorkStateChangeDialogInfo(dialogInfoInit);

			if (showLoading) {
				setIsLoading(false);
			}
		}
	};

	const handleWorkStateChange = async () => {
		setWorkStateChangeDialogOpen(false);

		if (!workStateChangeDialogInfo.row) {
			setWorkStateChangeDialogInfo(dialogInfoInit);
			return;
		}

		setIsLoading(true);
		setLoadingText("시공 상태를 변경하는 중입니다...");

		try {
			const result = await InteriorService.workingToDoneOrCancel({
				...workStateChangeDialogInfo.row,
				b_status: workStateChangeDialogInfo.type,
			});

			setAlertInfo({
				severity: result.success ? "success" : "error",
				title: result.success ? "처리 성공" : "처리 실패",
				text: result.message,
			});
			setAlertOpen(true);

			setLoadingText("시공 진행 목록을 다시 불러오는 중입니다...");
			await reloadData(false);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "시공 상태 변경 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);
		} finally {
			setWorkStateChangeDialogInfo(dialogInfoInit);
			setIsLoading(false);
		}
	};

	const handleColButtonOnClick = (row, type) => {
		setWorkStateChangeDialogOpen(!workStateChangeDialogOpen);
		if (type === "cancel") {
			setWorkStateChangeDialogInfo({
				title: "시공 취소",
				text: "선택한 시공 건을 취소 상태로 변경합니다. 진행하시겠습니까?",
				row: row,
				type: "cancel",
			});
		} else if (type === "done") {
			setWorkStateChangeDialogInfo({
				title: "시공 완료",
				text: "선택한 시공 건을 완료 상태로 변경합니다. 진행하시겠습니까?",
				row: row,
				type: "done",
			});
		} else if (type === "working") {
			setWorkStateChangeDialogInfo({
				title: "시공 상태 변경",
				text: "선택한 시공 건을 지정한 상태로 변경합니다. 진행하시겠습니까?",
				row: row,
				type: "working",
			});
		}
	};

	const handleViewInvoicePDF = async (row) => {
		if (!row) return;

		setIsLoading(true);
		setLoadingText("견적서 데이터를 불러오는 중입니다...");

		try {
			const sendData = {
				booking: row,
				company: {
					c_id: row.c_id,
					c_name: row.c_name,
				},
			};

			const result = await InteriorService.getPDFData(sendData);

			if (result.success) {
				const pdfData = {
					invoice: result.invoice,
					invoiceDetail: result.invoiceDetail,
					company: result.company,
					orderBy: "insert",
				};

				sessionStorage.setItem("exportPDFData", JSON.stringify(pdfData));
				window.open("/ExportPDFViewPage", "_blank", "width=1200,height=900");
			} else {
				setAlertInfo({
					severity: "error",
					title: "조회 실패",
					text: result.message,
				});
				setAlertOpen(true);
			}
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "견적서 데이터를 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	const buttonData = [
		{
			title: "시공 취소",
			color: "error",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "cancel"),
		},
		{
			title: "시공 완료",
			color: "primary",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "done"),
		},
		{
			title: "견적서 조회",
			color: "success",
			variant: "contained",
			onClick: (row) => handleViewInvoicePDF(row),
		},
	];

	const buttonDataCancelOrDone = [
		{
			title: "상태 변경",
			color: "secondary",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "working"),
		},
		{
			title: "견적서 조회",
			color: "success",
			variant: "contained",
			onClick: (row) => handleViewInvoicePDF(row),
		},
	];

	const stateChangeSelectOption = [
		{ value: "pending", title: "pending" },
		{ value: "quoting", title: "quoting" },
		{ value: "confirmed", title: "confirmed" },
		{ value: "working", title: "working" },
		{ value: "done", title: "done" },
	];

	const tableCol = ["id", "b_date", "c_name", "b_long", "b_status"];
	const tableColumns = ["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"];
	const handleSearch = () => {
		setAppliedDateRange(dateRange);
	};

	useEffect(() => {
		reloadData();
	}, []);

	return (
		<div className="interior-construction-page">
			<div className="interior-construction-header">
				<div>
					<h3>시공 진행 관리</h3>
					<p>
						진행 중, 완료, 취소된 시공 건을 확인하고 상태 변경과 견적서 조회를
						처리합니다.
					</p>
				</div>
				<div className="interior-construction-summary">
					<Chip label={`전체 ${allList.length}건`} variant="outlined" />
					<Chip
						label={`진행중 ${workingList.length}건`}
						color="primary"
						variant="outlined"
					/>
					<Chip label={`완료 ${doneList.length}건`} color="success" variant="outlined" />
					<Chip label={`취소 ${cancelList.length}건`} color="error" variant="outlined" />
				</div>
			</div>

			<section className="interior-construction-card">
				<div className="interior-filter-row">
					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
					/>
					<Button variant="contained" onClick={handleSearch}>
						검색
					</Button>
				</div>
			</section>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>진행 중인 시공 목록</strong>
						<span>현재 시공 중인 건의 완료/취소 처리와 견적서 조회를 진행합니다.</span>
					</div>
					<Chip
						label={`${displayWorkingList.length}건`}
						color="primary"
						variant="outlined"
					/>
				</div>

				{isLoading ? (
					<div className="interior-construction-table">
						<Loading message={loadingText} />
					</div>
				) : displayWorkingList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={displayWorkingList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonData}
							buttonCol={["button1", "button2", "button3"]}
							buttonColumns={["취소", "완료", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">진행 중인 시공 건이 없습니다.</div>
				)}
			</section>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>시공 완료 목록</strong>
						<span>완료 처리된 시공 건을 확인하고 필요 시 상태를 변경합니다.</span>
					</div>
					<Chip
						label={`${displayDoneList.length}건`}
						color="success"
						variant="outlined"
					/>
				</div>

				{isLoading ? (
					<div className="interior-construction-table">
						<Loading message={loadingText} />
					</div>
				) : displayDoneList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={displayDoneList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonDataCancelOrDone}
							buttonCol={["button2", "button3"]}
							buttonColumns={["상태 변경", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">완료된 시공 건이 없습니다.</div>
				)}
			</section>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>취소된 시공 목록</strong>
						<span>취소 처리된 시공 건을 확인하고 필요 시 상태를 되돌립니다.</span>
					</div>
					<Chip
						label={`${displayCancelList.length}건`}
						color="error"
						variant="outlined"
					/>
				</div>

				{isLoading ? (
					<div className="interior-construction-table">
						<Loading message={loadingText} />
					</div>
				) : displayCancelList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={displayCancelList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonDataCancelOrDone}
							buttonCol={["button2", "button3"]}
							buttonColumns={["상태 변경", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">취소된 시공 건이 없습니다.</div>
				)}
			</section>

			{workStateChangeDialogOpen && (
				<Dialog
					open={workStateChangeDialogOpen}
					onClose={() => setWorkStateChangeDialogOpen(false)}
					maxWidth="sm"
					fullWidth>
					<DialogTitle>{workStateChangeDialogInfo.title}</DialogTitle>

					<DialogContent>
						<div className="interior-construction-dialog">
							<p>{workStateChangeDialogInfo.text}</p>

							{(workStateChangeDialogInfo.row?.b_status === "cancel" ||
								workStateChangeDialogInfo.row?.b_status === "done") && (
								<SelectMui
									label="진행 상태"
									value={workStateChangeDialogInfo.type}
									onChange={(e) => {
										setWorkStateChangeDialogInfo({
											...workStateChangeDialogInfo,
											type: e.target.value,
										});
									}}
									option={stateChangeSelectOption}
									width="180px"
								/>
							)}
							<div className="interior-construction-dialog-actions">
								<Button
									variant="outlined"
									color="error"
									onClick={() => setWorkStateChangeDialogOpen(false)}>
									취소
								</Button>
								<Button
									variant="contained"
									color="primary"
									onClick={() => handleWorkStateChange()}>
									저장
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
			{alertOpen && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertOpen(!alertOpen)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default InteriorConstructionControl;
