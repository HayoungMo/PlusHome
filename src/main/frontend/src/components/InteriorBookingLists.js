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


  const normalizeAnswers = (answers) => {
    if (!answers) return []; // ⭐ 추가

    let parsedAnswers;
    try {
      parsedAnswers =
        typeof answers === "string" ? JSON.parse(answers) : answers;
    } catch (e) {
      return []; // JSON 깨져도 안전하게
    }

    return Object.entries(parsedAnswers || {}).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => ({
          tag: key,
          value: v,
        }));
      }

      return {
        tag: key,
        value: value ?? "", // ⭐ null 방지
      };
    });
  };
return (
  <div>
    <p>상담 조회 결과</p>

    {Array.isArray(booking) && booking.length > 0 ? (
      booking.map((item, idx) => (
          <div>
            <p>{item.b_content}</p>
            <p>{item.b_createdDate}</p>

            <TableMui rowData = {normalizeAnswers(item?.b_answer)}   />
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