import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

const statusColorMap = {
	working: { background: "#dbeafe", border: "#60a5fa", color: "#1e3a8a" },
	done: { background: "#dcfce7", border: "#86efac", color: "#166534" },
	cancel: { background: "#fee2e2", border: "#fca5a5", color: "#991b1b" },
	canceled: { background: "#fee2e2", border: "#fca5a5", color: "#991b1b" },
	pending: { background: "#fef3c7", border: "#facc15", color: "#854d0e" },
	quoting: { background: "#ede9fe", border: "#c4b5fd", color: "#5b21b6" },
};

const defaultStatusColor = { background: "#f1f5f9", border: "#cbd5e1", color: "#334155" };

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
		const statusColor = statusColorMap[event.resource?.b_status] ?? defaultStatusColor;

		return {
			className: isSelected ? "calendar-mui-event-selected" : "",
			style: {
				background: isSelected ? "#1d4ed8" : statusColor.background,
				border: isSelected ? "1px solid #1e40af" : `1px solid ${statusColor.border}`,
				color: isSelected ? "#ffffff" : statusColor.color,
				fontWeight: 800,
				boxShadow: isSelected ? "0 8px 18px rgba(29, 78, 216, 0.25)" : "none",
			},
		};
	};

	return (
		<div className="calendar-mui">
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
