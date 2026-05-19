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
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import OptionsService from "../service/optionService";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";

const FREE_DELIVERY_LIMIT = 50000;
const OPTION_LABEL_WIDTH = 52;
const OPTION_CONTROL_WIDTH = 210;

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [selectedOptionMap, setSelectedOptionMap] = useState({});

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

  const getCartOptionKey = (options) => {
    return (options || [])
      .map((option) => ({
        select: (option.co_select || "").trim(),
        text: (option.co_text || "").trim(),
        price: Number(option.co_price || 0),
      }))
      .sort((a, b) => {
        const selectCompare = a.select.localeCompare(b.select);
        if (selectCompare !== 0) return selectCompare;

        return a.text.localeCompare(b.text);
      })
      .map((option) => `${option.select}:${option.text}:${option.price}`)
      .join("|");
  };

  const getDuplicateKey = (item) => {
    const companyKey =
      item.furniture?.c_id || item.furniture?.c_name || "unknown";

    return `${companyKey}_${item.f_code}_${getCartOptionKey(item.options)}`;
  };

  const normalizeDuplicateCart = async (cartList) => {
    const groups = {};

    cartList.forEach((item) => {
      const key = getDuplicateKey(item);

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const duplicateGroups = Object.values(groups).filter(
      (items) => items.length > 1
    );

    if (duplicateGroups.length === 0) return false;

    await Promise.all(
      duplicateGroups.map(async (items) => {
        const [first, ...duplicates] = items;
        const totalCount = items.reduce(
          (sum, item) => sum + Number(item.f_count || 0),
          0
        );

        await CartService.updateCartCount({
          c_code: first.c_code,
          f_count: totalCount,
        });

        await Promise.all(
          duplicates.map((item) => CartService.deleteCart(item.c_code))
        );
      })
    );

    return true;
  };

  const getMergeOptionKey = (options) => {
    return (options || [])
      .map((option) => ({
        select: (option.co_select || "").trim(),
        text: (option.co_text || "").trim(),
        price: Number(option.co_price || 0),
      }))
      .sort((a, b) => {
        const selectCompare = a.select.localeCompare(b.select);
        if (selectCompare !== 0) return selectCompare;

        return a.text.localeCompare(b.text);
      })
      .map((option) => `${option.select}:${option.text}:${option.price}`)
      .join("|");
  };

  const mergeSameCartItems = (cartList) => {
    const mergedMap = {};

    cartList.forEach((item) => {
      const companyKey =
        item.furniture?.c_id || item.furniture?.c_name || "unknown";

      const mergeKey = [
        companyKey,
        item.f_code,
        getMergeOptionKey(item.options),
      ].join("_");

      if (!mergedMap[mergeKey]) {
        mergedMap[mergeKey] = {
          ...item,
          c_codeList: [item.c_code],
          f_count: Number(item.f_count || 0),
        };

        return;
      }

      mergedMap[mergeKey] = {
        ...mergedMap[mergeKey],
        c_codeList: [...mergedMap[mergeKey].c_codeList, item.c_code],
        f_count:
          Number(mergedMap[mergeKey].f_count || 0) + Number(item.f_count || 0),
      };
    });

    return Object.values(mergedMap);
  };

  const loadCart = async () => {
    try {
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
          let originalOptions = [];

          if (cartOptions.length > 0) {
            const originalOptionRes =
              await OptionsService.getFurnitureOptions(item.f_code);

            originalOptions = originalOptionRes.data || [];
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

      const merged = await normalizeDuplicateCart(cartWithDetail);

      if (merged) {
        await loadCart();
        return;
      }

      const mergedCart = mergeSameCartItems(cartWithDetail);

      const mergedSelected = {};
      mergedCart.forEach((item) => {
        mergedSelected[item.c_code] = true;
      });

      setCart(mergedCart);
      setSelectedMap(mergedSelected);
      setSelectedOptionMap(nextOptionMap);
    } catch (error) {
      console.error("장바구니 조회 실패", error);
      alert("장바구니 조회에 실패했습니다.");
    }
  };

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

  const selectedItemCount = selectedItems.reduce((sum,item)=>{
    return sum + Number(item.f_count || 0)
  },0)

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

  const getSelectedCompanyGroups = () => {
    const groups = {};

    selectedItems.forEach((item) => {
      const companyKey =
        item.furniture?.c_id || item.furniture?.c_name || "unknown";

      if (!groups[companyKey]) groups[companyKey] = [];

      groups[companyKey].push(item);
    });

    return Object.values(groups);
  };

  const selectedProductTotal = selectedItems.reduce((sum, item) => {
    return sum + getItemProductPrice(item);
  }, 0);

  const selectedDeliveryTotal = getSelectedCompanyGroups().reduce(
    (sum, companyItems) => sum + getCompanyDeliveryFee(companyItems),
    0
  );

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
      alert("수량 변경에 실패했습니다.");
    }
  };

  const onUpdateCartOption = async (item) => {
    const optionGroups = getOptionGroups(item.originalOptions || []);
    const groupNames = Object.keys(optionGroups);

    const selectedOptionList = Object.values(selectedOptionMap[item.c_code] || {})
      .map((o_code) =>
        (item.originalOptions || []).find((option) => option.o_code === o_code)
      )
      .filter(Boolean);

    if (selectedOptionList.length !== groupNames.length) {
      alert("옵션을 모두 선택해주세요.");
      return;
    }

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

      alert("옵션이 변경되었습니다.");
      await loadCart();
    } catch (error) {
      console.error("옵션 변경 실패", error);
      alert("옵션 변경에 실패했습니다.");
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm("장바구니에서 삭제하시겠습니까?")) return;

    try {
      const deleteCodes = item.c_codeList || [item.c_code];

      await Promise.all(
        deleteCodes.map((c_code) => CartService.deleteCart(c_code))
      );

      setCart((prev) =>
        prev.filter((cartItem) => cartItem.c_code !== item.c_code)
      );

      setSelectedMap((prev) => {
        const next = { ...prev };
        delete next[item.c_code];
        return next;
      });

      alert("삭제되었습니다.");
    } catch (error) {
      console.error("장바구니 삭제 실패", error);
      alert("장바구니 삭제에 실패했습니다.");
    }
  };

  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }

    if (!window.confirm("선택한 상품을 삭제하시겠습니까?")) return;

    try {
      await Promise.all(
        selectedItems.flatMap((item) =>
          (item.c_codeList || [item.c_code]).map((c_code) =>
            CartService.deleteCart(c_code)
          )
        )
      );

      const selectedCodes = selectedItems.map((item) => item.c_code);

      setCart((prev) =>
        prev.filter((item) => !selectedCodes.includes(item.c_code))
      );

      setSelectedMap({});

      alert("선택 상품을 삭제했습니다.");
    } catch (error) {
      console.error("선택 삭제 실패", error);
      alert("선택 삭제에 실패했습니다.");
    }
  };

  const onArticle = (f_code) => {
    navigate(`/furniture/article/${f_code}`);
  };

  const onPayment = () => {
    if (selectedItems.length === 0) {
      alert("결제할 상품을 선택해주세요.");
      return;
    }

    navigate("/payment", {
      state: {
        items: selectedItems,
        productTotal: selectedProductTotal,
        deliveryTotal: selectedDeliveryTotal,
        payTotal: selectedPayTotal,
      },
    });
  };

  const groupedCart = getGroupedCart();

  if (cart.length === 0) {
    return (
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
    );
  }

  return (
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
                                ? `http://localhost:8080/api/images/FURNITURE/${item.thumbnail}`
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
                                            variant="outlined"
                                            color="inherit"
                                            size="small"
                                            onClick={() =>
                                              onUpdateCartOption(item)
                                            }
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
                            onClick={onPayment}
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
            onClick={onPayment}
          >
            {selectedItemCount}개 상품 구매하기
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default CartPage;