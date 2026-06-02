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

    setAlert({
      open: true,
      severity: "success",
      title: "등록 완료",
      text: "정상적으로 쿠폰이 지급되었습니다. 쿠폰함을 확인해주세요.",
    });
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
            <div className="user-coupon-register-head">
              <p>CODE</p>
              <h4>쿠폰 코드 등록</h4>
              <span>받은 쿠폰 코드를 입력하면 내 쿠폰함에 바로 추가됩니다.</span>
            </div>
            <div className="user-coupon-register-body">
              <div className="user-coupon-code-mark">%</div>
              <div className="user-coupon-input-wrap">
                <TextFieldMui
                  name="coupon_code"
                  label="쿠폰 코드"
                  onChange={(e) => handleChange(e)}
                  width="100%"
                />
                <p>영문, 숫자, 하이픈을 포함한 코드를 그대로 입력해주세요.</p>
              </div>
              <Button
                className="user-coupon-register-button"
                variant="contained"
                color="primary"
                onClick={() => handleSubmit()}
              >
                등록
              </Button>
            </div>
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
                  columns={[
                    "쿠폰 코드",
                    "할인율",
                    "사용 기한",
                    "최대 할인 금액",
                    "쿠폰 설명",
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
                  columns={[
                    "쿠폰 코드",
                    "할인율",
                    "사용 여부",
                    "최대 할인 금액",
                    "쿠폰 설명",
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
