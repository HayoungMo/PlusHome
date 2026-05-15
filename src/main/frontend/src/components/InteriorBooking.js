import React, { useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import DatePickerMui from "../components/DatePickerMui";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";

const InteriorBooking = ({company, answers}) => {
const [alert, setAlert] = useState({
  open: false,
  severity: "info",
  title: "",
  text: "",
});
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
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
  const option = [
    {
      value: "byTel",
      title: "전화상담",
    },
    {
      value: "byKakaoTalk",
      title: "카톡",
    },
    {
      value: "byemail",
      title: "이메일",
    },
    {
      value: "byVisit",
      title: "직접방문",
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    const payload = {
      ...data,
      answers: JSON.stringify(answers),
    };
    const result = await InteriorService.AddBooking(payload);


  if (result.success) {
    setAlert({
      open: true,
      severity: "success",
      title: "등록 성공",
      text: "시공 사례가 등록되었습니다.",
    });
  } else {
    setAlert({
      open: true,
      severity: "error",
      title: `에러 (${result.status})`,
      text: result.message || "오류가 발생했습니다.",
    });
  }
  };
  return (
    <div style={{ display: "flex" }}>
      {alert.open && (
        <AlertMui
          severity={alert.severity}
          title={alert.title}
          text={alert.text}
          autoHideDuration={3000}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      )}
      <form onSubmit={handleSubmit}>
        <h5>인테리어 상담 신청</h5>
        <div>
          <SelectMui
            name="kind"
            value={data.kind}
            onChange={handleChange}
            option={option}
            required
          />
          <TextFieldMui name="long" label="long" onChange={handleChange} />
          <DatePickerMui value={data.date} onChange={handleDateChange} />
          <TextFieldMui
            name="content"
            label="content"
            onChange={handleChange}
          />
          <Button onClick={handleOpen}>제출</Button>
          <DialogMui
            open={open}
            onClose={handleClose}
            title="제출 확인"
            text="정말 제출하시겠습니까?"
            buttons={[
              {
                title: "취소",
                color: "inherit",
                onClick: handleClose,
              },
              {
                title: "제출",
                variant: "outlined",
                onClick: (e) => {
                  console.log("제출 실행");
                  handleSubmit(e);
                  handleClose();
                },
              },
            ]}
          />
        </div>
      </form>
    </div>
  );
};

export default InteriorBooking;
