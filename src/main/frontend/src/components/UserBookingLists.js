import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InteriorMyInvoice from "./InteriorMyInvoice";

const UserBookingLists = ({ id }) => {

    const [booking, setBooking] = useState();



  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorUserService.fetchBookingList({ id });
      setBooking(data);
    };
    fetchBooking();
  }, []);

  return (
    <div>
      {Array.isArray(booking) && booking.length > 0 ? (
        booking.map((item, idx) => (
          <div>
            <TableMuiCollapse rowData={item} />
            <InteriorMyInvoice booking={item}/>
            
          </div>
        ))
      ) : (
        <p>상담 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default UserBookingLists;
