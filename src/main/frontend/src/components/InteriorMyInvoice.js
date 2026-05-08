import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMui from "./TableMui";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import InteriorBooking from "./InteriorBooking";

const InteriorMyInvoice = ({ booking }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState([]);

  const [reBooking, setReBooking] = useState(false);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const handleNext = (invoice) => {
    navigate("/interior/review", {
      state: { invoice },
    });
  };

  const BookingAgain = () => {
    setReBooking(!reBooking);
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
      <p>견적서 목록</p>
      {Array.isArray(invoice) && invoice.length > 0 ? (
        invoice.map((invoiceItem, invoiceIdx) => (
          <div key={invoiceIdx}>
            <TableMui
              rowData={invoiceDetails.filter(
                (record) =>
                  record?.invoice_no === invoiceItem?.invoice_no &&
                  record?.invoice_kind === invoiceItem?.invoice_kind,
              )}
            />
            {invoiceItem?.invoice_kind === "Y" && (
              <div>
                <Button onClick={() => handleNext(invoiceItem)}>
                  리뷰 작성
                </Button>
                <Button onClick={() => BookingAgain()}>
                  {reBooking ? "취소" : "재상담 신청"}
                </Button>
                {reBooking && (
                  <InteriorBooking
                    company={{
                      c_id: booking.c_id,
                      c_kind: booking.c_kind,
                      c_name: booking.c_name,
                    }}
                    answers={JSON.parse(booking.b_answer)}
                  />
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>작성된 견적서가 없습니다.</p>
      )}
    </div>
  );
};

export default InteriorMyInvoice;
