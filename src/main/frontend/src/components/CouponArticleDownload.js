import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CouponService from "../service/couponService";
import GetImgDir from "../resources/function/GetImgDir";
import "../css/CouponArticleDownload.css";

const CouponArticleDownload = ({ c_id, catagory }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [couponForm, setCouponForm] = useState([]);
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

  const getCouponLogo = (coupon) => {
    return coupon.logo?.result?.find((item) => item.img_tag === "LOGO")
      ?.img_name;
  };

  const isCouponExpired = (coupon) => {
    if (!coupon?.coupon_end) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(coupon.coupon_end);
    if (Number.isNaN(endDate.getTime())) return false;

    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const availableCoupons = couponForm.filter((coupon) => !isCouponExpired(coupon));

  const handleSubmit = async () => {
    if (!id) {
      const redirectPath = encodeURIComponent(`${location.pathname}${location.search}`);
      setTimeout(() => navigate(`/login?redirect=${redirectPath}`), 1200);

      showAlert({
        severity: "warning",
        title: "로그인 필요",
        text: "쿠폰 발급은 로그인 후 가능합니다.",
      });
      return;
    }

    if (!availableCoupons.length) {
      showAlert({
        severity: "warning",
        title: "쿠폰 없음",
        text: "발급 가능한 쿠폰이 없습니다.",
      });
      return;
    }

    const duplicateResults = await Promise.all(
      availableCoupons.map((item) =>
        CouponService.checkCouponDuplicate({
          coupon_code: item.coupon_code,
          id,
        }),
      ),
    );

    const newCoupons = availableCoupons.filter(
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

      const couponList = Array.isArray(result.data) ? result.data : [];
      const listWithImages = await Promise.all(
        couponList.map(async (item) => {
          const categoryParts = (item.coupon_catagory || catagory || "").split(
            "_",
          );
          const logo = await GetImgDir({
            kind: "LOGO",
            returnType: "list",
            a: categoryParts[0] || item.c_id || c_id,
            b: categoryParts[1] || item.c_kind || catagory,
            c: categoryParts[2] || item.c_name,
            d: "Logo",
            view: false,
          });

          return {
            ...item,
            logo: logo?.result?.length ? logo : null,
          };
        }),
      );

      setCouponForm(listWithImages);
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

      <section className="coupon-article-download">
        <div className="coupon-article-download-header">
          <div>
            <p className="coupon-article-download-eyebrow">COUPON</p>
            <h3>받을 수 있는 쿠폰</h3>
          </div>
          <span>{couponForm.length}개</span>
        </div>

        {couponForm.length > 0 ? (
          <div className="coupon-article-download-list">
            {couponForm.map((item) => (
              <article
                className={`coupon-article-download-card coupon-article-download-card-has-logo ${isCouponExpired(item) ? "coupon-article-download-card-expired" : "coupon-article-download-card-available"}`}
                key={item.coupon_code}
              >
                <div className="coupon-article-download-badge">할인</div>

                <div className="coupon-event-download-logo">
                  {getCouponLogo(item) ? (
                    <img src={getCouponLogo(item)} alt="" />
                  ) : (
                    <span>COUPON</span>
                  )}
                </div>

                <div className="coupon-article-download-main">
                  <strong>{item.discount}%</strong>
                  <p>{item.coupon_info}</p>
                </div>

                <dl className="coupon-article-download-meta">
                  <div>
                    <dt>최대 할인 금액</dt>
                    <dd>{item.coupon_max || "-"}</dd>
                  </div>
                  <div>
                    <dt>사용 기한</dt>
                    <dd>{item.coupon_end || "상시"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="coupon-article-download-empty">
            발급 가능한 쿠폰이 없습니다.
          </div>
        )}

        <Button
          className="coupon-article-download-button"
          variant="contained"
          disabled={!availableCoupons.length}
          onClick={handleSubmit}
        >
          쿠폰 모두 받기
        </Button>
      </section>
    </>
  );
};

export default CouponArticleDownload;
