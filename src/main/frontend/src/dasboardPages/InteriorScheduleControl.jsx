import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip } from "@mui/material";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import CalendarMui from "../components/CalendarMui";
import DateRangeFilter from "../components/DateRangeFilter";
import ToggleButtonMui from "../components/ToggleButtonMui";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Loading from "../components/Loading";
import DatePickerMui from "./../components/DatePickerMui";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";
import "../css/DashboardInterior.css";
import {
	formatInteriorAnswerLabel,
	formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";

dayjs.extend(isBetween);

const InteriorScheduleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;
	const today = dayjs();

	const alertInit = { severity: null, text: "", open: false };
	const dialogInit = { open: false };
	const dateInit = {
		is_startdate: today.format('"YYYY-MM-DD"'),
		is_enddate: today.format('"YYYY-MM-DD"'),
	};
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("시공 일정 목록을 불러오는 중입니다...");
	const [interiorScheduleList, setInteriorScheduleList] = useState([]);
	const [selectedSchedule, setSelectedSchedule] = useState(null);
	const [viewDataType, setViewDataType] = useState("working");
	const [changeDate, setChangeDate] = useState(dateInit);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

	const [confirmDialogInfo, setConfirmDialogInfo] = useState(dialogInit);
	const [alertInfo, setAlertInfo] = useState(alertInit);
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));

	const reLoadData = async (showLoading = true) => {
		if (showLoading) {
			setIsLoading(true);
			setLoadingText("시공 일정 목록을 불러오는 중입니다...");
		}

		try {
			const result = await InteriorService.getInteriorSchedule({ c_id: id });

			if (result.success) {
				const scheduleList = result.scheduleList ?? [];

				setInteriorScheduleList(scheduleList);
				setSelectedSchedule((prev) => {
					if (!prev) return null;
					return scheduleList[prev.rowIndex] ? prev : null;
				});
			} else {
				setInteriorScheduleList([]);
				setSelectedSchedule(null);

				setAlertInfo({
					severity: "error",
					title: "조회 실패",
					text: result.message || "시공 일정 목록을 불러오지 못했습니다.",
					open: true,
				});
			}
		} catch (error) {
			console.error(error);

			setInteriorScheduleList([]);
			setSelectedSchedule(null);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "시공 일정 목록을 불러오는 중 오류가 발생했습니다.",
				open: true,
			});
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
		}
	};

	const hadleConfirmClose = () => {
		setConfirmDialogInfo({ ...confirmDialogInfo, open: false });
	};

	const toggleButtonList = [
		{ title: "전체보기", value: "all" },
		{ title: "진행중", value: "working" },
		{ title: "완료", value: "done" },
		{ title: "시작 예정", value: "prepared" },
		{ title: "만료 예정", value: "soon" },
		{ title: "만료", value: "expired" },
		{ title: "취소", value: "canceled" },
	];

	const endDateUpdateDialogButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "outlined",
			onClick: () => hadleConfirmClose(),
		},
		{
			title: "Save",
			color: "primary",
			variant: "outlined",
			onClick: () => handleUpdateEndDate(),
		},
	];

	const stateUpdateDialogButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "outlined",
			onClick: () => hadleConfirmClose(),
		},
		{
			title: "Save",
			color: "primary",
			variant: "outlined",
			onClick: () => handleUpdateStateDone(),
		},
	];

	useEffect(() => {
		reLoadData();
	}, [id]);

	useEffect(() => {
		if (!selectedSchedule || !selectedSchedule.is_enddate) return;
		setChangeDate({
			is_startdate: selectedSchedule.is_startdate,
			is_enddate: selectedSchedule.is_enddate,
		});
	}, [selectedSchedule]);

	const completeDateChange = (e, type) => {
		setChangeDate({
			...changeDate,
			[type]: e,
		});
	};

	const displayScheduleList = useMemo(() => {
		let filterdList = interiorScheduleList;

		if (viewDataType === "working") {
			const todayStart = today.startOf("day");

			filterdList = interiorScheduleList.filter((data) => {
				const startDate = dayjs(data.is_startdate).startOf("day");
				const endDate = dayjs(data.is_enddate).startOf("day");

				return (
					data.b_status === "working" &&
					!todayStart.isBefore(startDate) &&
					!endDate.isBefore(todayStart)
				);
			});
		}

		if (viewDataType === "done") {
			filterdList = interiorScheduleList.filter((data) => data.b_status === "done");
		}

		if (viewDataType === "prepared") {
			filterdList = interiorScheduleList.filter(
				(data) => data.b_status === "working" && today.isBefore(dayjs(data.is_startdate)),
			);
		}

		if (viewDataType === "soon") {
			const todayStart = today.startOf("day");
			const sevenDaysLaterEnd = today.add(7, "day").endOf("day");

			filterdList = interiorScheduleList.filter((data) => {
				const endDate = dayjs(data.is_enddate);

				return (
					data.b_status === "working" &&
					endDate.isBetween(todayStart, sevenDaysLaterEnd, null, "[]")
				);
			});
		}

		if (viewDataType === "expired") {
			const todayStart = today.startOf("day");

			filterdList = interiorScheduleList.filter((data) => {
				const endDate = dayjs(data.is_enddate);

				return data.b_status === "working" && endDate.isBefore(todayStart);
			});
		}

		if (viewDataType === "canceled") {
			filterdList = interiorScheduleList.filter((data) => data.b_status === "cancel");
		}
		return filterdList.filter((data) => {
			const scheduleDate = dayjs(data.is_startdate || data.b_createdDate);
			const matchStart =
				!dateRange.startDate ||
				(scheduleDate.isValid() &&
					!scheduleDate.isBefore(dayjs(dateRange.startDate), "day"));
			const matchEnd =
				!dateRange.endDate ||
				(scheduleDate.isValid() && !scheduleDate.isAfter(dayjs(dateRange.endDate), "day"));

			return !isDateRangeInvalid && matchStart && matchEnd;
		});
	}, [interiorScheduleList, viewDataType, today, dateRange, isDateRangeInvalid]);

	const scheduleLabelMap = {
		id: "예약자 ID",
		b_createdDate: "신청일",
		c_id: "업체 ID",
		c_kind: "업체 구분",
		c_name: "업체명",
		b_kind: "상담 종류",
		b_long: "희망 기간",
		b_date: "예약일",
		b_status: "진행 상태",
		b_content: "상담 내용",
		is_index: "일정 번호",
		is_startdate: "시작일",
		is_enddate: "종료일",
	};

	const formatScheduleEntry = ([key, value]) => {
		if (key === "b_answer") {
			try {
				const answer = value ? JSON.parse(value) : {};
				return Object.entries(answer).map(([answerKey, answerValue]) => [
					formatInteriorAnswerLabel(answerKey),
					formatInteriorAnswerValue(answerValue),
				]);
			} catch (e) {
				return [["상담 답변", value]];
			}
		}

		return [[scheduleLabelMap[key] || key, value]];
	};

	const selectedScheduleEntries = Object.entries(selectedSchedule ?? {})
		.filter(([key]) => key !== "rowIndex")
		.flatMap(formatScheduleEntry);

	const workingCount = interiorScheduleList.filter((data) => data.b_status === "working").length;
	const doneCount = interiorScheduleList.filter((data) => data.b_status === "done").length;

	const handleViewType = (event, newAlignment) => {
		if (newAlignment === null) return;
		setViewDataType(newAlignment);
	};

	const onClickScheduleUpdateButton = (e) => {
		const { name } = e.target;

		if (name === "update_enddate")
			setConfirmDialogInfo({
				open: true,
				title: "시공 일정 수정",
				text: "시공 시작일과 종료일을 선택한 날짜로 변경합니다. 진행하시겠습니까?",
				buttonList: endDateUpdateDialogButtonList,
			});
		else if (name === "update_b_state")
			setConfirmDialogInfo({
				open: true,
				title: "완료 처리",
				text: "선택한 시공 일정을 완료 처리합니다. 진행하시겠습니까?",
				buttonList: stateUpdateDialogButtonList,
			});
	};

	const handleUpdateEndDate = async () => {
		const dto = {
			...selectedSchedule,
			is_startdate: dayjs(changeDate.is_startdate).format("YYYY-MM-DD"),
			is_enddate: dayjs(changeDate.is_enddate).format("YYYY-MM-DD"),
		};

		setIsLoading(true);
		setLoadingText("시공 일정을 수정하는 중입니다...");

		try {
			const updateResult = await InteriorService.updateScheduleEndDate(dto);

			setAlertInfo({
				severity: updateResult.success ? "success" : "error",
				title: updateResult.success ? "수정 성공" : "수정 실패",
				text: updateResult.message,
				open: true,
			});

			setLoadingText("시공 일정 목록을 다시 불러오는 중입니다...");
			await reLoadData(false);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "시공 일정 수정 중 오류가 발생했습니다.",
				open: true,
			});
		} finally {
			hadleConfirmClose();
			setIsLoading(false);
		}
	};

	const handleUpdateStateDone = async () => {
		const dto = {
			...selectedSchedule,
			b_status: "done",
		};

		setIsLoading(true);
		setLoadingText("시공 일정을 완료 처리하는 중입니다...");

		try {
			const updateResult = await InteriorService.workingToDoneOrCancel(dto);

			setAlertInfo({
				severity: updateResult.success ? "success" : "error",
				title: updateResult.success ? "처리 성공" : "처리 실패",
				text: updateResult.message,
				open: true,
			});

			setLoadingText("시공 일정 목록을 다시 불러오는 중입니다...");
			await reLoadData(false);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "완료 처리 중 오류가 발생했습니다.",
				open: true,
			});
		} finally {
			hadleConfirmClose();
			setIsLoading(false);
		}
	};

	return (
		<div className="interior-schedule-page">
			<div className="interior-schedule-header">
				<div>
					<h3>시공 일정 관리</h3>
					<p>
						진행 중인 시공 일정과 마감 예정 건을 확인하고 날짜와 완료 상태를 관리합니다.
					</p>
				</div>
				<div className="interior-schedule-summary">
					<Chip label={`전체 ${interiorScheduleList.length}건`} variant="outlined" />
					<Chip label={`진행중 ${workingCount}건`} color="primary" variant="outlined" />
					<Chip label={`완료 ${doneCount}건`} color="success" variant="outlined" />
				</div>
			</div>

			<section className="interior-schedule-card">
				<div className="interior-schedule-card-head">
					<div>
						<strong>일정 필터</strong>
						<span>상태별로 시공 일정을 빠르게 분류해서 확인합니다.</span>
					</div>
					<Chip label={`표시 ${displayScheduleList.length}건`} variant="outlined" />
				</div>
				<div className="interior-schedule-filter">
					<ToggleButtonMui
						value={viewDataType}
						exclusive={true}
						onChange={handleViewType}
						ButtonList={toggleButtonList}
					/>
					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
					/>
				</div>
			</section>

			<section className="interior-schedule-grid">
				<div className="interior-schedule-card">
					<div className="interior-schedule-card-head">
						<div>
							<strong>시공 일정 목록</strong>
							<span>행을 선택하면 상세 정보와 일정 변경 영역이 활성화됩니다.</span>
						</div>
					</div>

					{isLoading ? (
						<div className="interior-schedule-table">
							<Loading message={loadingText} />
						</div>
					) : displayScheduleList.length !== 0 ? (
						<div className="interior-schedule-table">
							<TableMui
								rowData={displayScheduleList}
								selectedRow={selectedSchedule}
								setSelectedRow={setSelectedSchedule}
								defaultRowPerPage={5}
								pagination
								col={[
									"id",
									"b_createdDate",
									"c_name",
									"b_long",
									"b_status",
									"b_content",
									"is_startdate",
									"is_enddate",
								]}
								columns={[
									"ID",
									"예약일",
									"업체명",
									"기간",
									"상태",
									"내용",
									"시작일",
									"종료일",
								]}
							/>
						</div>
					) : (
						<div className="interior-schedule-guide">
							선택한 조건에 해당하는 일정이 없습니다.
						</div>
					)}
				</div>

				<div className="interior-schedule-card interior-schedule-detail-card">
					<div className="interior-schedule-card-head">
						<div>
							<strong>선택 일정 상세</strong>
							<span>선택한 일정의 주요 정보를 확인합니다.</span>
						</div>
					</div>

					{selectedSchedule ? (
						<div className="interior-schedule-detail-grid">
							{selectedScheduleEntries.map(([key, value]) => (
								<div className="interior-schedule-detail-item" key={key}>
									<span>{key}</span>
									<strong>{String(value ?? "")}</strong>
								</div>
							))}
						</div>
					) : (
						<div className="interior-schedule-guide">
							목록이나 캘린더에서 일정을 선택하세요.
						</div>
					)}
				</div>
			</section>

			<section className="interior-schedule-card">
				<div className="interior-schedule-card-head">
					<div>
						<strong>일정 변경</strong>
						<span>선택한 시공의 시작일과 종료일을 조정하거나 완료 처리합니다.</span>
					</div>
				</div>
				<div className="interior-schedule-actions">
					<DatePickerMui
						value={changeDate.is_startdate}
						onChange={(e) => completeDateChange(e, "is_startdate")}
						label="시작 날짜 수정"
					/>
					<DatePickerMui
						value={changeDate.is_enddate}
						onChange={(e) => completeDateChange(e, "is_enddate")}
						label="종료 날짜 수정"
					/>
					<Button
						variant="contained"
						color="primary"
						name="update_enddate"
						disabled={!selectedSchedule || isLoading}
						onClick={onClickScheduleUpdateButton}>
						수정하기
					</Button>

					<Button
						variant="contained"
						color="success"
						name="update_b_state"
						disabled={!selectedSchedule || isLoading}
						onClick={onClickScheduleUpdateButton}>
						완료처리
					</Button>
				</div>
			</section>

			<section className="interior-schedule-card">
				<div className="interior-schedule-card-head">
					<div>
						<strong>캘린더</strong>
						<span>일정 기간을 달력에서 한눈에 확인합니다.</span>
					</div>
				</div>
				<div className="interior-schedule-calendar">
					{isLoading ? (
						<Loading text={loadingText} />
					) : (
						<CalendarMui
							scheduleList={displayScheduleList}
							selectedSchedule={selectedSchedule}
							onSelectSchedule={setSelectedSchedule}
						/>
					)}
				</div>
			</section>

			{confirmDialogInfo.open && (
				<DialogMui
					open={confirmDialogInfo.open}
					onClose={() => setConfirmDialogInfo({ ...confirmDialogInfo, open: false })}
					title={confirmDialogInfo.title}
					text={confirmDialogInfo.text}
					buttons={confirmDialogInfo.buttonList}
				/>
			)}
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

export default InteriorScheduleControl;
