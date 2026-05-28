import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui"
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import OptionsService from "../service/optionService";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";
import PaymentService from "../service/paymentService";
import Loading from "../components/Loading";

const FREE_DELIVERY_LIMIT = 50000;
const OPTION_LABEL_WIDTH = 52;
const OPTION_CONTROL_WIDTH = 210;

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [selectedOptionMap, setSelectedOptionMap] = useState({});
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({
    open: false, 
    severity: "info",
    title: "",
    text: "",
  })
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    text: "",
    onConfirm: null
  })

  const showAlert = ({severity = "info", title = "", text= ""})=>{
    setAlert({
      open: true,
      severity,
      title,
      text,
    })
  }

  const closeAlert = () => {
    setAlert((prev) => ({
      ...prev,
      open: false, 
    }))
  }

  const openConfirmDialog = ({ title, text, onConfirm }) => {
    setConfirmDialog({
      open: true,
      title,
      text,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({
      ...prev,
      open: false,
      onConfirm: null,
    }));
  };

  const runConfirmDialog = async () => {
    const confirmAction = confirmDialog.onConfirm;

    closeConfirmDialog();

    if (confirmAction) {
      await confirmAction();
    }
  };

  const allSelected =
    cart.length > 0 && cart.every((item) => selectedMap[item.c_code]);

  useEffect(() => {
    loadCart();
  }, []);

  const getOptionGroups = (options) => {
    return (options || []).reduce((groups, option) => {
      const key = (option.o_select || "").trim();

      if (!key) return groups;

      if (!groups[key]) groups[key] = [];

      groups[key].push({
        ...option,
        o_select: key,
        o_text: (option.o_text || "").trim(),
      });

      return groups;
    }, {});
  };

  const loadCart = async ( showLoading = true ) => {
    try {
      if(showLoading){
        setLoading(true)
      }
      
      const res = await CartService.getMyCart();
      const cartList = res.data || [];

      const nextOptionMap = {};

      const cartWithDetail = await Promise.all(
        cartList.map(async (item) => {
        const optionRes = await CartService.getCartOptions(item.c_code);
        const furnitureRes = await FurnitureService.getFurnitureItem(
          item.f_code
        );

        const cartOptions = optionRes.data || [];

        const originalOptionRes =
          await OptionsService.getFurnitureOptions(item.f_code);

        const originalOptions = originalOptionRes.data || [];

        if (originalOptions.length > 0) {
          nextOptionMap[item.c_code] = {};

          cartOptions.forEach((cartOption) => {
            const matchedOption = originalOptions.find(
              (option) =>
                option.o_select === cartOption.co_select &&
                option.o_text === cartOption.co_text
            );

            if (matchedOption) {
              nextOptionMap[item.c_code][matchedOption.o_select] =
                matchedOption.o_code;
            }
          });
        }

        const furniture = furnitureRes || {};
        const thumbnail = furniture.imageList?.find(
          (img) => img.img_tag === "THUMBNAIL"
        );

        return {
          ...item,
          options: cartOptions,
          originalOptions,
          furniture,
          thumbnail: thumbnail?.img_name || null,
        };
      })
      );

      const mergedCart = cartWithDetail;

      const mergedSelected = {};
      mergedCart.forEach((item) => {
        mergedSelected[item.c_code] = true;
      });

      setCart(mergedCart);
      setSelectedMap(mergedSelected);
      setSelectedOptionMap(nextOptionMap);
    } catch (error) {
      console.error("장바구니 조회 실패", error);
      showAlert({
        severity: "error",
        title:"조회 실패",
        text: "장바구니 조회에 실패했습니다.",
      })
    } finally {
      if(showLoading){
        setLoading(false)
      }
    }
  };

  const feedback = (
    <>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div>
          <AlertMui
            severity={alert.severity}
            title={alert.title}
            text={alert.text}
            onClose={closeAlert}
          />
        </div>
      </Snackbar>

      <DialogMui
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        title={confirmDialog.title}
        text={confirmDialog.text}
        buttons={[
          {
            title: "취소",
            color: "inherit",
            variant: "outlined",
            onClick: closeConfirmDialog,
          },
          {
            title: "삭제",
            color: "error",
            variant: "contained",
            onClick: runConfirmDialog,
          },
        ]}
      />
    </>
  );

  if (loading) {
    return (
      <>
        {feedback}
        <Loading message="장바구니 정보를 불러오는 중입니다." />
      </>
    )
  }

  const getGroupedCart = () => {
    const groups = {};

    cart.forEach((item) => {
      const companyKey =
        item.furniture?.c_id || item.furniture?.c_name || "unknown";

      if (!groups[companyKey]) {
        groups[companyKey] = {
          companyKey,
          companyName: item.furniture?.c_name || "업체",
          items: [],
        };
      }

      groups[companyKey].items.push(item);
    });

    return Object.values(groups);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedMap({});
      return;
    }

    const next = {};
    cart.forEach((item) => {
      next[item.c_code] = true;
    });

    setSelectedMap(next);
  };

  const toggleCompany = (items) => {
    const checked = items.every((item) => selectedMap[item.c_code]);

    setSelectedMap((prev) => {
      const next = { ...prev };

      items.forEach((item) => {
        if (checked) {
          delete next[item.c_code];
        } else {
          next[item.c_code] = true;
        }
      });

      return next;
    });
  };

  const toggleSelect = (c_code) => {
    setSelectedMap((prev) => ({
      ...prev,
      [c_code]: !prev[c_code],
    }));
  };

  const selectedItems = cart.filter((item) => selectedMap[item.c_code]);


  const getOptionPrice = (item) => {
    return (item.options || []).reduce(
      (sum, option) => sum + Number(option.co_price || 0),
      0
    );
  };

  const getItemProductPrice = (item) => {
    return (
      (Number(item.f_price || 0) + getOptionPrice(item)) *
      Number(item.f_count || 0)
    );
  };

  const getItemDeliveryBase = (item) => {
    return Number(
      item.furniture?.f_deliveryPrice ?? item.furniture?.f_deliveryprice ?? 0
    );
  };

  const getCompanyDeliveryFee = (items) => {
    const productTotal = items.reduce(
      (sum, item) => sum + getItemProductPrice(item),
      0
    );

    if (productTotal >= FREE_DELIVERY_LIMIT) return 0;

    return items.reduce((max, item) => {
      return Math.max(max, getItemDeliveryBase(item));
    }, 0);
  };

  const getItemsCount = (items) => {
    return items.reduce((sum,item) => sum + Number(item.f_count || 0), 0)
  }

  const getItemsProductTotal = (items) => {
    return items.reduce((sum, item) => sum + getItemProductPrice(item),0)
  }

  const getItemsDeliveryTotal = (items) => {
    const groups = {};

    items.forEach((item) => {
      const companyKey =
        item.furniture?.c_id || item.furniture?.c_name || "unknown";

      if (!groups[companyKey]) groups[companyKey] = [];

      groups[companyKey].push(item);
    });

    return Object.values(groups).reduce(
      (sum, companyItems) => sum + getCompanyDeliveryFee(companyItems),
      0
    );
  };

  const selectedItemCount = getItemsCount(selectedItems);

  const selectedProductTotal = getItemsProductTotal(selectedItems);

  const selectedDeliveryTotal = getItemsDeliveryTotal(selectedItems);

  const selectedPayTotal = selectedProductTotal + selectedDeliveryTotal;

  const changeSelectedOption = (c_code, groupName, o_code) => {
    setSelectedOptionMap((prev) => ({
      ...prev,
      [c_code]: {
        ...(prev[c_code] || {}),
        [groupName]: o_code,
      },
    }));
  };

  const changeCartCount = async (item, nextCount) => {
    if (nextCount < 1) return;

    try {
      await CartService.updateCartCount({
        c_code: item.c_code,
        f_count: nextCount,
      });

      setCart((prev) =>
        prev.map((cartItem) =>
          cartItem.c_code === item.c_code
            ? { ...cartItem, f_count: nextCount }
            : cartItem
        )
      );
    } catch (error) {
      console.error("수량 변경 실패", error);
      showAlert({
        severity: "error",
        title: "변경 실패",
        text: "수량 변경에 실패했습니다.",
      });
    }
  };

  const onUpdateCartOption = async (item) => {
    const optionGroups = getOptionGroups(item.originalOptions || []);
    const requiredGroupNames = Object.entries(optionGroups)
      .filter(([, groupOptions]) =>
        groupOptions.some((option) => option.o_important === "Y")
      )
      .map(([groupName]) => groupName);

    const selectedOptionMapForItem = selectedOptionMap[item.c_code] || {};

    const missingRequiredOption = requiredGroupNames.some(
      (groupName) => !selectedOptionMapForItem[groupName]
    );

    if (missingRequiredOption) {
      showAlert({
        severity: "warning",
        title: "옵션 선택",
        text: "필수 옵션을 선택해주세요.",
      });
      return;
    }

    const selectedOptionList = Object.values(selectedOptionMapForItem)
      .map((o_code) =>
        (item.originalOptions || []).find((option) => option.o_code === o_code)
      )
      .filter(Boolean);

    try {
      await CartService.deleteCart(item.c_code);

      await CartService.addCart({
        cart: {
          f_code: item.f_code,
          f_count: item.f_count,
          f_addr: item.f_addr || "",
          f_name: item.f_name || "",
          f_tel: item.f_tel || "",
          f_price: item.f_price,
          f_point: item.f_point,
        },
        options: selectedOptionList.map((option) => ({
          co_select: option.o_select,
          co_text: option.o_text,
          co_count: item.f_count,
          co_price: option.o_price,
        })),
      });

      showAlert({
        severity: "success",
        title: "변경 완료",
        text: "옵션이 변경되었습니다.",
      });

      await loadCart(false);
    } catch (error) {
      console.error("옵션 변경 실패", error);
      showAlert({
        severity: "error",
        title: "변경 실패",
        text: "옵션 변경에 실패했습니다.",
      });
    }
  };

  const removeItem = (item) => {
    openConfirmDialog({
      title: "삭제 확인",
      text: "장바구니에서 삭제하시겠습니까?",
      onConfirm: () => removeItemSubmit(item),
    });
  }

  const removeItemSubmit = async (item) => {
    try {
      const deleteCodes = item.c_codeList || [item.c_code];

      for (const c_code of deleteCodes) {
        await CartService.deleteCart(c_code);
      }

      setCart((prev) =>
        prev.filter((cartItem) => cartItem.c_code !== item.c_code)
      );

      setSelectedMap((prev) => {
        const next = { ...prev };
        delete next[item.c_code];
        return next;
      });

      showAlert({
        severity: "success",
        title: "삭제 성공",
        text: "삭제되었습니다."
      })
    } catch (error) {
      console.error("장바구니 삭제 실패", error);
      showAlert({
        severity: "error",
        title: "삭제 실패",
        text: "장바구니 삭제에 실패했습니다."
      })
    }
  };

  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      showAlert({
        severity: "warning",
        title: "상품 선택",
        text: "삭제할 상품을 선택해주세요."
      })
      return;
    }

    const targets = [...selectedItems]

    openConfirmDialog({
      title: "삭제 확인",
      text: "선택한 상품을 삭제하시겠습니까?",
      onConfirm: ()=> removeSelectedItemsSubmit(targets),
    })
  }

  const removeSelectedItemsSubmit = async (items) => {
    try {
      const deleteCodes = items.flatMap(
        (item) => item.c_codeList || [item.c_code]
      );

      for (const c_code of deleteCodes) {
        await CartService.deleteCart(c_code);
      }

      const selectedCodes = items.map((item) => item.c_code);

      setCart((prev) =>
        prev.filter((item) => !selectedCodes.includes(item.c_code))
      );

      setSelectedMap({});
  
      showAlert({
        severity: "success",
        title: "삭제 성공",
        text: "선택 상품을 삭제했습니다."
      })
    } catch (error) {
      console.error("선택 삭제 실패", error);
       showAlert({
        severity: "error",
        title: "삭제 실패",
        text: "선택 삭제에 실패했습니다."
      })
    }
  };

  const onArticle = (f_code) => {
    navigate(`/furniture/article/${f_code}`);
  };

  const onPayment = async (items = selectedItems) => {
    if (items.length === 0) {
      showAlert({
        severity: "warning",
        title: "상품 선택",
        text: "결제할 상품을 선택해주세요.",
      });
      return;
    }

    const c_codes = items.flatMap((item) => item.c_codeList || [item.c_code]);

    try {
      const result = await PaymentService.checkStock(c_codes);

      if (!result.ok) {
        const message = result.items
          .map((item) => {
            if (item.type === "OPTION") {
              return `${item.productName} - ${item.optionName}: ${item.optionValue}
  구매 수량: ${item.requestedCount}개 / 현재 재고: ${item.stock}개`;
            }

            return `${item.productName}
  구매 수량: ${item.requestedCount}개 / 현재 재고: ${item.stock}개`;
          })
          .join("\n\n");

        showAlert({
          severity: "warning",
          title: "재고 부족",
          text: `재고가 부족한 상품이 있습니다.\n\n${message}`,
        });
        return;
      }

      const productTotal = getItemsProductTotal(items);
      const deliveryTotal = getItemsDeliveryTotal(items);

      navigate("/payment", {
        state: {
          items,
          itemCount: getItemsCount(items),
          productTotal,
          deliveryTotal,
          payTotal: productTotal + deliveryTotal,
        },
      });
    } catch (error) {
      console.error("재고 확인 실패", error);

      showAlert({
        severity: "error",
        title: "재고 확인 실패",
        text: "재고 확인 중 오류가 발생했습니다.",
      });
    }
  };

  const groupedCart = getGroupedCart();

  if (cart.length === 0) {
    return (
      <>
      {feedback}
        <Box
          sx={{
            minHeight: "520px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              아직 상품이 없습니다
            </Typography>

            <Typography color="text.secondary" mt={0.5}>
              원하는 상품을 담아보세요
            </Typography>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={() => navigate("/furniture/list")}
            >
              상품페이지로
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
    {feedback}  
    <Box sx={{ p: 3, maxWidth: 1180, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={2} textAlign="center">
        장바구니
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
          <Paper variant="outlined" sx={{ mb: 1.5, borderRadius: 1 }}>
            <Box
              sx={{
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox checked={allSelected} onChange={toggleAll} />
                <Typography fontWeight={700}>모두선택</Typography>
              </Box>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={removeSelectedItems}
              >
                선택삭제
              </Button>
            </Box>
          </Paper>

          <Stack spacing={1.5}>
            {groupedCart.map((group) => {
              const companyAllSelected = group.items.every(
                (item) => selectedMap[item.c_code]
              );

              const companySomeSelected =
                group.items.some((item) => selectedMap[item.c_code]) &&
                !companyAllSelected;

              const companyDeliveryFee = getCompanyDeliveryFee(group.items);

              return (
                <Paper
                  key={group.companyKey}
                  variant="outlined"
                  sx={{ borderRadius: 1, overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.1,
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Checkbox
                      checked={companyAllSelected}
                      indeterminate={companySomeSelected}
                      onChange={() => toggleCompany(group.items)}
                    />

                    <Typography fontWeight={700}>
                      {group.companyName}
                    </Typography>
                  </Box>

                  {group.items.map((item, index) => {
                    const itemProductPrice = getItemProductPrice(item);
                    const optionGroups = getOptionGroups(
                      item.originalOptions || []
                    );
                    const optionEntries = Object.entries(optionGroups);
                    const hasOptions = optionEntries.length > 0;

                    return (
                      <Box key={item.c_code}>
                        {index > 0 && <Divider />}

                        <Box
                          sx={{
                            px: 2,
                            py: 1.4,
                            display: "grid",
                            gridTemplateColumns:
                              "32px 88px minmax(0, 1fr) 120px",
                            gap: 1.5,
                            alignItems: "start",
                          }}
                        >
                          <Checkbox
                            checked={!!selectedMap[item.c_code]}
                            onChange={() => toggleSelect(item.c_code)}
                            sx={{ p: 0.5 }}
                          />

                          <Box
                            component="img"
                            onClick={() => onArticle(item.f_code)}
                            src={
                              item.thumbnail
                                ? `/api/images/FURNITURE/${item.thumbnail}`
                                : "/no-image.png"
                            }
                            alt={item.furniture?.f_name || item.f_code}
                            sx={{
                              width: 88,
                              height: 88,
                              objectFit: "cover",
                              borderRadius: 1,
                              border: "1px solid #eee",
                              cursor: "pointer",
                            }}
                          />

                          <Box sx={{ minWidth: 0, textAlign: "left" }}>
                            <Typography
                              fontWeight={700}
                              sx={{ cursor: "pointer", textAlign: "left" }}
                              onClick={() => onArticle(item.f_code)}
                            >
                              {item.furniture?.f_name || item.f_code}
                            </Typography>

                            <Stack spacing={0.7} sx={{ mt: 0.9 }}>
                              <Stack
                                direction="row"
                                spacing={0.8}
                                alignItems="center"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    width: OPTION_LABEL_WIDTH,
                                    flexShrink: 0,
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  수량
                                </Typography>

                                <Box
                                  sx={{
                                    width: OPTION_CONTROL_WIDTH,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      border: "1px solid #ddd",
                                      borderRadius: 1,
                                      overflow: "hidden",
                                      height: 30,
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        changeCartCount(
                                          item,
                                          Number(item.f_count || 1) - 1
                                        )
                                      }
                                      disabled={Number(item.f_count || 1) <= 1}
                                      sx={{
                                        width: 29,
                                        height: 29,
                                        borderRadius: 0,
                                      }}
                                    >
                                      <RemoveIcon fontSize="small" />
                                    </IconButton>

                                    <Typography
                                      sx={{
                                        width: 34,
                                        textAlign: "center",
                                        fontSize: 14,
                                      }}
                                    >
                                      {item.f_count}
                                    </Typography>

                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        changeCartCount(
                                          item,
                                          Number(item.f_count || 1) + 1
                                        )
                                      }
                                      sx={{
                                        width: 29,
                                        height: 29,
                                        borderRadius: 0,
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Stack>

                              {hasOptions &&
                                optionEntries.map(
                                  ([groupName, groupOptions], optionIndex) => {
                                    const isLastOption =
                                      optionIndex === optionEntries.length - 1;

                                    return (
                                      <Stack
                                        key={groupName}
                                        direction="row"
                                        spacing={0.8}
                                        alignItems="center"
                                      >
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{
                                            width: OPTION_LABEL_WIDTH,
                                            flexShrink: 0,
                                            textAlign: "left",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {groupName}
                                        </Typography>

                                        <FormControl
                                          size="small"
                                          sx={{
                                            width: OPTION_CONTROL_WIDTH,
                                            "& .MuiInputBase-root": {
                                              height: 30,
                                              fontSize: 13,
                                            },
                                          }}
                                        >
                                          <Select
                                            displayEmpty
                                            value={
                                              selectedOptionMap[item.c_code]?.[
                                                groupName
                                              ] || ""
                                            }
                                            onChange={(evt) =>
                                              changeSelectedOption(
                                                item.c_code,
                                                groupName,
                                                evt.target.value
                                              )
                                            }
                                          >
                                            <MenuItem value="" disabled>
                                              {groupName}
                                            </MenuItem>

                                            {groupOptions.map((option) => (
                                              <MenuItem
                                                key={option.o_code}
                                                value={option.o_code}
                                                disabled={
                                                  Number(option.o_count || 0) <=
                                                  0
                                                }
                                              >
                                                {option.o_text}
                                                {Number(option.o_price || 0) > 0
                                                  ? ` (+${Number(
                                                      option.o_price
                                                    ).toLocaleString()}원)`
                                                  : ""}
                                                {Number(option.o_count || 0) <= 0
                                                  ? " 품절"
                                                  : ""}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>

                                        {isLastOption && (
                                          <Button
                                            type="button"
                                            variant="outlined"
                                            color="inherit"
                                            size="small"
                                            onClick={(evt) => {
                                              evt.preventDefault()
                                              evt.stopPropagation()
                                              onUpdateCartOption(item)  
                                            }}
                                            sx={{
                                              height: 30,
                                              minWidth: 52,
                                              px: 1.2,
                                              fontSize: 13,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            변경
                                          </Button>
                                        )}
                                      </Stack>
                                    );
                                  }
                                )}
                            </Stack>
                          </Box>

                          <Box
                            sx={{
                              textAlign: "right",
                              minWidth: 110,
                              justifySelf: "end",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            <Button
                              variant="text"
                              color="inherit"
                              size="small"
                              onClick={() => removeItem(item)}
                              sx={{ minWidth: 0, mb: 1 }}
                            >
                              ×
                            </Button>

                            <Typography
                              fontWeight={800}
                              sx={{ textAlign: "right" }}
                            >
                              {itemProductPrice.toLocaleString()}원
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderTop: "1px solid #eee",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => onPayment([item])}
                            sx={{
                              height: 32,
                              minWidth: 84,
                              fontSize: 13,
                            }}
                          >
                            구매하기
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}

                  <Divider />

                  <Box sx={{ py: 1.1, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ textAlign: "center" }}>
                      배송비{" "}
                      {companyDeliveryFee === 0
                        ? "무료"
                        : `${companyDeliveryFee.toLocaleString()}원`}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
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
          <Box display="flex" justifyContent="space-between" mb={1.5}>
            <Typography fontWeight={700}>
              총 금액 ({selectedItemCount}개)
            </Typography>
            <Typography fontWeight={700}>
              {selectedPayTotal.toLocaleString()}원
            </Typography>
          </Box>

          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                상품 금액
              </Typography>
              <Typography variant="body2">
                {selectedProductTotal.toLocaleString()}원
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                배송비
              </Typography>
              <Typography variant="body2">
                {selectedDeliveryTotal.toLocaleString()}원
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700}>최종 결제 금액</Typography>
            <Typography variant="h6" fontWeight={800}>
              {selectedPayTotal.toLocaleString()}원
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => onPayment()}
          >
            {selectedItemCount}개 상품 구매하기
          </Button>
        </Paper>
      </Box>
    </Box>
  </>
  );
};

export default CartPage;