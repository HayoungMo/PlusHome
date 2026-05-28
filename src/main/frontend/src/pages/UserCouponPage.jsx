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
import "../css/UserCouponPage.css";

const UserCouponPage = ({ user }) => {
  const [form, setForm] = useState({ id: user.id });
  const [coupon, setCoupon] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const [tab, setTab] = useState(1);
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponList(user.id);
      
      if (!result.success) {
        setTab([])
        return;
      }

      const couponList = result.data || []

      setCoupon(couponList)
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

  const availableCoupons = coupon.filter((item) => item.coupon_used === "N")
  const usedCoupons = coupon.filter((item) => item.coupon_used === "Y")
  
  return (
    <Box className="user-coupon-page">
      <div className="user-coupon-header">
        <div>
          <p>COUPON</p>
          <h3>쿠폰함</h3>
        </div>
        <span>{coupon.length}개</span>
      </div>

      <Tabs className="user-coupon-tabs" value={tab} onChange={handleChangeTab}>
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

      <Box className="user-coupon-content">
        {tab === 0 && (
          <form className="user-coupon-register-form">
            <TextFieldMui
              name="coupon_code"
              label="코드 등록"
              onChange={(e) => handleChange(e)}
            />
            <Button onClick={() => handleSubmit()}>등록 </Button>

            {successMessage && (
              <Box className="user-coupon-success-message">
                {successMessage}
              </Box>
            )}
          </form>
        )}

        {tab === 1 && (
          <>
            {availableCoupons.length === 0 ? (
              <Box className="user-coupon-empty">
                <Box>
                  사용 가능한 쿠폰이 없습니다.
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setTab(0)}
                >
                  쿠폰 등록하기
                </Button>
              </Box>
            ) : (
              <div className="user-coupon-table">
                <TableMui
                  rowData={availableCoupons}
                  col={[
                    "coupon_code",
                    "discount",
                    "coupon_end",
                    "coupon_max",
                    "coupon_info",
                  ]}
                />
              </div>
            )}
          </>
        )}

        {tab === 2 && (
          <>
            {usedCoupons.length === 0 ? (
              <Box className="user-coupon-empty">
                사용한 쿠폰이 없습니다.
              </Box>
            ) : (
              <div className="user-coupon-table user-coupon-table-used">
                <TableMui
                  rowData={usedCoupons}
                  col={[
                    "coupon_code",
                    "discount",
                    "coupon_used",
                    "coupon_max",
                    "coupon_info",
                  ]}
                />
              </div>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserCouponPage;
