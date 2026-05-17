import React, { useEffect, useMemo, useState } from "react";
import BookingUpdate from "../components/BookingUpdate";
import TableMui from "../components/TableMui";
import TransferListMui from "../components/TransferListMui";
import { Button } from "@mui/material";
import InteriorInvoiceAdd from "../components/InteriorInvoiceAdd";
import { GrDocumentPdf } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const InteriorBookingControl = () => {
	const navigate = useNavigate();
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;



	const interior = companyList.filter((data) => data.c_kind === "interior");
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);

	const [selectedBooking, setSelectedBooking] = useState(null);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [selectedInvoiceDetailLatestList, setSelectedInvoiceDetailLatestList] = useState([]);

	const [transferListMuiLeft, setTransferListMuiLeft] = useState([]);
	const [transferListMuiRight, setTransferListMuiRight] = useState([]);

	const reLoadData = async () => {
		const setIndexToCompanyList = interior.map((record, index) => ({ ...record, id: index }));

		setSelectedCompany(null);
		setInteriorCompanyList(setIndexToCompanyList);
	};

	// 렌더링 시 매번 새로 만드는거 방지
	const invoiceTextKey = useMemo(() => ["invoice_text", "invoice_qty", "invoice_price"], []);

	const emptyList = useMemo(() => [], []);

	const transferListData = useMemo(() => {
		if (!selectedInvoiceDetailLatestList || selectedInvoiceDetailLatestList.length === 0)
			return emptyList;
		const rowIndexList = selectedInvoiceDetailLatestList?.detail.map((record, index) => {
			return { ...record, rowIndex: index };
		});

		return rowIndexList;
	}, [selectedInvoiceDetailLatestList, emptyList]);

	const buttonData = [
	{
		title: "견적서 PDF",
		key: "exportPDF",
		color: "success",
		variant: "contained",
		icon: <GrDocumentPdf />,
		onClick: (row) => {
			if (!selectedInvoice) {
				alert("견적서를 먼저 선택해주세요.");
				return;
			}

			const invoiceDetail =
				selectedInvoiceDetailLatestList?.detail || selectedInvoiceDetailLatestList || [];

			navigate("/ExportPDFViewPage", {
				state: {
					userData,
					invoice: selectedInvoice,
					invoiceDetail,
					company: selectedCompany,
					orderBy: "insert",
				},
			});
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
		<div>
			<TableMui
				selectedRow={selectedCompany}
				setSelectedRow={setSelectedCompany}
				rowData={interiorCompanyList}
			/>

			<BookingUpdate
				company={selectedCompany}
				selectedBooking={selectedBooking}
				setSelectedBooking={setSelectedBooking}
				selectedInvoice={selectedInvoice}
				setSelectedInvoice={setSelectedInvoice}
				selectedInvoiceDetailList={selectedInvoiceDetailLatestList}
				setSelectedInvoiceDetailList={setSelectedInvoiceDetailLatestList}
			/>

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
			/>
		</div>
	);
};

export default InteriorBookingControl;
