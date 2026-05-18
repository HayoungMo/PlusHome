import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import CheckboxMui from "./CheckboxMui";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import TableMui from "./TableMui";
import TableMuiCollapse from "./TableMuiCollapse";
import AlertMui from "./AlertMui";
import TransferListMui from "./TransferListMui";
import DialogMui from "./DialogMui";

const InteriorInvoiceAdd = ({
	booking = null,
	selectedInvoice = null,
	setSelectedInvoice = null,
	selectedInvoiceDetailList = null,
	setSelectedInvoiceDetailList = null,
	listData = [],
	textKey = [],
	left = [],
	setLeft = null,
	right = [],
	setRight = null,
	buttonData = []
}) => {
	const [detail, setDetail] = useState({ invoice_text: "", invoice_qty: "", invoice_price: "" });
	const [detailsList, setDetailsList] = useState([]);
	const [invoice, setInvoice] = useState([]);
	const [invoiceWithDetails, setInvoiceWithDetails] = useState([]);
	const [kind, setKind] = useState({});
	const [alert, setAlert] = useState({
		open: false,
		severity: "info",
		title: "",
		text: "",
	});
	const [selectedItem, setSelectedItem] = useState({});
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);

	const addDetail = () => {
		if (detail.rowIndex !== undefined || detail.rowIndex >= 0) {
			setDetailsList((prev) => {
				const newArr = [...prev];
				newArr[detail.rowIndex] = {
					...newArr[detail.rowIndex],
					invoice_text: detail.invoice_text,
					invoice_qty: detail.invoice_qty,
					invoice_price: detail.invoice_price,
				};
				return newArr;
			});
			setLeft((prev) => {
				const newArr = [...prev];
				newArr[detail.rowIndex] = {
					...newArr[detail.rowIndex],
					invoice_text: detail.invoice_text,
					invoice_qty: detail.invoice_qty,
					invoice_price: detail.invoice_price,
				};
				return newArr;
			});
		} else {
			setDetailsList([...detailsList, { ...detail, rowIndex: detailsList.length }]);
			setLeft([...left, detail]);
		}
		setDetail({ invoice_text: "", invoice_qty: "", invoice_price: "" });
	};

	const handleDetailChange = (e) => {
		const { name, value } = e.target;

		setDetail({ ...detail, [name]: value });
	};

	const getNextInvoiceNo = () => {
		if (!invoice || invoice.length === 0) return 1;

		const maxNo = Math.max(...invoice.map((inv) => Number(inv?.invoice_no)));

		return maxNo + 1;
	};

	const handleSaveInvoiceAndInvoiceDetail = async () => {
		const nextInvoiceNo = getNextInvoiceNo();
		debugger;
		const invoiceData = {
			id: booking.id,
			invoice_no: nextInvoiceNo,
			invoice_kind: kind[booking.b_createdDate] || "N",
			c_id: booking.c_id,
			c_kind: booking.c_kind,
			c_name: booking.c_name,
			b_createdDate: booking.b_createdDate,
			details: right.map((record) => ({
				invoice_text: record.invoice_text,
				invoice_qty: Number(record.invoice_qty),
				invoice_price: Number(record.invoice_price),
			})),
		};

		const result = await InteriorService.AddInvoice(invoiceData);

		if (result?.success) {
			setAlert({
				open: true,
				severity: "success",
				title: "등록 성공",
				text: "등록되었습니다.",
			});
			setSaveDialogOpen(!saveDialogOpen);
			await fetchInvoices();
		} else {
			setAlert({
				open: true,
				severity: "error",
				title: `에러 (${result.status})`,
				text: result.message || "오류가 발생했습니다.",
			});
			setSaveDialogOpen(!saveDialogOpen);
		}
	};

	const fetchInvoiceDetails = async () => {
		if (!Array.isArray(invoice) || invoice.length === 0) {
			setInvoiceWithDetails([]);
			setDetailsList([]);
			return;
		}
		const result = await Promise.all(
			invoice.map(async (item) => {
				const data = await InteriorService.fetchInvoiceDetails(item);

				const details = Array.isArray(data) ? data : data ? [data] : [];

				const mappedDetails = details.map((detail) => {
					const qty = Number(detail.invoice_qty || 0);
					const price = Number(detail.invoice_price || 0);

					return { ...detail, line_total: qty * price };
				});

				const total_qty = mappedDetails.reduce(
					(sum, detail) => sum + Number(detail.invoice_qty || 0),
					0,
				);

				const total_price = mappedDetails.reduce(
					(sum, detail) => sum + Number(detail.line_total || 0),
					0,
				);

				return {
					...item,
					detail: mappedDetails,
					total_qty,
					total_price,
				};
			}),
		);

		const maxItem = result.reduce((prev, current) => {
			return prev.index > current.index ? prev : current;
		});

		const rowIndexMaxItem = maxItem?.detail.map((record, index) => {
			return { ...record, rowIndex: index };
		});
		setInvoiceWithDetails(result);
		setDetailsList(rowIndexMaxItem);
	};

	const fetchInvoices = async () => {
		const data = await InteriorService.fetchInvoice(booking);
		const merged = Array.isArray(data) ? data.flat() : data ? [data] : [];
		setInvoice(merged);
	};

	useEffect(() => {
		if (!booking) setInvoiceWithDetails([]);
		else fetchInvoices();
	}, [booking]);

	useEffect(() => {
		if (Array.isArray(invoice) && invoice.length > 0) {
			fetchInvoiceDetails();
		} else {
			setInvoiceWithDetails([]);
		}
	}, [invoice]);

	useEffect(() => {
		if (!invoiceWithDetails || invoiceWithDetails.length === 0) return;
		if (!setSelectedInvoiceDetailList) return;

		const latestInvoiceDetail = invoiceWithDetails[invoiceWithDetails.length - 1];

		setSelectedInvoiceDetailList((prev) => {
			if (prev?.invoice_no === latestInvoiceDetail?.invoice_no) {
				return prev;
			}

			return latestInvoiceDetail;
		});
	}, [invoiceWithDetails, setSelectedInvoiceDetailList]);

	useEffect(() => {
		if (!selectedItem || !selectedItem.invoice_text) return;

		setDetail(selectedItem);
	}, [selectedItem]);

	return (
		<div>
			{alert.open && (
				<AlertMui
					severity={alert.severity}
					title={alert.title}
					text={alert.text}
					autoHideDuration={3000}
					onClose={() =>
						setAlert((prev) => ({
							...prev,
							open: false,
						}))
					}
				/>
			)}
			<div>
				<p>인테리어 견적 추가</p>

				{setSelectedInvoice && (
					<TableMuiCollapse
						rowData={invoiceWithDetails}
						hiddenColumns={["detail", "details"]}
						collapseKey="detail"
						collapseTitle="견적 상세 내역"
						collapseColumns={["invoice_text", "invoice_qty", "invoice_price"]}
						selectedRow={selectedInvoice}
						setSelectedRow={setSelectedInvoice}
						buttonData={buttonData}
					/>
				)}

				{(booking?.b_status === "pending" || booking?.b_status === "quoting") && (
					<div>
						<CheckboxMui
							name="kind"
							label="완료 여부"
							checked={kind[booking.b_createdDate] === "Y"}
							onChange={(e) => {
								setKind({
									...kind,
									[booking.b_createdDate]: e.target.checked ? "Y" : "N",
								});
							}}
						/>
					</div>
				)}
				<div>
					<TextFieldMui
						name="invoice_text"
						label="항목"
						value={detail.invoice_text}
						onChange={(e) => handleDetailChange(e)}
					/>

					<TextFieldMui
						name="invoice_qty"
						label="개수"
						value={detail.invoice_qty}
						onChange={(e) => handleDetailChange(e)}
					/>

					<TextFieldMui
						name="invoice_price"
						label="가격"
						value={detail.invoice_price}
						onChange={(e) => handleDetailChange(e)}
					/>
				</div>
				<Button onClick={addDetail}>ADD</Button>

				<TransferListMui
					key="transferListMui_invoiceDetailTransferListData"
					listData={listData}
					textKey={textKey}
					left={left}
					setLeft={setLeft}
					right={right}
					setRight={setRight}
					selectedItem={selectedItem}
					setSelectedItem={setSelectedItem}
				/>
				<Button
					color="success"
					variant="contained"
					onClick={() => {
						setSaveDialogOpen(!saveDialogOpen);
					}}>
					추가
				</Button>
			</div>

			{saveDialogOpen && (
				<DialogMui
					open={saveDialogOpen}
					onClose={() => setSaveDialogOpen(!saveDialogOpen)}
					title="배송 상태 변경"
					text="현재 선택한 주문들의 상태를 변경합니다. 저장하시겠습니까?"
					buttons={[
						{
							title: "Cancel",
							color: "error",
							variant: "contained",
							onClick: () => setSaveDialogOpen(!saveDialogOpen),
						},
						{
							title: "Save",
							color: "primary",
							variant: "contained",
							onClick: () => handleSaveInvoiceAndInvoiceDetail(),
						},
					]}
				/>
			)}
		</div>
	);
};

export default InteriorInvoiceAdd;
