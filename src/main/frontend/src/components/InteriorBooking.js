import React, { useEffect, useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import DatePickerMui from "../components/DatePickerMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import InteriorService from "../service/interiorService";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";
import "../css/InteriorBooking.css";

const InteriorBooking = ({
  company,
  answers,
  setBookingPossible,
  onCancel,
  onSuccess,
}) => {
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });
  const [open, setOpen] = useState(false);
  const localUserData = localStorage.getItem("user");
  const userData = JSON.parse(localUserData);
  const {
    addr,
    birth,
    code,
    email,
    gender,
    id,
    name,
    tel,
    type,
    companyList = [],
  } = userData;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!id || !token) {
      setAlert({
        open: true,
        severity: "error",
        title: `에러`,
        text: "로그인이 필요한 서비스입니다.",
      });
      setBookingPossible?.(false);
    }
  }, []);

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
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    const payload = {
      ...data,
      id : id,
      answers: JSON.stringify(answers),
    };
    const result = await InteriorService.AddBooking(payload);

    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "상담이 등록되었습니다.",
      });
      setTimeout(() => {
        setBookingPossible?.(false);
        onSuccess?.(result.data);
      }, 1000);
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러`,
        text: result.message || "오류가 발생했습니다.",
      });
    }
  };
  return (
    <div className="interior-booking-form">
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() =>
          setAlert((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
          sx={{
            width: "400px",
            fontSize: "1rem",
            padding: "16px 20px",
            alignItems: "center",
          }}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.text}
        </Alert>
      </Snackbar>
      <form className="interior-booking-head" onSubmit={handleSubmit}>
        <div>
          <p className="interior-booking-eyebrow">BOOKING</p>
          <h3>상담 예약</h3>
          <p>
            희망하는 상담 방식과 일정을 남겨주시면 업체가 예약 내용을
            확인합니다.
          </p>
        </div>
        <div className="interior-booking-fields">
          <SelectMui
            label="상담 방식"
            name="kind"
            value={data.kind}
            onChange={handleChange}
            option={option}
            required
            width="100%"
          />
          <TextFieldMui
            name="long"
            label="희망 기간"
            onChange={handleChange}
            width="100%"
          />
          <DatePickerMui
            value={data.date}
            onChange={handleDateChange}
            sx={{ width: "100%" }}
          />
          <TextFieldMui
            name="content"
            label="상담 내용"
            onChange={handleChange}
            width="100%"
            multiline
            minRows={4}
          />
          <div className="interior-booking-actions">
            {onCancel && (
              <Button variant="outlined" color="inherit" onClick={onCancel}>
                취소
              </Button>
            )}
            <Button variant="contained" color="primary" onClick={handleOpen}>
              제출
            </Button>
          </div>
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
