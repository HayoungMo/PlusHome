import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import CheckboxMui from "./CheckboxMui";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import TableMui from "./TableMui";

const InteriorInvoiceAdd = ({ booking }) => {
  const [details, setDetails] = useState([{ text: "", qty: "", price: "" }]);

  const [invoice, setInvoice] = useState([]);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [kind, setKind] = useState({});

  const [reload, setReload] = useState(0);

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
      const results = [];

      for (const item of invoice) {
        const data = await InteriorService.fetchInvoiceDetails(item);

        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data) {
          results.push(data);
        }
      }
      const merged = results.flat();
      setInvoiceDetails(merged);
    };

    if (invoice.length > 0) {
      fetchInvoiceDetails();
    } else {
      setInvoiceDetails([]);
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

    await InteriorService.AddInvoice(invoiceData);

    refresh();
  };
 
  return (
    <div>
      <div>
        <p>인테리어 견적 추가</p>

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

        {(booking.b_status === "pending" || booking.b_status === "quoting") && (
          <form onSubmit={(e) => handleSubmit4(e, booking)}>
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
        {invoice.map((invoiceItem, invoiceIdx) => (
          <div key={invoiceIdx}>
            <TableMui
              rowData={invoiceDetails.filter(
                (record) =>
                  record?.invoice_no === invoiceItem?.invoice_no &&
                  record?.invoice_kind === invoiceItem?.invoice_kind,
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteriorInvoiceAdd;
