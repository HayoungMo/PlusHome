import React, { useEffect, useState } from 'react';
import InteriorService from '../service/interiorService';
import CheckboxMui from './CheckboxMui';
import TextFieldMui from './TextFieldMui';
import { Button } from '@mui/material';
import InteriorInvoiceAdd from './InteriorInvoiceAdd';
import TableMui from './TableMui';

const InteriorBookingLists = ({company}) => {
  const [booking, setBooking] = useState([]);
  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setBooking(data);
    };

    fetchBooking();
  }, []);


return (
  <div>
    <p>상담 조회 결과</p>

    {Array.isArray(booking) && booking.length > 0 ? (
      booking.map((item, idx) => (
          <div>
            <InteriorInvoiceAdd booking={item}/>
        </div>
      ))) : 
      (
      <p>상담 데이터가 없습니다.</p>
    )
}
  </div>
);
}

export default InteriorBookingLists;