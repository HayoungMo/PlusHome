import React, { useEffect, useState } from "react";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Snackbar,
  Tab,
  Tabs,
} from "@mui/material";
import CouponService from "../service/couponService";
import TextFieldMui from "../components/TextFieldMui";
import TableMui from "../components/TableMui";

const UserCouponPage = ({ user }) => {
  const [form, setForm] = useState({ id: user.id });
  const [coupon, setCoupon] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const [tab, setTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponList(user.id);
      
      if (!result.success) {
        setTab(0)
        return;
      }

      const couponList = result.data || []
      const availableCoupons = couponList.filter(
        (item)=> item.coupon_used === "N")

      setCoupon(couponList);
      setTab(availableCoupons.length> 0 ? 1 : 0)
    };
    fetchCoupon();
  }, []);
  

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const handleChange = (e) => {
    setSuccessMessage("")

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    const result = await CouponService.selectCoupon(form.coupon_code);
    if (!result.success || result.data.length === 0) {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
      return;
    }
    const result2 = await CouponService.checkCouponDuplicate(form);
    if (!result2.success) {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
      return;
    }
    const result3 = await CouponService.insertCoupon({
      ...result.data,
      id: user.id,
    });
    if (!result3.success) {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
      return;
    }
    setCoupon((prev) => [
      ...prev,
      {
        ...result.data,
        id: user.id,
      },
    ]);

    setSuccessMessage("정상적으로 쿠폰이 지급되었습니다. 쿠폰함을 확인해주세요.")
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleChangeTab}>
        <Tab label="쿠폰 등록" />
        <Tab label="사용 가능 쿠폰" />
        <Tab label="이미 사용한 쿠폰" />
      </Tabs>

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

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <form>
            <TextFieldMui
              name="coupon_code"
              label="코드 등록"
              onChange={(e) => handleChange(e)}
            />
            <Button onClick={() => handleSubmit()}>등록 </Button>

            {successMessage && (
              <Box
                sx={{
                  mt: 1,
                  color: "#1976d2",
                  fontSize: 14,
                  fontWeight: 600,
                  borderBottom: "2px solid #1976d2",
                  display: "inline-block",
                  pb: 0.3,
                }}
              >
                {successMessage}
              </Box>
            )}

          </form>
        )}

        {tab === 1 && (
          <TableMui
            rowData={coupon.filter((item) => item.coupon_used === "N")}
          />
        )}

        {tab === 2 && (
          <TableMui
            rowData={coupon.filter((item) => item.coupon_used === "Y")}
          />
        )}
      </Box>
    </Box>
  );
};

export default UserCouponPage;
