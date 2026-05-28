import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorMyInvoice from "./InteriorMyInvoice";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import "../css/UserBookingLists.css";
import {
  formatInteriorAnswerLabel,
  formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";

const UserBookingLists = ({ id }) => {
  const [booking, setBooking] = useState();
  const [selectedRow, setSelectedRow] = useState();

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorUserService.fetchBookingList(id);
      setBooking(data);
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  return (
    <div className="user-booking-layout">
      <div className="user-booking-card">
        <div className="user-booking-head">
          <div>
            <p className="user-booking-eyebrow">BOOKING</p>
            <h3>예약 내역</h3>
            <p>진행 중인 상담과 예약 상세 정보를 확인할 수 있습니다.</p>
          </div>
          <span className="user-booking-count">{booking?.length || 0}개</span>
        </div>

        <div className="user-booking-table">
          {booking?.length > 0 ? (
            <TableMuiCollapse
              rowData={booking}
              hiddenColumns={["b_answer"]}
              columns={[
                "예약자 ID",
                "신청일",
                "업체 ID",
                "업체 구분",
                "업체명",
                "상담 종류",
                "희망 기간",
                "예약일",
                "진행 상태",
                "상담 내용",
              ]}
              collapseTitle="상담 상세 정보"
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              renderCollapse={(row) => {
                let answer = {};

                try {
                  answer = row.b_answer ? JSON.parse(row.b_answer) : {};
                } catch (e) {
                  answer = {};
                }

                return (
                  <Table className="user-booking-detail-table" size="small">
                    <TableBody>
                      {Object.keys(answer).map((key) => (
                        <TableRow key={key}>
                          <TableCell>{formatInteriorAnswerLabel(key)}</TableCell>
                          <TableCell>{formatInteriorAnswerValue(answer[key])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              }}
            />
          ) : (
            <div className="user-booking-empty">예약 내역이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="user-booking-card user-booking-invoice">
        <InteriorMyInvoice booking={selectedRow} />
      </div>
    </div>
  );
};

export default UserBookingLists;
