import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorMyInvoice from "./InteriorMyInvoice";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

const UserBookingLists = ({ id }) => {
  const [booking, setBooking] = useState();
  const [selectedRow, setSelectedRow] = useState();

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorUserService.fetchBookingList(id);
      setBooking(data);
    };
    fetchBooking();
  }, []);

  return (
    <div>
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
      <InteriorMyInvoice booking={selectedRow} />
    </div>
  );
};

export default UserBookingLists;
