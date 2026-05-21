import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import CouponService from "../service/couponService";
import TableMui from "./TableMui";

const CouponArticleDownload = ({ c_id, catagory }) => {
  const [couponForm, setCouponForm] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const id = localStorage.getItem("id");

  const showAlert = ({ severity, title, text }) => {
    setAlert({
      open: true,
      severity,
      title,
      text,
    });
  };

  const handleSubmit = async () => {
    if (!id) {
      showAlert({
        severity: "warning",
        title: "로그인 필요",
        text: "쿠폰 발급은 로그인 후 가능합니다.",
      });
      return;
    }

    if (!couponForm.length) {
      showAlert({
        severity: "warning",
        title: "쿠폰 없음",
        text: "발급 가능한 쿠폰이 없습니다.",
      });
      return;
    }

    const duplicateResults = await Promise.all(
      couponForm.map((item) =>
        CouponService.checkCouponDuplicate({
          coupon_code: item.coupon_code,
          id,
        }),
      ),
    );

    const newCoupons = couponForm.filter(
      (_, index) => duplicateResults[index].success,
    );

    if (!newCoupons.length) {
      showAlert({
        severity: "warning",
        title: "발급 불가",
        text: "이미 모두 발급받은 쿠폰입니다.",
      });
      return;
    }

    const insertResults = await Promise.all(
      newCoupons.map((item) => CouponService.insertCoupon({ ...item, id })),
    );
    const successCount = insertResults.filter((result) => result.success).length;

    showAlert({
      severity: successCount === newCoupons.length ? "success" : "warning",
      title: "쿠폰 발급",
      text: `${successCount}개의 쿠폰이 발급되었습니다.`,
    });
  };

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectArticleCoupon({
        c_id,
        catagory,
      });

      setCouponForm(result.data || []);
    };

    fetchCoupon();
  }, [c_id, catagory]);

  return (
    <>
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
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.text}
        </Alert>
      </Snackbar>

      <div>
        {couponForm.map((item) => (
          <div
            style={{
              width: "900px",
              border: "1px solid black",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {item.coupon_info}//
            {item.discount}//
            {item.coupon_max}//
            {item.coupon_end}//
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit}>쿠폰 모두 받기</Button>
    </>
  );
};

export default CouponArticleDownload;
