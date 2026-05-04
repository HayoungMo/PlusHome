// src/pages/ExportPDFViewPage.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const invoiceItems = [
  { no: "01", desc: "HELLO", qty: 1, price: 900 },
  { no: "02", desc: "DAMN", qty: 1, price: 600 },
  { no: "03", desc: "Web Design", qty: 1, price: 600 },
  { no: "04", desc: "UI/UX Design", qty: 3, price: 600 },
  { no: "05", desc: "Stationary Design", qty: 2, price: 400 },
  { no: "06", desc: "Logo Design", qty: 1, price: 300 },
];

const formatMoney = (value) => `$${value.toFixed(2)}`;

const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "90vh",
  },

  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
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
    lineHeight: 1.5,
  },

  signature: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  signatureName: {
    fontSize: 22,
    fontFamily: "Times-Italic",
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

const InvoiceDocument = ({ loginUser }) => {
  const subTotal = invoiceItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const taxes = 550;
  const discount = 250;
  const grandTotal = subTotal + taxes - discount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>INVOICE</Text>
        <View style={styles.divider} />

        <View style={styles.topArea}>
          <View style={styles.invoiceInfo}>
            <Text>
              <Text style={styles.label}>Invoice No : </Text>
              MC/4356/5235-643
            </Text>
            <Text>
              <Text style={styles.label}>Invoice Date : </Text>
              29 December 2024
            </Text>
          </View>

          <Text style={styles.totalBig}>{formatMoney(grandTotal)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colDesc}>DESCRIPTION</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>PRICE</Text>
            <Text style={styles.colAmount}>AMOUNT</Text>
          </View>

          {invoiceItems.map((item, index) => (
            <View
              key={item.no}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.evenRow : null,
              ]}
            >
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
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.smallText}>Bank Transfer</Text>
            <Text style={styles.smallText}>Pay International Bank</Text>
            <Text style={styles.smallText}>+880-1706443336</Text>
            <Text style={styles.smallText}>Paypal</Text>
            <Text style={styles.smallText}>usernamehere@paypal.com</Text>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Sub Total</Text>
              <Text>{formatMoney(subTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Taxes (10%)</Text>
              <Text>{formatMoney(taxes)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Discount</Text>
              <Text>{formatMoney(discount)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotal]}>
              <Text>GRAND TOTAL</Text>
              <Text>{formatMoney(grandTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.terms}>
          <Text style={styles.label}>Terms And Condition</Text>
          <Text style={styles.smallText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut.
          </Text>
        </View>

        <View style={styles.signature}>
          <Text style={styles.signatureName}>Shaiful</Text>
          <Text style={styles.smallText}>Shaiful Islam</Text>
          <Text style={styles.smallText}>Assistant Manager</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBox}>
            <Text style={styles.company}>YOUR</Text>
            <Text style={styles.company}>COMPANY</Text>
          </View>

          <View style={styles.footerBox}>
            <Text style={styles.label}>INVOICE TO :</Text>
            <Text>{loginUser?.name || "Jessica Jone"}</Text>
            <Text style={styles.smallText}>General Manager</Text>
          </View>

          <View style={styles.footerBox}>
            <Text style={styles.label}>Address :</Text>
            <Text style={styles.smallText}>15386 Pooh Bear Lane</Text>
            <Text style={styles.smallText}>Spartanburg, Carolina</Text>
            <Text style={styles.smallText}>59275</Text>
          </View>

          <View style={styles.footerBox}>
            <Text style={styles.label}>Contact :</Text>
            <Text style={styles.smallText}>+880-1706443336</Text>
            <Text style={styles.smallText}>molly@example.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const ExportPDFViewPage = ({ loginUser }) => {
  return (
    <PDFViewer style={styles.viewer}>
      <InvoiceDocument loginUser={loginUser} />
    </PDFViewer>
  );
};

export default ExportPDFViewPage;