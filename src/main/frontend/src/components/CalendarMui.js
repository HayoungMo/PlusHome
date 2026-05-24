import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

const neonColors = [
	"#ff1744",
	"#ff3d00",
	"#ffea00",
	"#76ff03",
	"#00e676",
	"#00e5ff",
	"#2979ff",
	"#651fff",
	"#d500f9",
	"#ff4081",
];

const selectedGradientColors = [
	"#ff1744",
	"#ff2d2d",
	"#ff3d00",
	"#ff6d00",
	"#ff9100",
	"#ffab00",
	"#ffd600",
	"#ffff00",
	"#c6ff00",
	"#aeea00",
	"#76ff03",
	"#64dd17",
	"#00e676",
	"#00c853",
	"#1de9b6",
	"#00bfa5",
	"#00e5ff",
	"#00b8d4",
	"#18ffff",
	"#40c4ff",
	"#00b0ff",
	"#2979ff",
	"#2962ff",
	"#304ffe",
	"#3d5afe",
	"#536dfe",
	"#651fff",
	"#6200ea",
	"#7c4dff",
	"#b388ff",
	"#d500f9",
	"#aa00ff",
	"#e040fb",
	"#ea80fc",
	"#ff00ff",
	"#ff4081",
	"#f50057",
	"#c51162",
	"#ff80ab",
	"#ff8a80",
	"#ff5252",
	"#ff1744",
];

const selectedGradient = `linear-gradient(90deg, ${selectedGradientColors.join(", ")})`;

const getScheduleValue = (schedule, keys) => {
	const foundKey = keys.find((key) => schedule[key] !== undefined && schedule[key] !== null);
	return foundKey ? schedule[foundKey] : undefined;
};

const isDateOnlyString = (value) => {
	return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
};

const toDate = (value) => {
	if (!value) return null;

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const toCalendarEndDate = (value) => {
	const date = toDate(value);
	if (!date) return null;

	if (isDateOnlyString(value)) {
		const nextDate = new Date(date);
		nextDate.setDate(nextDate.getDate() + 1);
		return nextDate;
	}

	return date;
};

const CalendarMui = ({ scheduleList = [], selectedSchedule = null, onSelectSchedule = null }) => {
	const didSetInitialDate = useRef(false);
	const [date, setDate] = useState(new Date());

	const events = useMemo(() => {
		return scheduleList
			.map((schedule, index) => {
				const startValue = getScheduleValue(schedule, [
					"IS_STARTDATE",
					"is_startdate",
					"isStartdate",
					"isStartDate",
				]);
				const endValue = getScheduleValue(schedule, [
					"IS_ENDDATE",
					"is_enddate",
					"isEnddate",
					"isEndDate",
				]);
				const start = toDate(startValue);
				const end = toCalendarEndDate(endValue) ?? start;

				if (!start) return null;

				return {
					id:
						getScheduleValue(schedule, ["IS_INDEX", "is_index", "id", "b_createdDate"]) ??
						index,
					title:
						getScheduleValue(schedule, ["C_NAME", "c_name", "name", "title"]) ??
						`Schedule ${index + 1}`,
					start,
					end: end < start ? start : end,
					allDay: isDateOnlyString(startValue) && isDateOnlyString(endValue),
					resource: { ...schedule, rowIndex: index },
				};
			})
			.filter(Boolean);
	}, [scheduleList]);

	useEffect(() => {
		if (didSetInitialDate.current || !events[0]?.start) return;

		setDate(events[0].start);
		didSetInitialDate.current = true;
	}, [events]);

	const eventPropGetter = (event) => {
		const isSelected = selectedSchedule?.rowIndex === event.resource?.rowIndex;
		const color = neonColors[event.resource?.rowIndex % neonColors.length] ?? neonColors[0];

		return {
			style: {
				background: isSelected
					? selectedGradient
					: `linear-gradient(135deg, ${color}, #ffffff 52%, ${color})`,
				border: isSelected ? "1px solid #ffffff" : `1px solid ${color}`,
				color: "#111",
				fontWeight: 700,
				textShadow: isSelected
					? "0 0 6px #ffffff, 0 0 12px #ffffff"
					: "0 0 5px #ffffff",
				boxShadow: isSelected
					? "0 0 8px #ffffff, 0 0 18px #ff00ff, 0 0 28px #00e5ff"
					: `0 0 8px ${color}, 0 0 16px ${color}`,
			},
		};
	};

	return (
		<div
			style={{
				height: "800px",
				padding: "20px",
				backgroundColor: "#fff",
			}}>
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				date={date}
				view="month"
				views={["month"]}
				onNavigate={setDate}
				popup
				showAllEvents
				eventPropGetter={eventPropGetter}
				onSelectEvent={(event) => {
					if (onSelectSchedule) onSelectSchedule(event.resource);
				}}
			/>
		</div>
	);
};

export default CalendarMui;
