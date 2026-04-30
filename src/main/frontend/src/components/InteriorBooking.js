import React, { useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import DatePickerMui from "../components/DatePickerMui";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";

const InteriorBooking = ({company, answers}) => {
  const [data, setData] = useState({
    ...company,
    kind: "",
    long: "",
    date: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleDateChange = (newValue) => {
    setData((prev) => ({
      ...prev,
      date: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    const payload = {
      ...data,
      answers: JSON.stringify(answers),
    };
    InteriorService.AddBooking(payload);
  };
  return (
    <div style={{display:"flex"}}>
      <form onSubmit={handleSubmit}>
        <h5>인테리어 상담 신청</h5>
        <div>
          <TextFieldMui name="kind" label="kind" onChange={handleChange} />
          <TextFieldMui name="long" label="long" onChange={handleChange} />
          <DatePickerMui value={data.date} onChange={handleDateChange} />
          <TextFieldMui
            name="content"
            label="content"
            onChange={handleChange}
          />
          <Button type="submit" label="submit" variant="contained">
            제출
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InteriorBooking;
