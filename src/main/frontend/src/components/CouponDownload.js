import React, { useEffect, useRef, useState } from "react";
import CouponService from "../service/couponService";
import { useNavigate, useParams } from "react-router-dom";

const CouponDownload = () => {
  const id = localStorage.getItem("id");
  const { coupon_code } = useParams();
  const navigate = useNavigate();
  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;

    didRun.current = true;
    const handleSubmit = async (e) => {
      const result = await CouponService.selectCoupon(coupon_code);
      if (!result.success || result.data.length === 0) {
        alert("올바르지 않은 쿠폰입니다");
        return;
      }
      const result2 = await CouponService.checkCouponDuplicate({
        coupon_code,
        id: id,
      });
      if (!result2.success) {
        alert("이미 등록된 쿠폰입니다");
        return;
      }
      const result3 = await CouponService.insertCoupon({
        ...result.data,
        id: id,
      });
      if (!result3.success) {
        alert("올바르지 않은 쿠폰입니다");
        return;
      }
    };
    handleSubmit();
    navigate(-1);
  }, []);
  return <></>;
};

export default CouponDownload;
