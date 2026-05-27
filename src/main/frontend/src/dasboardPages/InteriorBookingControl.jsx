import React, { useEffect, useMemo, useState } from "react";
import BookingUpdate from "../components/BookingUpdate";
import TableMui from "../components/TableMui";
import { Chip } from "@mui/material";
import InteriorInvoiceAdd from "../components/InteriorInvoiceAdd";
import { GrDocumentPdf } from "react-icons/gr";
import "../css/DashboardInterior.css";

const InteriorBookingControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior") ?? [];
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);

	const [selectedBooking, setSelectedBooking] = useState(null);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [selectedInvoiceDetailLatestList, setSelectedInvoiceDetailLatestList] = useState([]);
	const [bookingRefreshKey, setBookingRefreshKey] = useState(0);

	const [transferListMuiLeft, setTransferListMuiLeft] = useState([]);
	const [transferListMuiRight, setTransferListMuiRight] = useState([]);

	const reLoadData = async () => {
		const setIndexToCompanyList = interior.map((record, index) => ({ ...record, id: index }));

		setSelectedCompany(null);
		setInteriorCompanyList(setIndexToCompanyList);
	};

	const refreshBookingList = () => {
		setBookingRefreshKey((prev) => prev + 1);
	};

	const invoiceTextKey = useMemo(() => ["invoice_text", "invoice_qty", "invoice_price"], []);

	const emptyList = useMemo(() => [], []);

	const transferListData = useMemo(() => {
		if (!selectedInvoiceDetailLatestList || selectedInvoiceDetailLatestList.length === 0) {
			return emptyList;
		}

		const rowIndexList = selectedInvoiceDetailLatestList?.detail.map((record, index) => {
			return { ...record, rowIndex: index };
		});

		return rowIndexList;
	}, [selectedInvoiceDetailLatestList, emptyList]);

	const selectedInvoiceTotal = useMemo(() => {
		const detailList = selectedInvoiceDetailLatestList?.detail ?? [];

		return detailList.reduce((sum, record) => {
			const qty = Number(record?.invoice_qty || 0);
			const price = Number(record?.invoice_price || 0);

			return sum + qty * price;
		}, 0);
	}, [selectedInvoiceDetailLatestList]);

	const selectedInvoiceDetailCount = selectedInvoiceDetailLatestList?.detail?.length ?? 0;

	const buttonData = [
		{
			title: "견적서 PDF",
			key: "exportPDF",
			color: "success",
			variant: "contained",
			icon: <GrDocumentPdf />,
			onClick: (row) => {
				if (!row) return;

				const pdfData = {
					invoice: row,
					invoiceDetail: row.detail,
					company: selectedCompany,
					orderBy: "insert",
				};

				console.log(pdfData);

				sessionStorage.setItem("exportPDFData", JSON.stringify(pdfData));

				window.open("/ExportPDFViewPage", "_blank", "width=1200,height=900");
			},
		},
	];

	useEffect(() => {
		reLoadData();
	}, [id]);

	useEffect(() => {
		setSelectedInvoice(null);
		setTransferListMuiLeft([]);
		setTransferListMuiRight([]);

		if (!selectedBooking) {
			setSelectedInvoiceDetailLatestList([]);
		}
	}, [selectedBooking]);

	return (
		<div className="interior-booking-page">
			<div className="interior-booking-header">
				<div>
					<h3>상담 예약 관리</h3>
					<p>인테리어 상담 요청부터 견적서 작성과 시공 전환까지 한 화면에서 관리합니다.</p>
				</div>
				<div className="interior-booking-summary">
					<Chip label={`업체 ${interiorCompanyList.length}개`} variant="outlined" />
					<Chip
						label={selectedBooking ? "예약 선택됨" : "예약 미선택"}
						color={selectedBooking ? "success" : "default"}
						variant="outlined"
					/>
					<Chip
						label={`견적 항목 ${selectedInvoiceDetailCount}개`}
						color={selectedInvoiceDetailCount > 0 ? "primary" : "default"}
						variant="outlined"
					/>
				</div>
			</div>

			<section className="interior-booking-card">
				<div className="interior-booking-card-head">
					<div>
						<strong>인테리어 업체 목록</strong>
						<span>상담 예약과 견적을 관리할 업체를 선택하세요.</span>
					</div>
					{selectedCompany && (
						<Chip label={selectedCompany.c_name} color="primary" variant="outlined" />
					)}
				</div>

				<div className="interior-booking-table">
					<TableMui
						selectedRow={selectedCompany}
						setSelectedRow={setSelectedCompany}
						rowData={interiorCompanyList}
						col={["c_name", "c_tel", "c_addr", "c_boss"]}
						columns={["업체명", "연락처", "주소", "대표자"]}
					/>
				</div>
			</section>

			<section className="interior-booking-card interior-booking-workspace">
				<div className="interior-booking-card-head">
					<div>
						<strong>{selectedCompany?.c_name || "상담 예약 목록"}</strong>
						<span>확정 전 상담 예약을 확인하고, 상태 변경과 견적 작업을 진행합니다.</span>
					</div>
					{selectedBooking && (
						<Chip
							label={selectedBooking.b_status || "상태 확인"}
							color="secondary"
							variant="outlined"
						/>
					)}
				</div>

				{selectedCompany ? (
					<div className="interior-booking-panel">
						<BookingUpdate
							company={selectedCompany}
							selectedBooking={selectedBooking}
							setSelectedBooking={setSelectedBooking}
							selectedInvoice={selectedInvoice}
							setSelectedInvoice={setSelectedInvoice}
							selectedInvoiceDetailList={selectedInvoiceDetailLatestList}
							setSelectedInvoiceDetailList={setSelectedInvoiceDetailLatestList}
							bookingRefreshKey={bookingRefreshKey}
						/>
					</div>
				) : (
					<div className="interior-booking-guide">
						먼저 업체를 선택하면 상담 예약 목록이 표시됩니다.
					</div>
				)}
			</section>

			<section className="interior-booking-card">
				<div className="interior-booking-card-head">
					<div>
						<strong>견적서 관리</strong>
						<span>선택한 상담 예약의 견적 항목을 구성하고 PDF로 확인합니다.</span>
					</div>
					<div className="interior-booking-total">
						<span>예상 합계</span>
						<strong>{selectedInvoiceTotal.toLocaleString()}원</strong>
					</div>
				</div>

				{selectedBooking ? (
					<div className="interior-booking-panel interior-booking-invoice">
						<InteriorInvoiceAdd
							booking={selectedBooking}
							selectedInvoice={selectedInvoice}
							setSelectedInvoice={setSelectedInvoice}
							selectedInvoiceDetailList={selectedInvoiceDetailLatestList}
							setSelectedInvoiceDetailList={setSelectedInvoiceDetailLatestList}
							//TransferListMui
							listData={transferListData}
							textKey={invoiceTextKey}
							left={transferListMuiLeft}
							setLeft={setTransferListMuiLeft}
							right={transferListMuiRight}
							setRight={setTransferListMuiRight}
							//Button Columns
							buttonData={buttonData}
							onInvoiceSaved={refreshBookingList}
						/>
					</div>
				) : (
					<div className="interior-booking-guide">
						상담 예약을 선택하면 견적서 작성 영역이 활성화됩니다.
					</div>
				)}
			</section>
		</div>
	);
};

export default InteriorBookingControl;
