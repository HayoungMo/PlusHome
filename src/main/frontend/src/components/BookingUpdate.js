import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TableMui from "./TableMui";
import TableMuiCollapse from "./TableMuiCollapse";
import { Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import DialogMui from "./DialogMui";
import SelectMui from "./SelectMui";

const BookingUpdate = ({
	company,
	selectedBooking,
	setSelectedBooking,
	selectedInvoice,
	setSelectedInvoice,
	selectedInvoiceDetailList,
	setSelectedInvoiceDetailList,
}) => {
	const [booking, setBooking] = useState([]);

	const reLoadBooking = async () => {
		const data = await InteriorService.fetchBookingList(company);

		const withOutStarted = data.filter(
			(item) =>
				item.b_status !== "working" &&
				item.b_status !== "done" &&
				item.b_status !== "cancel",
		);

		setBooking(withOutStarted);
	};

	useEffect(() => {
		if (company) reLoadBooking();

		setSelectedBooking(null);
	}, [company]);

	const [dialogCancelBooking, setDialogCancelBooking] = useState(false);

	const handleDialogCancelBooking = () => {
		setDialogCancelBooking(!dialogCancelBooking);
	};

	const onClickstartRemodel = async () => {
		if (selectedBooking.b_status !== "confirmed") {
			alert("확정된 상담만 진행 가능합니다");
			return;
		}

		const startRemodel = {
			...selectedBooking,
			b_status: "working",
		};

		await InteriorService.UpdateBooking(startRemodel);

		setSelectedBooking(null);
		reLoadBooking();
	};

	const onClickCancelBooking = async () => {
		const startRemodel = {
			...selectedBooking,
			b_status: "cancel",
		};

		await InteriorService.UpdateBooking(startRemodel);
		handleDialogCancelBooking();

		setSelectedBooking(null);
		reLoadBooking();
	};

	useEffect(() => {}, [selectedBooking]);

	return (
		<div>
			<div>
				<TableMuiCollapse
					selectedRow={selectedBooking}
					setSelectedRow={setSelectedBooking}
					rowData={booking}
					hiddenColumns={["b_answer"]}
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
											<TableCell>{key}</TableCell>
											<TableCell>
												{Array.isArray(answer[key])
													? answer[key].join(", ")
													: answer[key]}
											</TableCell>
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
						{(booking.b_status !== "cancel" || booking.b_status !== "done") && (
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
		</div>
	);
};

export default BookingUpdate;
