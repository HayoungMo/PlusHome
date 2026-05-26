import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AiFillCar } from "react-icons/ai";

import PaymentService from "../service/paymentService";
import WalletService from "../service/walletService";
import CouponService from "../service/couponService";
import CartService from "../service/cartService";

import WalletChargeMui from "../components/WalletChargeMui";
import TextFieldMui from "../components/TextFieldMui";
import Address from "../maps/Address";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const {
    items = [],
    itemCount: stateItemCount = 0,
    productTotal = 0,
    deliveryTotal = 0,
    payTotal = 0,
  } = location.state || {};

  const defaultReceiver = {
    f_name: user.name || "",
    f_tel: user.tel || "",
    f_addr: user.addr || "",
  };

  const [addressMode, setAddressMode] = useState("default");
  const [receiver] = useState(defaultReceiver);
  const [newReceiver, setNewReceiver] = useState({
    f_name: "",
    f_tel: "",
    addr: "",
    addr1: "",
    addr2: "",
  });

  const [coupon, setCoupon] = useState([]);
  const [availablePoint, setAvailablePoint] = useState(0);
  const [usePoint, setUsePoint] = useState("");
  const [walletMoney, setWalletMoney] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [itemCouponMap, setItemCouponMap] = useState({});
  const [paySuccess, setPaySuccess] = useState(false);
  const [walletChargeOpen, setWalletChargeOpen] = useState(false);

  const [couponDialogOpen, setCouponDialogOpen] = useState(false)
  const [couponTargetItem, setCouponTargetItem] = useState(null)

  const selectedNewReceiver = {
    ...newReceiver,
    f_addr: [newReceiver.addr1, newReceiver.addr2].filter(Boolean).join("__"),
  }

  const selectedReceiver = 
    addressMode === "default" ? receiver : selectedNewReceiver;

  const getItemTotal = (item) => {
    const optionTotal = (item.options || []).reduce(
      (sum, option) => sum + Number(option.co_price || 0),
      0
    );

    return (
      (Number(item.f_price || 0) + optionTotal) *
      Number(item.f_count || 0)
    );
  };

  const itemCount =
  Number(stateItemCount || 0) ||
  items.reduce((sum, item) => sum + Number(item.f_count || 0), 0);

  const canApplyCouponToItem = (couponItem, item) => {
    const couponType = couponItem.coupon_type || "all";
    const couponCatagory = couponItem.coupon_catagory || "";

    if (couponType === "all") {
      return true;
    }

    if (!couponCatagory) {
      return false;
    }

    if (couponType === "company") {
      return couponCatagory === item.furniture?.c_id;
    }

    if (couponType === "catagory") {
      const itemCategories = [
        item.furniture?.f_catagory1,
        item.furniture?.f_catagory2,
        item.furniture?.f_catagory3,
        item.furniture?.f_catagory4,
        item.furniture?.f_catagory5,
      ].filter(Boolean);

      return itemCategories.includes(couponCatagory);
    }

    return false;
  };

  const getItemCouponDiscount = (item) => {
    const couponCode = itemCouponMap[item.c_code];

    const selectedCoupon = coupon.find(
      (couponItem) => couponItem.coupon_code === couponCode
    );

    if (!selectedCoupon) return 0;
    if (!canApplyCouponToItem(selectedCoupon, item)) return 0;

    const itemTotal = getItemTotal(item);
    const percentDiscount =
      itemTotal * (Number(selectedCoupon.discount || 0) / 100);
    const maxDiscount = Number(selectedCoupon.coupon_max || 0);

    return Math.floor(Math.min(percentDiscount, maxDiscount));
  };

  const couponDiscount = items.reduce((sum, item) => {
    return sum + getItemCouponDiscount(item);
  }, 0);

  const selectedCouponCodes = Object.values(itemCouponMap).filter(Boolean);

  const appliedPoint = Math.min(
    Number(usePoint || 0),
    Number(availablePoint || 0),
    Math.max(0, Number(payTotal || 0) - Number(couponDiscount || 0))
  );

  const finalPayTotal = Math.max(
    0,
    Number(payTotal || 0) - Number(couponDiscount || 0) - appliedPoint
  );

  const lackMoney = Math.max(0, finalPayTotal - walletMoney);
  const afterPayMoney = walletMoney - finalPayTotal;
  const canPay = walletMoney >= finalPayTotal;

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponList(user.id);

      if (!result.success) return;

      setCoupon(result.data?.filter((item) => item.coupon_used === "N") || []);
    };

    if (user.id) {
      fetchCoupon();
    }
  }, [user.id]);

  useEffect(() => {
    if (!user.id) return;

    WalletService.getMyWallet(user.id)
      .then((wallet) => {
        setWalletMoney(Number(wallet?.money || 0));
      })
      .catch((error) => {
        console.error("지갑 조회 실패", error);
        setWalletMoney(0);
      });
  }, [user.id]);

  useEffect(()=>{
    if (!location.state || !items.length) {
      alert("결제할 상품 정보가 없습니다.")
      navigate("/cart")
    }
  },[])
  
  useEffect(() => {
    CartService.getAvailablePoint()
      .then((res) => {
        setAvailablePoint(Number(res.data?.point || 0));
      })
      .catch((error) => {
        console.error("포인트 조회 실패", error);
        setAvailablePoint(0);
      });
  }, []);

  const changeNewReceiver = (evt) => {
    const { name, value } = evt.target;

    setNewReceiver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const changeUsePoint = (evt) => {
    const onlyNumber = evt.target.value.replace(/[^0-9]/g, "");
    const nextPoint = Math.min(
      Number(onlyNumber || 0),
      Number(availablePoint || 0),
      Math.max(0, Number(payTotal || 0) - Number(couponDiscount || 0))
    );

    setUsePoint(nextPoint ? String(nextPoint) : "");
  };

  const useAllPoint = () => {
    const maxPoint = Math.min(
      Number(availablePoint || 0),
      Math.max(0, Number(payTotal || 0) - Number(couponDiscount || 0))
    );

    setUsePoint(maxPoint ? String(maxPoint) : "");
  };

  const changeItemCoupon = (c_code, coupon_code) => {
    setItemCouponMap((prev) => {
      const next = { ...prev };

      if (!coupon_code) {
        delete next[c_code];
        return next;
      }

      next[c_code] = coupon_code;
      return next;
    });
  };

  const openCouponDialog = (item) => {
    setCouponTargetItem(item)
    setCouponDialogOpen(true)
  }

  const closeCouponDialog = () => {
    setCouponTargetItem(null)
    setCouponDialogOpen(false)
  }

  const selectCouponForTargetItem = (coupon_code) => {
    if (!couponTargetItem) return

    changeItemCoupon(couponTargetItem.c_code, coupon_code)
    closeCouponDialog()
  }

  const clearCouponForItem = (c_code) => {
    changeItemCoupon(c_code,"")
  }

  const onPayClick = () => {
    if (items.length === 0) {
      alert("결제할 상품이 없습니다.");
      return;
    }

    if (
      !selectedReceiver.f_name ||
      !selectedReceiver.f_tel ||
      !selectedReceiver.f_addr
    ) {
      alert("배송 정보를 입력해주세요.");
      return;
    }

    setPaySuccess(false);
    setPayMessage("");
    setModalOpen(true);
  };

  const onConfirmPay = async () => {
    if (!canPay) {
      setPayMessage("지갑 잔액이 부족합니다.");
      return;
    }

    try {
      setPaying(true);
      setPayMessage("지갑 잔액을 확인하고 있습니다.");

      await PaymentService.pay({
        c_codeList: items.map((item) => item.c_code),
        f_name: selectedReceiver.f_name,
        f_tel: selectedReceiver.f_tel,
        f_addr: selectedReceiver.f_addr,
        productTotal,
        deliveryTotal,
        couponDiscount,
        use_point: appliedPoint,
        payTotal: finalPayTotal,
        couponList: items.map((item) => ({
          c_code: item.c_code,
          coupon_code: itemCouponMap[item.c_code] || null,
          coupon_discount: getItemCouponDiscount(item),
        })),
      });

      if (selectedCouponCodes.length > 0) {
        await Promise.all(
          selectedCouponCodes.map((coupon_code) =>
            CouponService.deleteCoupon({
              id: user.id,
              coupon_code,
            })
          )
        );
      }

      setWalletMoney((prev) => prev - finalPayTotal);
      setPaySuccess(true);
      setPayMessage("결제가 완료되었습니다.");
    } catch (error) {
      console.error("결제 실패", error);

      const serverMessage = error.response?.data?.message;

      setPayMessage(
        serverMessage && serverMessage !== "No message available"
          ? serverMessage
          : "결제 처리 중 오류가 발생했습니다.\n서버 결제 API를 확인해주세요."
      );
    } finally {
      setPaying(false);
    }
  };

  const getCouponTargetText = (couponItem) => {
    const couponType = couponItem.coupon_type || "all"
    const couponCatagory = couponItem.coupon_catagory || ""
  
    if (couponType == "all"){
      return "전체 상품 적용 가능"
    }

    if (couponType === "company"){
      return `업체 적용: ${couponCatagory}`
    }

    if (couponType === "catagory"){
      return `카테고리 적용: ${couponCatagory}`
    }

    return "적용 범위 확인 필요"
  }

  return (
    
    <Box
      sx={{
        p: 3,
        maxWidth: 1180,
        mx: "auto",
        textAlign: "left",
        "& *": {
          textAlign: "left",
        },
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
        sx={{ textAlign: "center !important" }}
      >
        결제
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 280px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              배송지
            </Typography>

            <RadioGroup
              value={addressMode}
              onChange={(evt) => setAddressMode(evt.target.value)}
              sx={{ gap: 1 }}
            >
              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  px: 1.2,
                  py: 1,
                }}
              >
                <FormControlLabel
                  value="default"
                  control={<Radio size="small" />}
                  label={
                    <Typography fontSize={14} fontWeight={700}>
                      기본 배송지
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Box sx={{ pl: 3.8, mt: 0.3 }}>
                  <Typography variant="body2" color="text.secondary" fontSize={13}>
                    받는 사람: {receiver.f_name || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize={13}>
                    연락처: {receiver.f_tel || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize={13}>
                    주소: {receiver.f_addr || "-"}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  px: 1.2,
                  py: 1,
                }}
              >
                <FormControlLabel
                  value="new"
                  control={<Radio size="small" />}
                  label={
                    <Typography fontSize={14} fontWeight={700}>
                      새 배송지 입력
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                {addressMode === "new" && (
                  <Stack spacing={1} sx={{ pl: 3.8, mt: 1 }}>
                    <TextFieldMui
                      label="수령인"
                      name="f_name"
                      value={newReceiver.f_name}
                      onChange={changeNewReceiver}
                      width="100%"
                      size="small"
                    />
                    <TextFieldMui
                      label="전화번호"
                      name="f_tel"
                      value={newReceiver.f_tel}
                      onChange={changeNewReceiver}
                      width="100%"
                      size="small"
                    />
                    <Box
                      sx={{
                        border: "1px solid #eee",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Address
                        isC={false}
                        form={newReceiver}
                        setForm={setNewReceiver}
                      />

                      <TextFieldMui
                        label="상세주소"
                        name="addr2"
                        value={newReceiver.addr2 || ""}
                        onChange={changeNewReceiver}
                        width="100%"
                        size="small"
                      />
                    </Box>
                  </Stack>
                )}
              </Box>
            </RadioGroup>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              주문 상품
            </Typography>

            <Stack spacing={1}>
              {items.map((item) => {
                const itemCouponDiscount = getItemCouponDiscount(item);

                const selectedCoupon = coupon.find(
                  (couponItem) => couponItem.coupon_code ===
                  itemCouponMap[item.c_code]
                )

                return (
                  <Box
                    key={item.c_code}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      p: 1.2,
                      display: "grid",
                      gridTemplateColumns: "64px minmax(0, 1fr) auto",
                      gap: 1.2,
                      alignItems: "start",
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        item.thumbnail
                          ? `http://localhost:8080/api/images/FURNITURE/${item.thumbnail}`
                          : "/no-image.png"
                      }
                      alt={item.furniture?.f_name || item.f_code}
                      sx={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid #eee",
                      }}
                    />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} fontSize={14} lineHeight={1.4}>
                        {item.furniture?.f_name || item.f_name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" fontSize={13}>
                        업체명: {item.furniture?.c_name || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" fontSize={13}>
                        수량: {item.f_count}
                      </Typography>

                      {(item.options || []).map((option, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          color="text.secondary"
                          fontSize={13}
                        >
                          {option.co_select}: {option.co_text}
                          {Number(option.co_price) > 0
                            ? ` (+${Number(option.co_price).toLocaleString()}원)`
                            : ""}
                        </Typography>
                      ))}

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize={13}>
                        쿠폰: {selectedCoupon ? selectedCoupon.coupon_info : "선택 안 함"}
                      </Typography>

                      {itemCouponDiscount > 0 && (
                        <Typography variant="body2" color="error" fontSize={13} mt={0.5}>
                          쿠폰 할인: -{itemCouponDiscount.toLocaleString()}원
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} mt={0.8}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => openCouponDialog(item)}
                        >
                          {selectedCoupon ? "쿠폰 변경" : "쿠폰 선택"}
                        </Button>

                        {selectedCoupon && (
                          <Button
                            variant="text"
                            color="inherit"
                            size="small"
                            onClick={() => clearCouponForItem(item.c_code)}
                          >
                            해제
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    </Box>

                    <Typography
                      fontWeight={700}
                      fontSize={14}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {getItemTotal(item).toLocaleString()}원
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              포인트
            </Typography>

            <Typography variant="body2" fontSize={13} mb={1}>
              보유 포인트: {availablePoint.toLocaleString()}P
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextFieldMui
                label="사용할 포인트"
                value={usePoint}
                onChange={changeUsePoint}
                width="220px"
                size="small"
              />

              <Button variant="outlined" color="inherit" size="small" onClick={useAllPoint}>
                전액 사용
              </Button>
            </Stack>

            <Typography variant="body2" fontSize={13} mt={1} color="error">
              포인트 사용: -{appliedPoint.toLocaleString()}P
            </Typography>
          </Paper>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            position: { md: "sticky" },
            top: { md: 20 },
          }}
        >
          <Typography fontWeight={700} mb={2}>
            총 금액 ({itemCount}개)
          </Typography>

          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                상품 금액
              </Typography>
              <Typography variant="body2">
                {productTotal.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                배송비
              </Typography>
              <Typography variant="body2">
                {deliveryTotal.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                쿠폰 할인
              </Typography>
              <Typography variant="body2" color="error">
                -{couponDiscount.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                포인트 사용
              </Typography>
              <Typography variant="body2" color="error">
                -{appliedPoint.toLocaleString()}P
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700}>최종 결제 금액</Typography>
            <Typography variant="h6" fontWeight={800}>
              {finalPayTotal.toLocaleString()}원
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={0.8}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                지갑 잔액
              </Typography>
              <Typography variant="body2">
                {walletMoney.toLocaleString()}원
              </Typography>
            </Box>

            {lackMoney > 0 && (
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="error">
                  부족 금액
                </Typography>
                <Typography variant="body2" color="error">
                  {lackMoney.toLocaleString()}원
                </Typography>
              </Box>
            )}
          </Stack>

          {lackMoney > 0 && (
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              sx={{ mt: 2 }}
              onClick={() => setWalletChargeOpen(true)}
            >
              지갑 충전하기
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, textAlign: "center" }}
            onClick={onPayClick}
          >
            {itemCount}개 상품 결제하기
          </Button>
        </Paper>
      </Box>

      <Dialog
        open={modalOpen}
        onClose={() => !paying && setModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>
          {paySuccess ? "결제 완료" : "결제 확인"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.2}>
            {paySuccess && (
              <Box
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center !important",
                }}
              >
                <AiFillCar size={48} color="#1976d2" />
                <Typography
                  variant="h6"
                  fontWeight={800}
                  mt={1}
                  sx={{ textAlign: "center !important" }}
                >
                  결제가 완료되었습니다
                </Typography>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between">
              <Typography>상품금액</Typography>
              <Typography fontWeight={700}>
                {productTotal.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>배송비</Typography>
              <Typography fontWeight={700}>
                {deliveryTotal.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>쿠폰할인</Typography>
              <Typography fontWeight={700} color="error">
                -{couponDiscount.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>포인트 사용</Typography>
              <Typography fontWeight={700} color="error">
                -{appliedPoint.toLocaleString()}P
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between">
              <Typography>현재 지갑 잔액</Typography>
              <Typography fontWeight={700}>
                {walletMoney.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>결제 후 잔액</Typography>
              <Typography
                fontWeight={700}
                color={afterPayMoney < 0 ? "error" : "text.primary"}
              >
                {afterPayMoney.toLocaleString()}원
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography>최종 결제금액</Typography>
              <Typography variant="h6" fontWeight={800}>
                {finalPayTotal.toLocaleString()}원
              </Typography>
            </Box>

            {payMessage && !paySuccess && (
              <Typography
                color="error"
                sx={{ whiteSpace: "pre-line" }}
              >
                {payMessage}
              </Typography>
            )}

            {lackMoney > 0 && !paySuccess && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setWalletChargeOpen(true)}
              >
                지갑 충전하기
              </Button>
            )}

            <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
              {paySuccess ? (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate("/")}
                  >
                    쇼핑 계속하기
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/userpage?menu=orders")}
                  >
                    주문 내역 보기
                  </Button>

                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    disabled={paying}
                    onClick={() => setModalOpen(false)}
                  >
                    취소
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={paying || !canPay}
                    onClick={onConfirmPay}
                  >
                    {canPay ? "결제" : "잔액 부족"}
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={couponDialogOpen}
        onClose={closeCouponDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>쿠폰 선택</DialogTitle>

        <DialogContent>
          {couponTargetItem && (
            <Stack spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => selectCouponForTargetItem("")}
              >
                쿠폰 선택 안 함
              </Button>

              {coupon.map((couponItem) => {
                const usedByOtherItem = Object.entries(itemCouponMap).some(
                  ([c_code, coupon_code]) =>
                    c_code !== couponTargetItem.c_code &&
                    coupon_code === couponItem.coupon_code
                );

                const cannotApplyToThisItem =
                  !canApplyCouponToItem(couponItem, couponTargetItem);

                const disabled = usedByOtherItem || cannotApplyToThisItem;

                return (
                  <Button
                    key={couponItem.coupon_code}
                    variant={
                      itemCouponMap[couponTargetItem.c_code] === couponItem.coupon_code
                        ? "contained"
                        : "outlined"
                    }
                    color="inherit"
                    disabled={disabled}
                    onClick={() => selectCouponForTargetItem(couponItem.coupon_code)}
                    sx={{ justifyContent: "flex-start", py: 1.2 }}
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        {couponItem.coupon_info}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {couponItem.discount}% 할인 / 최대{" "}
                        {Number(couponItem.coupon_max || 0).toLocaleString()}원
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {getCouponTargetText(couponItem)}
                      </Typography>

                      {usedByOtherItem && (
                        <Typography variant="body2" color="error">
                          다른 상품에 이미 적용됨
                        </Typography>
                      )}

                      {cannotApplyToThisItem && (
                        <Typography variant="body2" color="error">
                          이 상품에는 적용할 수 없음
                        </Typography>
                      )}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <WalletChargeMui
        user={user}
        open={walletChargeOpen}
        onClose={() => setWalletChargeOpen(false)}
        onCharged={(updatedWallet) => {
          setWalletMoney(Number(updatedWallet?.money || 0));
          setWalletChargeOpen(false);
        }}
      />

    </Box>
  );
};

export default PaymentPage;