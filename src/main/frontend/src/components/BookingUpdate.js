import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TableMui from "./TableMui";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorInvoiceAdd from "./InteriorInvoiceAdd";
import { Button } from "@mui/material";

const BookingUpdate = ({ company }) => {
  const [booking, setBooking] = useState([]);
  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setBooking(data);
    };
    fetchBooking();
  }, []);



  const updateBookingRow = async (targetRow, value) => {
    setBooking((prev) =>
      prev.map((item) =>
        item.id === targetRow.id &&
        item.c_id === targetRow.c_id &&
        item.b_createdDate === targetRow.b_createdDate
          ? {
              ...item,
              b_status: value,
            }
          : item,
      ),
    );
    await InteriorService.UpdateBooking({
      ...targetRow,
      b_status: value,
    });
  };

  return (
    <div>
      {Array.isArray(booking) && booking.length > 0 ? (
        booking.map((item, idx) => (
          <div>
            <TableMuiCollapse
              rowData={item}
              updateBookingRow={updateBookingRow}
            />
            <Button onClick={()=>updateBookingRow(item,"cancel")}>상담 취소</Button>
            <InteriorInvoiceAdd booking={item} />
          </div>
        ))
      ) : (
        <p>상담 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default BookingUpdate;
