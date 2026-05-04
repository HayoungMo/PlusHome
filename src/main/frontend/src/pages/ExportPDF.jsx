import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceService from "../service/invoiceService";
import RadioMui from "./../components/RadioMui";
import TableMui from "./../components/TableMui";
import { Button } from "@mui/material";
import Chart1 from './../components/Chart1';

const ExportPDF = () => {
	const navigate = useNavigate();
	const loginUser = { id: "test1", pw: "a123", name: "김감전" };

	const [company, setCompany] = useState(null);
	const [invoice, setInvoice] = useState([]);
	const [invoiceDetail, setInvoiceDetail] = useState([]);

	const [orderBy, setOrderBy] = useState("");

	useEffect(() => {
		InvoiceService.getInvoiceList({
			id: "comp01",
			c_id: "comp02",
			c_kind: "interior",
			c_name: "감성인테리어",
			b_createdDate: "2026-05-04 09:54:53",
		}).then((res) => {
			setInvoice(res.data);
		});

		InvoiceService.getCompanyInfo({
			c_id: "comp02",
			c_kind: "interior",
			c_name: "감성인테리어",
		}).then((res) => {
			setCompany(res.data);
		});
	}, []);

	useEffect(() => {
		if (invoice.length === 0) return;

		InvoiceService.getInvoiceDetailList(invoice[4]).then((res) => {
			setInvoiceDetail(res.data);
		});
	}, [invoice]);

	useEffect(() => {
		if (invoiceDetail.length === 0) return;

		console.log(invoice);
		console.log(invoiceDetail);
	}, [invoiceDetail]);

	const radioList = [
		{ value: "insert", title: "등록순서" },
		{ value: "price_high", title: "가격높은순" },
		{ value: "price_low", title: "가격낮은순" },
		{ value: "qty_many", title: "수량많은순" },
		{ value: "qty_less", title: "수량적은순" },
		{ value: "total_high", title: "총계높은순" },
		{ value: "total_low", title: "총계낮은순" },
	];

	return (
		<div>
			<Button
				variant="contained"
				color="primary"
				onClick={() =>
					navigate("/ExportPDFViewPage", {
						state: {
							loginUser,
							invoice: invoice[4],
							invoiceDetail,
							company,
							orderBy,
						},
					})
				}>
				PDF
			</Button>

			<RadioMui
				label="정렬"
				value={orderBy}
				onChange={(e) => {
					setOrderBy(e.target.value);
					console.log(e.target.value);
				}}
				labelList={radioList}
			/>

			<TableMui
				rowData={invoiceDetail}
				columns={[
					"회사ID",
					"회사 구분",
					"회사 이름",
					"신청자",
					"생성일",
					"청구서 번호",
					"구분",
					"청구 항목",
					"항목 가격",
					"개수",
				]}
			/>

			<Chart1/>
		</div>
	);
};

export default ExportPDF;
