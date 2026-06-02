// src/pages/ExportPDFViewPage.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font } from "@react-pdf/renderer";
import { useLocation } from "react-router-dom";
import fontRegular from "../resources/fonts/NotoSansKR-Regular.ttf";
import fontBold from "../resources/fonts/NotoSansKR-Bold.ttf";

Font.register({
	family: "NotoSansKR",
	fonts: [
		{ src: fontRegular, fontWeight: "normal" },
		{ src: fontBold, fontWeight: "bold" },
	],
});

const formatMoney = (value) => new Intl.NumberFormat("ko-KR").format(value) + "원";

const styles = StyleSheet.create({
	viewer: {
		width: "100%",
		height: "90vh",
	},

	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: "NotoSansKR",
		color: "#333",
	},

	title: {
		fontSize: 34,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 20,
	},

	divider: {
		borderBottomWidth: 1,
		borderBottomColor: "#777",
		marginBottom: 25,
	},

	topArea: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
	},

	invoiceInfo: {
		width: "45%",
	},

	label: {
		fontWeight: "bold",
	},

	totalBig: {
		fontSize: 24,
		fontWeight: "bold",
	},

	table: {
		width: "100%",
		marginBottom: 25,
	},

	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#9eadc0",
		color: "#fff",
		paddingVertical: 8,
		fontWeight: "bold",
	},

	tableRow: {
		flexDirection: "row",
		paddingVertical: 9,
	},

	evenRow: {
		backgroundColor: "#eeeeee",
	},

	colNo: {
		width: "8%",
		textAlign: "center",
	},

	colDesc: {
		width: "42%",
	},

	colQty: {
		width: "15%",
		textAlign: "center",
	},

	colPrice: {
		width: "17%",
		textAlign: "right",
		paddingRight: 10,
	},

	colAmount: {
		width: "18%",
		textAlign: "right",
		paddingRight: 10,
	},

	middleArea: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},

	paymentBox: {
		width: "45%",
	},

	summaryBox: {
		width: "35%",
	},

	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},

	grandTotal: {
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: "#333",
		fontWeight: "bold",
	},

	terms: {
		marginTop: 30,
		width: "45%",
		lineHeight: 1,
	},

	signature: {
		marginTop: 10,
		alignItems: "flex-end",
	},

	signatureName: {
		fontSize: 22,
		fontFamily: "NotoSansKR",
	},

	footer: {
		position: "absolute",
		bottom: 35,
		left: 40,
		right: 40,
		flexDirection: "row",
		justifyContent: "space-between",
		borderTopWidth: 1,
		borderTopColor: "#ddd",
		paddingTop: 15,
	},

	footerBox: {
		width: "25%",
	},

	company: {
		fontSize: 14,
		fontWeight: "bold",
	},

	smallText: {
		fontSize: 8,
		lineHeight: 1.4,
	},
});

const InvoiceDocument = (props) => {
	const { loginUser, invoice, invoiceDetail, company, orderBy = "insert" } = props;

	const { b_createdDate, c_id, c_kind, c_name, details, id, invoice_kind, invoice_no } = invoice;

	const sortedList = [...invoiceDetail];
	switch (orderBy) {
		case "price_high":
			sortedList.sort((a, b) => b.invoice_price - a.invoice_price);
			break;

		case "price_low":
			sortedList.sort((a, b) => a.invoice_price - b.invoice_price);
			break;

		case "qty_many":
			sortedList.sort((a, b) => b.invoice_qty - a.invoice_qty);
			break;

		case "qty_less":
			sortedList.sort((a, b) => a.invoice_qty - b.invoice_qty);
			break;

		case "total_high":
			sortedList.sort(
				(a, b) => b.invoice_price * b.invoice_qty - a.invoice_price * a.invoice_qty,
			);
			break;

		case "total_low":
			sortedList.sort(
				(a, b) => a.invoice_price * a.invoice_qty - b.invoice_price * b.invoice_qty,
			);
			break;

		case "insert":
		default:
			break;
	}

	const invoiceItems = sortedList.map((record, index) => ({
		no: String(index + 1).padStart(2, "0"),
		desc: record.invoice_text,
		qty: record.invoice_qty,
		price: record.invoice_price,
	}));

	const subTotal = invoiceItems.reduce((sum, item) => sum + item.qty * item.price, 0);

	const taxes = subTotal / 10;
	const grandTotal = subTotal + taxes;
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>견적서</Text>
				<View style={styles.divider} />

				<View style={styles.topArea}>
					<View style={styles.invoiceInfo}>
						<Text>
							<Text style={styles.label}>견적 번호 :</Text>
							{c_id + "." + c_kind + "/" + id + "_" + invoice_no}
						</Text>
						<Text>
							<Text style={styles.label}>발행일 :</Text>
							{b_createdDate.substr(0, 10)}
						</Text>
					</View>

					<Text style={styles.totalBig}>{formatMoney(grandTotal)}</Text>
				</View>

				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={styles.colNo}>#</Text>
						<Text style={styles.colDesc}>품목</Text>
						<Text style={styles.colQty}>수량</Text>
						<Text style={styles.colPrice}>금액</Text>
						<Text style={styles.colAmount}>합계</Text>
					</View>

					{invoiceItems.map((item, index) => (
						<View
							key={item.no}
							style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : null]}>
							<Text style={styles.colNo}>{item.no}</Text>
							<Text style={styles.colDesc}>{item.desc}</Text>
							<Text style={styles.colQty}>{item.qty}</Text>
							<Text style={styles.colPrice}>{formatMoney(item.price)}</Text>
							<Text style={styles.colAmount}>
								{formatMoney(item.qty * item.price)}
							</Text>
						</View>
					))}
				</View>

				<View style={styles.middleArea}>
					<View style={styles.paymentBox}>
						<Text style={styles.label}>결제 안내</Text>
						<Text style={styles.smallText}>
							PlusHome은 결제를 책임지지 않습니다.
						</Text>
					</View>

					<View style={styles.summaryBox}>
						<View style={styles.summaryRow}>
							<Text>항목 합계</Text>
							<Text>{formatMoney(subTotal)}</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text>부과세 (10%)</Text>
							<Text>{formatMoney(taxes)}</Text>
						</View>
						<View style={[styles.summaryRow, styles.grandTotal]}>
							<Text>총 합계</Text>
							<Text>{formatMoney(grandTotal)}</Text>
						</View>
					</View>
				</View>

				<View style={styles.terms}>
					<Text style={styles.label}>유의사항</Text>
					<Text style={styles.smallText}>
						• 작업 범위 변경 시 추가 비용이 발생할 수 있습니다.{"\n"}• 결제 완료 후
						작업이 진행됩니다.{"\n"}• 환불은 서비스 진행 단계에 따라 제한될 수 있습니다.
					</Text>
				</View>

				<View style={styles.footer}>
					<View style={styles.footerBox}>
						<Text style={styles.company}>{c_name}</Text>
					</View>

					<View style={styles.footerBox}>
						<Text style={styles.label}>수신자 :</Text>
						<Text>{invoice?.name || "Jessica Jone"}</Text>
						<Text style={styles.smallText}>{invoice?.id || "Jessica Jone"}</Text>
					</View>

					<View style={styles.footerBox}>
						<Text style={styles.label}>주소 :</Text>
						<Text style={styles.smallText}>{company.c_addr}</Text>
					</View>

					<View style={styles.footerBox}>
						<Text style={styles.label}>연락처 :</Text>
						<Text style={styles.smallText}>{company.c_tel}</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
};

const ExportPDFViewPage = () => {
	const pdfData = JSON.parse(sessionStorage.getItem("exportPDFData"));

	if (!pdfData) {
		return <div>PDF 데이터가 없습니다.</div>;
	}

	const invoice = pdfData?.invoice;
	const invoiceDetail = pdfData?.invoiceDetail;
	const company = pdfData?.company;
	const orderBy = pdfData?.orderBy;
	return (
		<PDFViewer style={styles.viewer}>
			<InvoiceDocument
				invoice={invoice}
				invoiceDetail={invoiceDetail}
				company={company}
				orderBy={orderBy}
			/>
		</PDFViewer>
	);
};

export default ExportPDFViewPage;
