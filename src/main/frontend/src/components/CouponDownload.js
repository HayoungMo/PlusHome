import React, { useState } from "react";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CouponService from "../service/couponService";

const CouponDownload = ({
  coupon = null,
  buttonText = "쿠폰 받기",
  className = "",
}) => {
  const { coupon_code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });
  const localUserData = localStorage.getItem("user");
  const userData = JSON.parse(localUserData || "{}");
  const { id } = userData;

  const showAlert = ({ severity, title, text }) => {
    setAlert({
      open: true,
      severity,
      title,
      text,
    });
  };

  const handleDownload = async () => {
    if (!id) {
      showAlert({
        severity: "warning",
        title: "로그인 필요",
        text: "쿠폰 발급은 로그인 후 가능합니다.",
      });
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    try {
      setLoading(true);

      const couponResult = coupon ? { success: true, data: coupon } : await CouponService.selectCoupon(coupon_code);
      const couponData = couponResult.data;

      if (!couponResult.success || !couponData) {
        showAlert({
          severity: "error",
          title: "발급 실패",
          text: "올바르지 않은 쿠폰입니다.",
        });
        return;
      }

      const duplicate = await CouponService.checkCouponDuplicate({
        coupon_code: couponData.coupon_code,
        id,
      });

      if (!duplicate.success) {
        showAlert({
          severity: "warning",
          title: "발급 불가",
          text: "이미 등록된 쿠폰입니다.",
        });
        return;
      }

      const insert = await CouponService.insertCoupon({
        ...couponData,
        id,
      });

      if (!insert.success) {
        showAlert({
          severity: "error",
          title: "발급 실패",
          text: "쿠폰 발급에 실패했습니다.",
        });
        return;
      }

      showAlert({
        severity: "success",
        title: "발급 완료",
        text: "쿠폰이 발급되었습니다.",
      });
    } catch (err) {
      console.error(err);
      showAlert({
        severity: "error",
        title: "오류",
        text: "쿠폰 발급 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        className={className}
        variant="contained"
        disabled={loading}
        onClick={handleDownload}
      >
        {loading ? "발급 중..." : buttonText}
      </Button>
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
    </>
  );
};

export default CouponDownload;
