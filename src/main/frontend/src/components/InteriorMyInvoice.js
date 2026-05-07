import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import InteriorUserService from "../service/interiorUserService";
import TableMui from "./TableMui";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const InteriorMyInvoice = ({ booking }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState([]);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

      const handleNext = (invoice) => {
        navigate("/interior/review", {
          state: { invoice },
        });
      };


  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await InteriorUserService.fetchInvoice(booking);

      const merged = Array.isArray(data) ? data.flat() : data ? [data] : [];

      setInvoice(merged);
    };

    if (booking) {
      fetchInvoices();
    }
  }, [booking]);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      const results = [];

      for (const item of invoice) {
        const data = await InteriorUserService.fetchInvoiceDetails(item);

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
  return (
    <div>
      {invoice.map((invoiceItem, invoiceIdx) => (
        <div key={invoiceIdx}>
          <TableMui
            rowData={invoiceDetails.filter(
              (record) =>
                record?.invoice_no === invoiceItem?.invoice_no &&
                record?.invoice_kind === invoiceItem?.invoice_kind,
            )}
          />
          {invoiceItem?.invoice_kind === "Y" && (
            <Button onClick={() => handleNext(invoiceItem)}>리뷰 작성</Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default InteriorMyInvoice;
