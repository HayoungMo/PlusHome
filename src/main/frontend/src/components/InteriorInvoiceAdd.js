import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import CheckboxMui from "./CheckboxMui";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import TableMuiCollapse from "./TableMuiCollapse";
import AlertMui from "./AlertMui";
import DialogMui from "./DialogMui";

const InteriorInvoiceAdd = ({
	booking = null,
	selectedInvoice = null,
	setSelectedInvoice = null,
	selectedInvoiceDetailList = null,
	setSelectedInvoiceDetailList = null,
	listData = [],
	left = [],
	setLeft = null,
	right = [],
	setRight = null,
	buttonData = [],
	onInvoiceSaved = null,
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
	const [selectedTransferSide, setSelectedTransferSide] = useState("");
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);

	const emptyDetail = { invoice_text: "", invoice_qty: "", invoice_price: "" };
	const isEditingDetail = detail.rowIndex !== undefined && detail.rowIndex >= 0;

	const resetDetailForm = () => {
		setDetail(emptyDetail);
		setSelectedItem({});
		setSelectedTransferSide("");
	};

	const getItemKey = (item) =>
		[item?.rowIndex, item?.invoice_text, item?.invoice_qty, item?.invoice_price].join("_");

	const isSameItem = (itemA, itemB) => getItemKey(itemA) === getItemKey(itemB);

	const formatPrice = (value) => Number(value || 0).toLocaleString();

	const selectTransferItem = (item, side) => {
		setSelectedItem(item);
		setSelectedTransferSide(side);
	};

	const moveSelectedToRight = () => {
		if (!setLeft || !setRight) return;
		if (!selectedItem?.invoice_text || selectedTransferSide !== "left") return;
		if (right.some((item) => isSameItem(item, selectedItem))) return;

		setRight([...right, selectedItem]);
		setLeft(left.filter((item) => !isSameItem(item, selectedItem)));
		resetDetailForm();
	};

	const moveSelectedToLeft = () => {
		if (!setLeft || !setRight) return;
		if (!selectedItem?.invoice_text || selectedTransferSide !== "right") return;
		if (left.some((item) => isSameItem(item, selectedItem))) return;

		setLeft([...left, selectedItem]);
		setRight(right.filter((item) => !isSameItem(item, selectedItem)));
		resetDetailForm();
	};

	const renderInvoiceItem = (item, side) => {
		const selected = selectedTransferSide === side && isSameItem(selectedItem, item);
		const lineTotal = Number(item?.invoice_qty || 0) * Number(item?.invoice_price || 0);

		return (
			<button
				type="button"
				className={`interior-invoice-item${selected ? " selected" : ""}`}
				key={`${side}-${getItemKey(item)}`}
				onClick={() => selectTransferItem(item, side)}>
				<span className="interior-invoice-item-check" />
				<span className="interior-invoice-item-body">
					<strong>{item.invoice_text || "항목 없음"}</strong>
					<span>{formatPrice(item.invoice_qty)}개</span>
					<em>{formatPrice(lineTotal)}원</em>
				</span>
			</button>
		);
	};

	const replaceDetailByRowIndex = (list, nextDetail) =>
		list.map((item) =>
			item.rowIndex === nextDetail.rowIndex ? { ...item, ...nextDetail } : item,
		);

	const validateDetail = () => {
		const invoiceText = detail.invoice_text?.trim();
		const invoiceQty = Number(detail.invoice_qty);
		const invoicePrice = Number(detail.invoice_price);

		if (!invoiceText) {
			return "품목명을 입력해주세요.";
		}

		if (!Number.isFinite(invoiceQty) || invoiceQty <= 0) {
			return "수량은 1 이상 숫자로 입력해주세요.";
		}

		if (!Number.isFinite(invoicePrice) || invoicePrice < 0) {
			return "가격은 0 이상 숫자로 입력해주세요.";
		}

		return "";
	};

	const addDetail = () => {
		const validationMessage = validateDetail();

		if (validationMessage) {
			setAlert({
				open: true,
				severity: "warning",
				title: "입력 확인",
				text: validationMessage,
			});
			return;
		}

		const nextDetail = {
			...detail,
			invoice_text: detail.invoice_text.trim(),
			invoice_qty: Number(detail.invoice_qty),
			invoice_price: Number(detail.invoice_price),
		};

		if (isEditingDetail) {
			setDetailsList((prev) => replaceDetailByRowIndex(prev, nextDetail));
			setLeft((prev) => replaceDetailByRowIndex(prev, nextDetail));
			setRight((prev) => replaceDetailByRowIndex(prev, nextDetail));
		} else {
			const createdDetail = { ...nextDetail, rowIndex: detailsList.length };

			setDetailsList([...detailsList, createdDetail]);
			setLeft([...left, createdDetail]);
		}

		resetDetailForm();
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
			await onInvoiceSaved?.();
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
		if (!setLeft || !setRight) return;

		setLeft(listData || []);
		setRight([]);
		setSelectedItem({});
		setSelectedTransferSide("");
	}, [listData, setLeft, setRight]);

	useEffect(() => {
		if (!selectedItem || !selectedItem.invoice_text) return;

		setDetail(selectedItem);
	}, [selectedItem]);

	return (
		<div className="interior-invoice-add">
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
			<div className="interior-invoice-add-body">
				{setSelectedInvoice &&
					(invoiceWithDetails.length > 0 ? (
						<TableMuiCollapse
							rowData={invoiceWithDetails}
							hiddenColumns={["detail", "details"]}
							selectedColor="#eff6ff"
							collapseKey="detail"
							collapseTitle="견적 상세 내역"
							collapseColumns={["invoice_text", "invoice_qty", "invoice_price"]}
							selectedRow={selectedInvoice}
							setSelectedRow={setSelectedInvoice}
							buttonData={buttonData}
						/>
					) : (
						<div className="interior-booking-guide">
							등록된 견적서 데이터가 없습니다.
						</div>
					))}

				<div className="interior-invoice-form-head">
					<p className="interior-invoice-add-title">인테리어 견적 추가</p>
					{(booking?.b_status === "pending" || booking?.b_status === "quoting") && (
						<div className="interior-invoice-kind-row">
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
				</div>
				<div className="interior-invoice-detail-form">
					<div className="interior-invoice-detail-inputs">
						<TextFieldMui
							name="invoice_text"
							label="항목"
							value={detail.invoice_text}
							onChange={handleDetailChange}
							width="100%"
						/>

						<TextFieldMui
							name="invoice_qty"
							label="개수"
							value={detail.invoice_qty}
							onChange={handleDetailChange}
							width="140px"
							style={{
								minWidth:'140px'
							}}
						/>

						<TextFieldMui
							name="invoice_price"
							label="가격"
							value={detail.invoice_price}
							onChange={handleDetailChange}
							width="100%"
						/>
					</div>

					<div className="interior-invoice-detail-actions">
						{isEditingDetail && (
							<Button color="inherit" variant="outlined" onClick={resetDetailForm}>
								수정 취소
							</Button>
						)}

						<Button
							className="interior-invoice-add-button"
							variant="contained"
							onClick={addDetail}>
							{isEditingDetail ? "항목 수정" : "항목 추가"}
						</Button>
					</div>
				</div>

				<div className="interior-invoice-builder">
					<section className="interior-invoice-list-panel">
						<div className="interior-invoice-list-head">
							<strong>등록된 항목</strong>
							<span>{left.length}개</span>
						</div>
						<div className="interior-invoice-list">
							{left.length > 0 ? (
								left.map((item) => renderInvoiceItem(item, "left"))
							) : (
								<div className="interior-invoice-list-empty">
									추가할 항목이 없습니다.
								</div>
							)}
						</div>
					</section>

					<div className="interior-invoice-move-actions">
						<Button
							variant="contained"
							onClick={moveSelectedToRight}
							disabled={selectedTransferSide !== "left"}>
							추가
						</Button>
						<Button
							variant="outlined"
							onClick={moveSelectedToLeft}
							disabled={selectedTransferSide !== "right"}>
							제거
						</Button>
					</div>

					<section className="interior-invoice-list-panel target">
						<div className="interior-invoice-list-head">
							<strong>최종 견적 항목</strong>
							<span>{right.length}개</span>
						</div>
						<div className="interior-invoice-list">
							{right.length > 0 ? (
								right.map((item) => renderInvoiceItem(item, "right"))
							) : (
								<div className="interior-invoice-list-empty">
									견적에 포함할 항목을 선택하세요.
								</div>
							)}
						</div>
					</section>
				</div>
				<div className="interior-invoice-footer">
					<Button
						className="interior-invoice-save-button"
						color="success"
						variant="contained"
						disabled={right.length === 0}
						onClick={() => {
							setSaveDialogOpen(!saveDialogOpen);
						}}>
						견적 저장
					</Button>
				</div>
			</div>

			{saveDialogOpen && (
				<DialogMui
					open={saveDialogOpen}
					onClose={() => setSaveDialogOpen(!saveDialogOpen)}
					title="견적 발행"
					text="현재 선택한 내용으로 견적서를 발행합니다. 발행하시겠습니까?"
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
