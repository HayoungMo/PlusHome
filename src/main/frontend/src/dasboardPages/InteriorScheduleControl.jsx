import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import CalendarMui from "../components/CalendarMui";
import ToggleButtonMui from "../components/ToggleButtonMui";
import dayjs from "dayjs";
import DatePickerMui from "./../components/DatePickerMui";

const InteriorScheduleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;
	const today = dayjs().format("YYYY-MM-DD");

	const [interiorScheduleList, setInteriorScheduleList] = useState([]);
	const [selectedSchedule, setSelectedSchedule] = useState(null);
	const [viewDataType, setViewDataType] = useState("working");
	const [changeDate, setChangeDate] = useState(today);

	useEffect(() => {
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

		reLoadData();
	}, [id]);

	const displayScheduleList = useMemo(() => {
		if (viewDataType === "all") {
			return interiorScheduleList;
		}

		if (viewDataType === "working") {
			return interiorScheduleList;
		}

		if (viewDataType === "done") {
			return interiorScheduleList;
		}

		if (viewDataType === "prepared") {
			return interiorScheduleList;
		}
	}, [interiorScheduleList, viewDataType]);

	const selectedScheduleEntries = Object.entries(selectedSchedule ?? {}).filter(
		([key]) => key !== "rowIndex",
	);

	const handleViewType = (event, newAlignment) => {
		setViewDataType(newAlignment);
	};

	const toggleButtonList = [
		{ title: "전체보기", value: "all" },
		{ title: "진행중", value: "working" },
		{ title: "완료됨", value: "done" },
		{ title: "시작 예정", value: "prepared" },
		{ title: "만료 예정", value: "soon" },
	];

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
			</div>
			<div
				style={{
					display: "flex",
					margin: "20px 0px",
					alignItems: "center",
					width: "460px",
					justifyContent: "space-between",
				}}>
				<DatePickerMui value={changeDate} />
				<Button variant="contained" color="primary">
					수정하기
				</Button>
				<Button variant="contained" color="success">
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
		</div>
	);
};

export default InteriorScheduleControl;
