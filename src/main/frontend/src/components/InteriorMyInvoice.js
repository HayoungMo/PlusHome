import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMui from "./TableMui";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import InteriorBooking from "./InteriorBooking";
import TableMuiCollapse from "./TableMuiCollapse";

const InteriorMyInvoice = ({ booking }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState([]);

  const [reBooking, setReBooking] = useState(false);

    const [invoiceWithDetails, setInvoiceWithDetails] = useState([]);

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
        const result = await Promise.all(
          invoice.map(async (item) => {
            const data = await InteriorUserService.fetchInvoiceDetails(item);
  
            return {
              ...item,
              detail: Array.isArray(data) ? data : data ? [data] : [],
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

  return (
    <div>
      <p>견적서 목록</p>

      {Array.isArray(invoice) && invoice.length > 0 ? (
        <div>
          <TableMuiCollapse
            rowData={invoiceWithDetails}
            hiddenColumns={["detail", "details"]}
            collapseKey="detail"
            collapseTitle="견적 상세 내역"
            collapseColumns={["invoice_text", "invoice_qty", "invoice_price"]}
          />
          {invoice.map((invoiceItem, invoiceIdx) => (
            <div key={invoiceIdx}>
              {(booking?.b_status === "done" && invoiceItem.invoice_kind==="Y") && (
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
          ))}
        </div>
      ) : (
        <p>작성된 견적서가 없습니다.</p>
      )}
    </div>
  );
};

export default InteriorMyInvoice;
