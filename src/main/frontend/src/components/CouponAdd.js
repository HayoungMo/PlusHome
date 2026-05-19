import React, { useState } from "react";
import CouponService from "../service/couponService";
import AlertMui from "./AlertMui";
import TextFieldMui from "./TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import NumberField from "./NumberFieldMui";
import DatePickerMui from "./DatePickerMui";

const CouponAdd = () => {
  //쿠폰 발급 페이지
  const id = localStorage.getItem("id");
  const [form, setForm] = useState({ id: id }); 
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });
  const handleSubmit = async (e) => {
    const result = await CouponService.insertCouponDev(form);

    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
    }
  };
  return (
    <div>
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
      <form name="coupon">
        <NumberField
          name="discount"
          label="할인률"
          min={0}
          max={100}
          onValueChange={(value) => handleChange(makeEvent("discount", value))}
        />
        <NumberField
          name="coupon_max"
          label="최대 할인 금액"
          min={0}
          onValueChange={(value) =>
            handleChange(makeEvent("coupon_max", value))
          }
        />
        <DatePickerMui
          name="coupon_end"
          label="유효 기간"
          value={form.coupon_end}
          onChange={(value) =>
            handleChange(makeEvent("coupon_end", value.format("YYYY-MM-DD")))
          }
        />
        <TextFieldMui
          name="coupon_info"
          label="쿠폰 정보"
          onChange={handleChange}
        />
        <Button onClick={(e) => handleSubmit(e)}>발급</Button>
      </form>
    </div>
  );
};

export default CouponAdd;
