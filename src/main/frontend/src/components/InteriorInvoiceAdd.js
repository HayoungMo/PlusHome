import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import CheckboxMui from "./CheckboxMui";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import TableMui from "./TableMui";
import TableMuiCollapse from "./TableMuiCollapse";
import AlertMui from "./AlertMui";

const InteriorInvoiceAdd = ({ booking }) => {
  const [details, setDetails] = useState([{ text: "", qty: "", price: "" }]);

  const [invoice, setInvoice] = useState([]);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [invoiceWithDetails, setInvoiceWithDetails] = useState([]);

  const [kind, setKind] = useState({});

  const [reload, setReload] = useState(0);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const refresh = () => {
    setReload((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await InteriorService.fetchInvoice(booking);

      const merged = Array.isArray(data) ? data.flat() : data ? [data] : [];

      setInvoice(merged);
    };

    if (booking) {
      fetchInvoices();
    }
  }, [booking, reload]);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      const result = await Promise.all(
        invoice.map(async (item) => {
          const data = await InteriorService.fetchInvoiceDetails(item);

          const details = Array.isArray(data) ? data : data ? [data] : [];

          const mappedDetails = details.map((detail) => {
            const qty = Number(detail.invoice_qty || 0);
            const price = Number(detail.invoice_price || 0);

            return {
              ...detail,
              line_total: qty * price,
            };
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

      setInvoiceWithDetails(result);
    };

    if (Array.isArray(invoice) && invoice.length > 0) {
      fetchInvoiceDetails();
    } else {
      setInvoiceWithDetails([]);
    }
  }, [invoice]);

  useEffect(() => {
    const latestNo = getNextInvoiceNo() - 1;

    if (!latestNo) return;

    const latestDetails = invoiceDetails.filter(
      (item) => latestNo == item.invoice_no,
    );

    if (latestDetails && latestDetails.length > 0) {
      setDetails(
        latestDetails.map((d) => ({
          text: d.invoice_text,
          qty: d.invoice_qty,
          price: d.invoice_price,
        })),
      );
    }
  }, [invoiceDetails]);

  const addDetail = () => {
    setDetails([...details, { text: "", qty: "", price: "" }]);
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;

    const newDetails = [...details];
    newDetails[index] = {
      ...newDetails[index],
      [name]: value,
    };

    setDetails(newDetails);
  };

  const getNextInvoiceNo = () => {
    if (!invoice || invoice.length === 0) {
      return 1;
    }

    const maxNo = Math.max(...invoice.map((inv) => Number(inv?.invoice_no)));

    return maxNo + 1;
  };

  const handleSubmit4 = async (e, item) => {
    e.preventDefault();
    const nextInvoiceNo = getNextInvoiceNo();

    const invoiceData = {
      id: item.id,
      invoice_no: nextInvoiceNo,
      invoice_kind: kind[item.b_createdDate] || "N",
      c_id: item.c_id,
      c_kind: item.c_kind,
      c_name: item.c_name,
      b_createdDate: item.b_createdDate,
      details: details.map((detail) => ({
        invoice_text: detail.text,
        invoice_qty: Number(detail.qty),
        invoice_price: Number(detail.price),
      })),
    };

    console.log("invoiceData:", invoiceData);

    const result = await InteriorService.AddInvoice(invoiceData);
    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result.status})`,
        text: result.message || "오류가 발생했습니다.",
      });
    }
    refresh();
  };

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

        <TableMuiCollapse
          rowData={invoiceWithDetails}
          hiddenColumns={["detail", "details"]}
          collapseKey="detail"
          collapseTitle="견적 상세 내역"
          collapseColumns={["invoice_text", "invoice_qty", "invoice_price"]}
        />

        {(booking.b_status === "pending" || booking.b_status === "quoting") && (
          <form onSubmit={(e) => handleSubmit4(e, booking)}>
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
            {details.map((detail, index) => (
              <div key={index}>
                <TextFieldMui
                  name="text"
                  label="항목"
                  value={detail.text}
                  onChange={(e) => handleDetailChange(index, e)}
                />

                <TextFieldMui
                  name="qty"
                  label="개수"
                  value={detail.qty}
                  onChange={(e) => handleDetailChange(index, e)}
                />

                <TextFieldMui
                  name="price"
                  label="가격"
                  value={detail.price}
                  onChange={(e) => handleDetailChange(index, e)}
                />
              </div>
            ))}

            <Button type="button" onClick={addDetail}>
              항목 추가
            </Button>

            <Button type="submit" variant="contained">
              견적서 제출
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InteriorInvoiceAdd;
