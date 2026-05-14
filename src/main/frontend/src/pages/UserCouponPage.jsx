import React, { useEffect, useState } from "react";

import { Button } from "@mui/material";
import CouponService from "../service/couponService";
import TextFieldMui from "../components/TextFieldMui";
import TableMui from "../components/TableMui";

const UserCouponPage = ({ user }) => {
  const [form, setForm] = useState({ id: user.id });
  const [coupon, setCoupon] = useState();
  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponList(user.id);
      if (!result.success) {
        return;
      }
      setCoupon(result.data || []);
    };
    fetchCoupon();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    const result = await CouponService.selectCoupon(form.coupon_code);
    if (!result.success || result.data.length === 0) {
      alert("올바르지 않은 쿠폰입니다");
      return;
    }
    const result2 = await CouponService.checkCouponDuplicate(form);
    if (!result2.success) {
      alert("올바르지 않은 쿠폰입니다");
      return;
    }
    const result3 = await CouponService.insertCoupon({
      ...result.data,
      id: user.id,
    });
    if (!result3.success) {
      alert("올바르지 않은 쿠폰입니다");
      return;
    }
    setCoupon((prev) => [
      ...prev,
      {
        ...result.data,
        id: user.id,
      },
    ]);
  };

  return (
    <div>
      <form>
        <TextFieldMui
          name="coupon_code"
          label="코드 등록"
          onChange={(e) => handleChange(e)}
        />
        <Button onClick={() => handleSubmit()}>등록 </Button>
      </form>
      <TableMui rowData={coupon} />
    </div>
  );
};

export default UserCouponPage;
