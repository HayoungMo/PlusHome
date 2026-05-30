import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InteriorService from "../service/interiorService";
import TableMuiCollapse from "./TableMuiCollapse";
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@mui/material";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";
import DatePickerMui from "./DatePickerMui";
import dayjs from "dayjs";
import {
	formatInteriorAnswerLabel,
	formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";

const BookingUpdate = ({
	company,
	selectedBooking,
	setSelectedBooking,
	selectedInvoice,
	setSelectedInvoice,
	selectedInvoiceDetailList,
	setSelectedInvoiceDetailList,
	bookingRefreshKey = 0,
	dateRange = { startDate: "", endDate: "" },
	isDateRangeInvalid = false,
}) => {
	const [booking, setBooking] = useState([]);
	const handledRefreshKeyRef = useRef(bookingRefreshKey);

	const initDialog = {
		open: false,
		title: "",
		text: "",
		type: "",
	};

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
		open: false,
	};

	const [dialogInfo, setDialogInfo] = useState(initDialog);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);

	const [workingDateInfo, setWorkingDateInfo] = useState({
		is_startdate: "",
		is_enddate: "",
	});

	const displayBooking = useMemo(() => {
		if (!booking || booking.length === 0) return [];

		return booking.filter((item) => {
			const bookingDate = dayjs(item.b_createdDate || item.b_date);
			const matchStart =
				!dateRange.startDate ||
				(bookingDate.isValid() && !bookingDate.isBefore(dayjs(dateRange.startDate), "day"));
			const matchEnd =
				!dateRange.endDate ||
				(bookingDate.isValid() && !bookingDate.isAfter(dayjs(dateRange.endDate), "day"));

			return !isDateRangeInvalid && matchStart && matchEnd;
		});
	}, [booking, dateRange, isDateRangeInvalid]);

	const isSameBooking = (bookingA, bookingB) => {
		if (!bookingA || !bookingB) return false;

		return (
			bookingA.id === bookingB.id &&
			bookingA.c_id === bookingB.c_id &&
			bookingA.c_kind === bookingB.c_kind &&
			bookingA.c_name === bookingB.c_name &&
			bookingA.b_createdDate === bookingB.b_createdDate
		);
	};

	const reLoadBooking = useCallback(
		async (preserveSelection = false) => {
			const data = await InteriorService.fetchBookingList(company);

			const withOutStarted = data.filter(
				(item) =>
					item.b_status !== "working" &&
					item.b_status !== "done" &&
					item.b_status !== "cancel",
			);

			setBooking(withOutStarted);

			if (preserveSelection) {
				setSelectedBooking((prevSelectedBooking) => {
					if (!prevSelectedBooking) return prevSelectedBooking;

					const refreshedSelectedBooking = withOutStarted.find((item) =>
						isSameBooking(item, prevSelectedBooking),
					);

					return refreshedSelectedBooking || null;
				});
			}
		},
		[company, setSelectedBooking],
	);

	useEffect(() => {
		setSelectedBooking(null);
		if (company) reLoadBooking(false);
	}, [company, reLoadBooking, setSelectedBooking]);

	useEffect(() => {
		if (handledRefreshKeyRef.current === bookingRefreshKey) return;

		handledRefreshKeyRef.current = bookingRefreshKey;
		if (company) reLoadBooking(true);
	}, [bookingRefreshKey, company, reLoadBooking]);

	const [dialogCancelBooking, setDialogCancelBooking] = useState(false);

	const handleDialogCancelBooking = () => {
		setDialogCancelBooking(!dialogCancelBooking);
	};

	const onClickstartRemodel = async () => {
		if (selectedBooking.b_status !== "confirmed") {
			setAlertInfo({
				severity: "error",
				title: "변경 불가",
				text: "확정된 견적서가 존재하지 않습니다.",
				open: true,
			});
			return;
		}

		setDialogInfo({
			open: true,
			title: "시공 시작",
			text: "해당 견적서를 기준으로 시공을 시작한 상태로 변경합니다. 변경 하시겠습니까?",
			type: "working",
		});
	};

	const onClickCancelBooking = async () => {
		setDialogCancelBooking({ ...dialogInfo, type: "cancel" });

		const startRemodel = {
			...selectedBooking,
			b_status: "cancel",
		};

		await InteriorService.UpdateBooking(startRemodel);
		handleDialogCancelBooking();

		setSelectedBooking(null);
		reLoadBooking();
	};

	const onClickHandleCloseDialog = () => {
		setDialogInfo(initDialog);
	};

	const onClickConfirmBookingStateChange = async (type) => {
		if (type === "working") {
			const startRemodel = {
				...selectedBooking,
				b_status: "working",
			};

			const result = await InteriorService.UpdateBooking(startRemodel);
			if (result.success) {
				const result2 = await InteriorService.insertInteriorSchedule({
					...workingDateInfo,
					...startRemodel,
				});

				if (result2.success) {
					setAlertInfo({
						severity: "success",
						title: "저장 완료",
						text: result2.message,
						open: true,
					});
				} else {
					setAlertInfo({
						severity: "error",
						title: "저장 실패",
						text: result2.message,
						open: true,
					});
				}
			} else {
				setAlertInfo({
					severity: "error",
					title: "변경 불가",
					text: "확정된 견적서가 존재하지 않습니다.",
					open: true,
				});
			}

			setSelectedBooking(null);
			reLoadBooking();
			setDialogInfo(initDialog);
		} else if (type === "cancel") {
		}
	};

	useEffect(() => {}, [selectedBooking]);

	return (
		<div>
			<div>
				<TableMuiCollapse
					selectedRow={selectedBooking}
					setSelectedRow={setSelectedBooking}
					rowData={displayBooking}
					hiddenColumns={["b_answer"]}
					columns={[
						"예약자 ID",
						"신청일",
						"업체 ID",
						"업체 구분",
						"업체명",
						"상담 종류",
						"희망 기간",
						"예약일",
						"진행 상태",
						"상담 내용",
					]}
					collapseTitle="상담 상세 정보"
					renderCollapse={(row) => {
						let answer = {};

							try {
								answer = row.b_answer ? JSON.parse(row.b_answer) : {};
							} catch (e) {
								answer = {};
							}

						return (
							<Table size="small">
								<TableBody>
									{Object.keys(answer).map((key) => (
										<TableRow key={key}>
											<TableCell>{formatInteriorAnswerLabel(key)}</TableCell>
											<TableCell>{formatInteriorAnswerValue(answer[key])}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						);
					}}
				/>
				{selectedBooking && (
					<>
						<Button variant="contained" color="secondary" onClick={onClickstartRemodel}>
							시공 시작
						</Button>
						{selectedBooking.b_status !== "cancel" &&
							selectedBooking.b_status !== "done" && (
								<Button onClick={handleDialogCancelBooking}>상담 취소</Button>
							)}
						<DialogMui
							open={dialogCancelBooking}
							onClose={handleDialogCancelBooking}
							title="취소 확인"
							text="정말 상담을 취소하시겠습니까?"
							buttons={[
								{
									title: "돌아가기",
									color: "inherit",
									onClick: handleDialogCancelBooking,
								},
								{
									title: "확인",
									color: "error",
									variant: "contained",
									onClick: onClickCancelBooking,
								},
							]}
						/>
					</>
				)}
			</div>
			{dialogInfo.open && (
				<Dialog
					open={dialogInfo.open}
					onClose={() => setDialogInfo({ ...dialogInfo, open: false })}
					maxWidth="md"
					fullWidth>
					<DialogTitle>{dialogInfo.title}</DialogTitle>

					<DialogContent>
						{dialogInfo.text}

						<DatePickerMui
							value={workingDateInfo.is_startdate}
							onChange={(e) => {
								setWorkingDateInfo({ ...workingDateInfo, is_startdate: e });
							}}
							label="시공 시작일"
						/>
						<DatePickerMui
							value={workingDateInfo.is_enddate}
							onChange={(e) => {
								setWorkingDateInfo({ ...workingDateInfo, is_enddate: e });
							}}
							label="시공 종료일"
						/>

						<Button variant="outlined" color="error" onClick={onClickHandleCloseDialog}>
							취소
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => onClickConfirmBookingStateChange(dialogInfo.type)}>
							확인
						</Button>
					</DialogContent>
				</Dialog>
			)}
			{alertInfo?.open && (
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

export default BookingUpdate;
