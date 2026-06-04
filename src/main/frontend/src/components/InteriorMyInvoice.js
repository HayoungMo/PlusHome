import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import InteriorBooking from "./InteriorBooking";
import TableMuiCollapse from "./TableMuiCollapse";
import DialogInside from "./DialogInside";
import InteriorService from "../service/interiorService";

const InteriorMyInvoice = ({ booking }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState([]);

  const [reBooking, setReBooking] = useState(false);

  const [invoiceWithDetails, setInvoiceWithDetails] = useState([]);

  const finalInvoice = [...invoiceWithDetails]
    .reverse()
    .find((invoiceItem) => invoiceItem?.invoice_kind === "Y");

  const handleNext = (invoice) => {
    navigate("/interior/review", {
      state: { invoice },
    });
  };

  const BookingAgain = () => {
    setReBooking(!reBooking);
  };

  const makePdfData = async (data) => {
    if (!data) return;

    try {
      const company = await InteriorService.fetchCompany(data);

      const pdfData = {
        invoice: data,
        invoiceDetail: data.detail ?? [],
        company: company,
        orderBy: "insert",
      };

      console.log("pdfData:", pdfData);

      sessionStorage.setItem("exportPDFData", JSON.stringify(pdfData));

      window.open("/ExportPDFViewPage", "_blank", "width=1200,height=900");
    } catch (err) {
      console.error("PDF 데이터 생성 실패:", err);
    }
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
    <div className="user-invoice-panel">
      <div className="user-invoice-head">
        <p className="user-invoice-eyebrow">INVOICE</p>
        <h4>견적서 목록</h4>
      </div>

      {Array.isArray(invoice) && invoice.length > 0 ? (
        <div className="user-invoice-content">
          <TableMuiCollapse
            rowData={invoiceWithDetails}
            hiddenColumns={[
              "detail",
              "details",
              "c_id",
              "c_kind",
              "c_boss",
              "c_info",
              "name",
              "id",
            ]}
            columns={["업체명", "상담 신청일", "견적서 순서", "완료 여부"]}
            collapseKey="detail"
            collapseTitle="견적 상세 내역"
            collapseColumns={["invoice_text", "invoice_qty", "invoice_price"]}
            collapseColumnLabels={["항목", "수량", "금액"]}
          />
          {finalInvoice && (
            <div className="user-invoice-actions">
              <Button
                variant="contained"
                color="primary"
                onClick={() => makePdfData(finalInvoice)}
              >
                pdf뽑기
              </Button>

              {booking?.b_status === "done" && (
                <div className="user-invoice-done-actions">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleNext(finalInvoice)}
                  >
                    리뷰 작성
                  </Button>

                  <Button
                    variant="contained"
                    color={reBooking ? "inherit" : "primary"}
                    onClick={() => BookingAgain()}
                  >
                    {reBooking ? "취소" : "재상담 신청"}
                  </Button>

                  {reBooking && (
                    <DialogInside
                      open={reBooking}
                      onClose={() => setReBooking(false)}
                    >
                      <InteriorBooking
                        company={{
                          c_id: booking.c_id,
                          c_kind: booking.c_kind,
                          c_name: booking.c_name,
                        }}
                        answers={JSON.parse(booking.b_answer)}
                      />
                    </DialogInside>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>선택된 견적서가 없습니다.</p>
      )}
    </div>
  );
};

export default InteriorMyInvoice;
