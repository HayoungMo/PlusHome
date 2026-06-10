import React, { useCallback, useEffect, useMemo, useState } from "react";
import BookingUpdate from "../components/BookingUpdate";
import DateRangeFilter from "../components/DateRangeFilter";
import TableMui from "../components/TableMui";
import { Button, Chip } from "@mui/material";
import InteriorInvoiceAdd from "../components/InteriorInvoiceAdd";
import { GrDocumentPdf } from "react-icons/gr";
import dayjs from "dayjs";
import Loading from "../components/Loading";
import "../css/DashboardInterior.css";

const COMPANY_ADDRESS_SEPARATOR = "__";

const parseCompanyAddress = (address) => {
	if (!address) return { c_addr1: "", c_addr2: "" };

	const [baseAddress = "", ...detailParts] = String(address).split(COMPANY_ADDRESS_SEPARATOR);

	return {
		c_addr1: baseAddress,
		c_addr2: detailParts.join(COMPANY_ADDRESS_SEPARATOR),
	};
};

const formatAddress = (address) => {
	if (!address) return "";
	const { c_addr1, c_addr2 } = parseCompanyAddress(address);
	return [c_addr1, c_addr2].filter(Boolean).join(" ");
};

const bookingStatusLabels = {
	pending: "예약 대기",
	quoting: "견적 진행중",
	confirmed: "예약 확정",
	working: "시공중",
	done: "시공 완료",
	cancel: "취소",
	canceled: "취소",
	cance: "취소",
};

const formatBookingStatus = (status) => {
	if (status == null || status === "") return "";

	return bookingStatusLabels[status] || status;
};

const InteriorBookingControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = useMemo(() => JSON.parse(localUserData), [localUserData]);
	const { id, companyList } = userData;

	const interior = useMemo(
		() => companyList.filter((data) => data.c_kind === "interior") ?? [],
		[companyList],
	);
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("상담 예약 관리 데이터를 불러오는 중입니다...");
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [selectedInvoiceDetailLatestList, setSelectedInvoiceDetailLatestList] = useState([]);
	const [bookingRefreshKey, setBookingRefreshKey] = useState(0);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));

	const [transferListMuiLeft, setTransferListMuiLeft] = useState([]);
	const [transferListMuiRight, setTransferListMuiRight] = useState([]);

	const reLoadData = useCallback(
		async (showLoading = true) => {
			if (showLoading) {
				setIsLoading(true);
				setLoadingText("인테리어 업체 목록을 불러오는 중입니다...");
			}

			try {
				const setIndexToCompanyList = interior.map((record, index) => ({
					...record,
					id: index,
				}));

				const addrSettingList = setIndexToCompanyList.map((company) => ({
					...company,
					c_addr_display: formatAddress(company.c_addr) || "-",
				}));

				setSelectedCompany(null);
				setInteriorCompanyList(addrSettingList);
			} catch (error) {
				console.error(error);

				setSelectedCompany(null);
				setInteriorCompanyList([]);
			} finally {
				if (showLoading) {
					setIsLoading(false);
				}
			}
		},
		[interior],
	);

	const refreshBookingList = () => {
		setBookingRefreshKey((prev) => prev + 1);
	};

	const handleSearch = () => {
		setAppliedDateRange(dateRange);
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
	}, [id, reLoadData]);

	useEffect(() => {
		setSelectedInvoice(null);
		setSelectedInvoiceDetailLatestList([]);
		setTransferListMuiLeft([]);
		setTransferListMuiRight([]);
	}, [selectedBooking]);

	return (
		<div className="interior-booking-page">
			<div className="interior-booking-header">
				<div>
					<h3>상담 예약 관리</h3>
					<p>
						인테리어 상담 요청부터 견적서 작성과 시공 전환까지 한 화면에서 관리합니다.
					</p>
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
					{isLoading ? (
						<Loading message={loadingText} />
					) : interiorCompanyList?.length > 0 ? (
						<TableMui
							selectedRow={selectedCompany}
							setSelectedRow={setSelectedCompany}
							rowData={interiorCompanyList}
							col={["c_name", "c_tel", "c_addr_display", "c_boss"]}
							columns={["업체명", "연락처", "주소", "대표자"]}
							defaultRowPerPage={5}
							resetPageKey={`tablemui-${selectedCompany}-info-table`}
							pagination
						/>
					) : (
						<div className="interior-booking-guide">등록된 업체 데이터가 없습니다.</div>
					)}
				</div>
			</section>

			<section className="interior-booking-card interior-booking-workspace">
				<div className="interior-booking-card-head">
					<div>
						<strong>{selectedCompany?.c_name || "상담 예약 목록"}</strong>
						<span>
							확정 전 상담 예약을 확인하고, 상태 변경과 견적 작업을 진행합니다.
						</span>
					</div>
					{selectedBooking && (
						<Chip
							label={formatBookingStatus(selectedBooking.b_status) || "상태 확인"}
							color="secondary"
							variant="outlined"
						/>
					)}
				</div>

				<div className="interior-filter-row">
					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
					/>
					<Button variant="contained" onClick={handleSearch}>
						검색
					</Button>
				</div>

				{isLoading ? (
					<div className="interior-booking-guide">
						<Loading message={loadingText} />
					</div>
				) : selectedCompany ? (
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
							dateRange={appliedDateRange}
							isDateRangeInvalid={Boolean(isAppliedDateRangeInvalid)}
						/>
					</div>
				) : (
					<div className="interior-booking-guide">
						업체를 선택하면 상담 예약 목록이 표시됩니다.
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

				{isLoading ? (
					<div className="interior-booking-guide">
						<Loading message={loadingText} />
					</div>
				) : selectedBooking ? (
					<div className="interior-booking-panel interior-booking-invoice">
						<InteriorInvoiceAdd
							booking={selectedBooking}
							selectedInvoice={selectedInvoice}
							setSelectedInvoice={setSelectedInvoice}
							selectedInvoiceDetailList={selectedInvoiceDetailLatestList}
							setSelectedInvoiceDetailList={setSelectedInvoiceDetailLatestList}
							listData={transferListData}
							textKey={invoiceTextKey}
							left={transferListMuiLeft}
							setLeft={setTransferListMuiLeft}
							right={transferListMuiRight}
							setRight={setTransferListMuiRight}
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
