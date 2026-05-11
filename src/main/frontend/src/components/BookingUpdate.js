import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TableMui from "./TableMui";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorInvoiceAdd from "./InteriorInvoiceAdd";
import { Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import DialogMui from "./DialogMui";

const BookingUpdate = ({ company }) => {
  const [booking, setBooking] = useState([]);
  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setBooking(data);
    };
    fetchBooking();
  }, []);
    const [open1, setOpen1] = useState(false);
  
    const handleOpen1 = () => {
      setOpen1(true);
    };
  
    const handleClose1 = () => {
      setOpen1(false);
    };


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
              hiddenColumns={["b_answer"]}
              collapseTitle="상담 상세 정보"
              updateBookingRow={updateBookingRow}
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
            {booking.b_status !== "cancel" ||
              (booking.b_status !== "done" && (
                <Button onClick={() => handleOpen1()}>상담 취소</Button>
              ))}
            <DialogMui
              open={open1}
              onClose={handleClose1}
              title="취소 확인"
              text="정말 취소하시겠습니까?"
              buttons={[
                {
                  title: "취소",
                  color: "inherit",
                  onClick: handleClose1,
                },
                {
                  title: "취소",
                  color: "error",
                  variant: "contained",
                  onClick: (e) => {
                    console.log("취소 실행");
                    updateBookingRow(item, "cancel");
                    handleClose1();
                  },
                },
              ]}
            />
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
