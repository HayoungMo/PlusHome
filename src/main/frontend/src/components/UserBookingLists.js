import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorMyInvoice from "./InteriorMyInvoice";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import "../css/UserBookingLists.css";

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
            <h3>예약 내역</h3>
            <p>진행 중인 상담과 예약 상세 정보를 확인할 수 있습니다.</p>
          </div>
        </div>

        <div className="user-booking-table">
          <TableMuiCollapse
            rowData={booking}
            hiddenColumns={["b_answer"]}
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
                <Table size="small">
                  <TableBody>
                    {Object.keys(answer).map((key) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          {Array.isArray(answer[key])
                            ? answer[key].join(", ")
                            : answer[key]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            }}
          />
        </div>
      </div>

      <div className="user-booking-card user-booking-invoice">
        <InteriorMyInvoice booking={selectedRow} />
      </div>
    </div>
  );
};

export default UserBookingLists;
