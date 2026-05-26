import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import CalendarMui from "../components/CalendarMui";
import ToggleButtonMui from "../components/ToggleButtonMui";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import DatePickerMui from "./../components/DatePickerMui";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

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

	const [interiorScheduleList, setInteriorScheduleList] = useState([]);
	const [selectedSchedule, setSelectedSchedule] = useState(null);
	const [viewDataType, setViewDataType] = useState("working");
	const [changeDate, setChangeDate] = useState(dateInit);

	const [confirmDialogInfo, setConfirmDialogInfo] = useState(dialogInit);
	const [alertInfo, setAlertInfo] = useState(alertInit);

	const reLoadData = async () => {
		const result = await InteriorService.getInteriorSchedule({ c_id: id });
		if (result.success) {
			const scheduleList = result.scheduleList ?? [];
			setInteriorScheduleList(scheduleList);
			setSelectedSchedule((prev) => {
				if (!prev) return null;
				return scheduleList[prev.rowIndex] ? prev : null;
			});
		}
	};

	const hadleConfirmClose = () => {
		setConfirmDialogInfo({ ...confirmDialogInfo, open: false });
	};

	const toggleButtonList = [
		{ title: "전체보기", value: "all" },
		{ title: "진행중", value: "working" },
		{ title: "완료됨", value: "done" },
		{ title: "시작 예정", value: "prepared" },
		{ title: "만료 예정", value: "soon" },
		{ title: "만료됨", value: "expired" },
		{ title: "취소됨", value: "canceled" },
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
		if (viewDataType === "all") {
			return interiorScheduleList;
		}

		let filterdList = [];

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
		return filterdList;
	}, [interiorScheduleList, viewDataType, today]);

	const selectedScheduleEntries = Object.entries(selectedSchedule ?? {}).filter(
		([key]) => key !== "rowIndex",
	);

	const handleViewType = (event, newAlignment) => {
		setViewDataType(newAlignment);
	};

	const onClickScheduleUpdateButton = (e) => {
		const { name } = e.target;

		if (name === "update_enddate")
			setConfirmDialogInfo({
				open: true,
				title: "완공일 수정",
				text: "시공 완료일을 선택한 날짜로 변경합니다. 진행하시겠습니까?",
				buttonList: endDateUpdateDialogButtonList,
			});
		else if (name === "update_b_state")
			setConfirmDialogInfo({
				open: true,
				title: "완료 처리",
				text: "선택한 시공이 시공 완료처리 됩니다. 진행하시겠습니까?",
				buttonList: stateUpdateDialogButtonList,
			});
	};

	const handleUpdateEndDate = async () => {
		const dto = {
			...selectedSchedule,
			is_startdate: dayjs(changeDate.is_startdate).format("YYYY-MM-DD"),
			is_enddate: dayjs(changeDate.is_enddate).format("YYYY-MM-DD"),
		};
		const updateResult = await InteriorService.updateScheduleEndDate(dto);

		setAlertInfo({
			severity: updateResult.success ? "success" : "error",
			title: updateResult.success ? "등록 성공" : "등록 실패",
			text: updateResult.message,
			open: true,
		});

		reLoadData();
		hadleConfirmClose();
	};

	const handleUpdateStateDone = async () => {
		const dto = {
			...selectedSchedule,
			b_status: "done",
		};
		const updateResult = await InteriorService.workingToDoneOrCancel(dto);

		setAlertInfo({
			severity: updateResult.success ? "success" : "error",
			title: updateResult.success ? "등록 성공" : "등록 실패",
			text: updateResult.message,
			open: true,
		});
		reLoadData();
		hadleConfirmClose();
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					margin: "0px 0px 20px",
				}}>
				<ToggleButtonMui
					value={viewDataType}
					exclusive={true}
					onChange={handleViewType}
					ButtonList={toggleButtonList}
				/>
			</div>
			<div>
				{displayScheduleList.length !== 0 ? (
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
					/>
				) : (
					<div>NO DATA</div>
				)}
			</div>
			<div
				style={{
					display: "flex",
					margin: "20px 0px",
					alignItems: "center",
					width: "700px",
					justifyContent: "space-between",
				}}>
				<DatePickerMui
					value={changeDate.is_startdate}
					onChange={(e) => completeDateChange(e, "is_startdate")}
					label="시작 날짜 수정"
				/>
				<DatePickerMui
					value={changeDate.is_enddate}
					onChange={(e) => completeDateChange(e, "is_enddate")}
					label="완료 날짜 수정"
				/>
				<Button
					variant="contained"
					color="primary"
					name="update_enddate"
					onClick={onClickScheduleUpdateButton}>
					수정하기
				</Button>
				<Button
					variant="contained"
					color="success"
					name="update_b_state"
					onClick={onClickScheduleUpdateButton}>
					완료처리
				</Button>
			</div>
			<div>
				<CalendarMui
					scheduleList={displayScheduleList}
					selectedSchedule={selectedSchedule}
					onSelectSchedule={setSelectedSchedule}
				/>
			</div>
			<Paper
				elevation={2}
				sx={{
					mt: 2,
					p: 2,
					borderRadius: 1,
					backgroundColor: "#fff",
				}}>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
					Selected Schedule
				</Typography>
				{selectedSchedule ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
							gap: 1.5,
						}}>
						{selectedScheduleEntries.map(([key, value]) => (
							<Box
								key={key}
								sx={{
									border: "1px solid #e0e0e0",
									borderRadius: 1,
									p: 1.5,
									minWidth: 0,
								}}>
								<Typography
									variant="caption"
									sx={{ color: "#607d8b", fontWeight: 700 }}>
									{key}
								</Typography>
								<Typography variant="body2" sx={{ wordBreak: "break-word" }}>
									{String(value ?? "")}
								</Typography>
							</Box>
						))}
					</Box>
				) : (
					<Typography variant="body2" sx={{ color: "#607d8b" }}>
						Select a row or calendar event.
					</Typography>
				)}
			</Paper>
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
