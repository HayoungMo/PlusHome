import React, { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import CalendarMui from "../components/CalendarMui";

const InteriorScheduleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;

	const [interiorScheduleList, setInteriorScheduleList] = useState([]);
	const [selectedSchedule, setSelectedSchedule] = useState(null);

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

	const selectedScheduleEntries = Object.entries(selectedSchedule ?? {}).filter(
		([key]) => key !== "rowIndex",
	);

	return (
		<div>
			<TableMui
				rowData={interiorScheduleList}
				selectedRow={selectedSchedule}
				setSelectedRow={setSelectedSchedule}
				defaultRowPerPage={5}
				pagination
				col={[
					"id",
					"b_createdDate",
					"c_name",
					"b_kind",
					"b_long",
					"b_date",
					"b_status",
					"b_content",
					"is_startdate",
					"is_enddate",
				]}
			/>
			<CalendarMui
				scheduleList={interiorScheduleList}
				selectedSchedule={selectedSchedule}
				onSelectSchedule={setSelectedSchedule}
			/>
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
