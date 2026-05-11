import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InteriorMyInvoice from "./InteriorMyInvoice";
import TableMui from "./TableMui";
import {Table, TableBody, TableCell, TableRow } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UserBookingLists = ({ id }) => {

    const [booking, setBooking] = useState();



  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorUserService.fetchBookingList(id);
      setBooking(data);
    };
    fetchBooking();
  }, []);

  return (
    <div>
      {Array.isArray(booking) && booking.length > 0 ? (
        booking.map((item, idx) => (
          <Accordion key={idx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{item.c_name}와 상담 기록 {item.b_status}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <TableMuiCollapse
                rowData={item}
                hiddenColumns={["b_answer"]}
                collapseTitle="상담 상세 정보"
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

              <InteriorMyInvoice booking={item} />
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <p>상담 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default UserBookingLists;
