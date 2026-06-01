import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FurnitureService from "../service/furnitureService";
import LikeService from "../service/likeService";
import OptionsService from "../service/optionService";
import CartService from "../service/cartService";
import FurnitureReview from "../components/FurnitureReview";
import Question from "./Question";
import Loading from "../components/Loading";
import CouponArticleDownload from "../components/CouponArticleDownload";
import DialogInside from "../components/DialogInside";
import { getFurnitureCategoryCode } from "../components/FurnitureCategorySelect";

import {Snackbar} from "@mui/material";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

const FurnitureArticle = () => {
    const calledFCode = useRef(null);

    const { f_code } = useParams();
    const [furniture, setFurniture] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [tab, setTab] = useState("detail");
    const [liked, setLiked] = useState(false);
    const [couponDialog, setCouponDialog] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedOptionSets, setSelectedOptionSets] = useState([
        {
            selectedOptions: {},
            quantity: 1
        }
    ]);
    const [alert, setAlert] = useState({
      open: false,
      severity: "info",
      title: "",
      text: "",
    })
    const [addingCart, setAddingCart] = useState(false)
    const [buyingNow, setBuyingNow] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [liking, setLiking] = useState(false)

    const showAlert = ({ severity = "info" , title = "", text = ""}) => {
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
      }));
    };

    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const page = query.get("page");

    //마이페이지 문의에서 바로 이동하게 할 수 있는 - 0522 모하영
    useEffect(() => {
        const tabParam = query.get("tab");

        if (["detail", "review", "qna"].includes(tabParam)) {
            setTab(tabParam);
        }
    }, [location.search]);
    const getLoginUser = () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    };

    const getOptionSetStockLimit = (optionSet) => {
        const selectedOptionList = getSelectedOptionListBySet(optionSet);

        if (selectedOptionList.length === 0) {
            return Number(furniture?.f_count ?? 0);
        }

        return Math.min(
            ...selectedOptionList.map(option => Number(option.o_count || 0))
        );
    };

    const getLoginFurnitureCompany = () => {
        const loginUser = getLoginUser();

        if (!loginUser || loginUser.type !== "company") return null;

        if (loginUser.companyDto?.c_kind === "shop") {
            return loginUser.companyDto;
        }

        return (
            loginUser.companyList?.find(company => company.c_kind === "shop") ||
            null
        );
    };

    const canManageFurniture = (furnitureItem) => {
        const furnitureCompany = getLoginFurnitureCompany();

        if (!furnitureCompany || !furnitureItem) return false;

        return furnitureItem.c_id === furnitureCompany.c_id;
    };

    const optionGroups = options.reduce((groups, option) => {
        const key = (option.o_select || "").trim();

        if (!key) return groups;

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push({
            ...option,
            o_select: key,
            o_text: (option.o_text || "").trim()
        });

        return groups;
    }, {});

    const hasOptions = Object.keys(optionGroups).length > 0
    const isSoldOut = !hasOptions && Number(furniture?.f_count ?? 0) <=0
  
    const addOptionSet = () => {
        setSelectedOptionSets(prev => [
            ...prev,
            {
                selectedOptions: {},
                quantity: 1
            }
        ]);
    };

    const removeOptionSet = (setIndex) => {
        setSelectedOptionSets(prev =>
            prev.filter((_, index) => index !== setIndex)
        );
    };

    const changeOptionSet = (setIndex, groupName, o_code) => {
        setSelectedOptionSets(prev =>
            prev.map((set, index) => {
                if (index !== setIndex) return set;

                return {
                    ...set,
                    selectedOptions: {
                        ...set.selectedOptions,
                        [groupName]: o_code
                    }
                };
            })
        );
    };

    const changeOptionSetQuantity = (setIndex, quantity) => {
        setSelectedOptionSets(prev =>
            prev.map((set, index) => {
                if (index !== setIndex) return set;

                return {
                    ...set,
                    quantity: Math.max(1, quantity)
                };
            })
        );
    };

    const getRequiredOptionGroupNames = () => {
      return Object.entries(optionGroups)
      .filter(([, groupOptions]) => 
        groupOptions.some((option) => option.o_important === "Y")
    )
    .map(([groupName]) => groupName)
    }

    const getSelectedOptionListBySet = (optionSet) => {
        return Object.values(optionSet.selectedOptions)
            .map(o_code => options.find(option => option.o_code === o_code))
            .filter(Boolean);
    };

    const isOptionSetComplete = (optionSet) => {
      const requiredGroupNames = getRequiredOptionGroupNames();

      if (requiredGroupNames.length === 0) return true;

      return requiredGroupNames.every(
        (groupName) => !!optionSet.selectedOptions[groupName]
      );
    };

    useEffect(() => {
        if (!f_code) return;
        if (calledFCode.current === f_code) return;

        calledFCode.current = f_code;

        getArticle();
    }, [f_code]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !f_code) {
            setLiked(false);
            return;
        }

        LikeService.checkFurnitureLike(f_code)
            .then((res) => {
                setLiked(res.data?.liked || false);
            })
            .catch((error) => {
                console.error("찜 여부 확인 실패", error);
                setLiked(false);
            });
    }, [f_code]);

    useEffect(() => {
        if (furniture?.imageList?.length > 0) {
            const thumb = furniture.imageList.find(
                img => img.img_tag === "THUMBNAIL"
            );

            setMainImage(thumb || furniture.imageList[0]);
        }
    }, [furniture]);

    useEffect(() => {
        if (!f_code) return;

        OptionsService.getFurnitureOptions(f_code)
            .then((res) => {
                setOptions(res.data || []);
            })
            .catch((error) => {
                console.error("옵션 조회 실패", error);
                setOptions([]);
            });
    }, [f_code]);

    const getArticle = async () => {
        try {
            const data = await FurnitureService.getFurnitureItem(f_code);

            const loginUser = getLoginUser();
            const isCompanyUser =
                loginUser?.type === "company"

            if (!isCompanyUser) {
                await FurnitureService.increaseView(f_code);
                data.f_viewCount = Number(data.f_viewCount || 0) + 1;
            }

            setFurniture(data);
        } catch (error) {
            console.error("가구 상세 조회 실패", error);
            
            showAlert({
              severity: "error",
              title: "조회 실패",
              text: "가구 상세 조회에 실패했습니다.",
            });
        }
    };

    const onToggleLike = () => {
      if(liking) return

        const token = localStorage.getItem("token");

        if (!token) {
          showAlert({
            severity: "warning",
            title: "로그인",
            text: "로그인이 필요합니다.",
          });

          setTimeout(()=>{
            navigate("/login");
          },500)

          return;
        }

        setLiking(true)

        LikeService.toggleFurnitureLike(f_code)
            .then((res) => {
                setLiked(res.data?.liked || false);
            })
            .catch((error) => {
                console.error("찜 처리 실패", error);
                showAlert({
                  severity: "error",
                  title: "찜 실패",
                  text: "찜 처리에 실패했습니다.",
                });
            })
            .finally(()=>{
              setLiking(false)
            })
    };

    const onAddCart = async () => {
      if (addingCart) return

      setAddingCart(true)

      try{
        const token = localStorage.getItem("token");

        if (!token) {
          showAlert({
            severity: "warning",
            title: "로그인 필요",
            text: "로그인이 필요합니다.",
          });

          setTimeout(()=>{
            navigate("/login");
          },500)

          return;
        }

        if (isSoldOut) {
          showAlert({
            severity: "warning",
            title: "상품 품절",
            text: "품절된 상품입니다.",
          });
          return;
        }
        
        const invalidSet = selectedOptionSets.some(set => !isOptionSetComplete(set));

        if (invalidSet) {
          showAlert({
            severity: "warning",
            title: "옵션 선택",
            text: "필수 옵션을 선택해주세요.",
          });
            return;
        }

        const soldOutSet = selectedOptionSets.some((optionSet)=>{
          const limit = getOptionSetStockLimit(optionSet);
          return limit <=0;
        })

        if (soldOutSet){
          showAlert({
            severity: "warning",
            title: "구매 불가",
            text: "품절된 상품 또는 옵션은 구매할 수 없습니다.",
          });
          return
        }

        const overStockSet = selectedOptionSets.some(optionSet => {
            const limit = getOptionSetStockLimit(optionSet);
            return optionSet.quantity > limit;
        });

        if (overStockSet) {
          showAlert({
            severity: "error",
            title: "수량 초과",
            text: "재고 수량을 초과한 옵션이 있습니다.",
          });
            return;
        }
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            for (const optionSet of selectedOptionSets) {
                const selectedOptionList = getSelectedOptionListBySet(optionSet);

                await CartService.addCart({
                  mergeCart: true,
                    cart: {
                        f_code: furniture.f_code,
                        f_count: optionSet.quantity,
                        f_addr: user.addr || "",
                        f_name: user.name || "",
                        f_tel: user.tel || "",
                        f_price: furniture.f_dprice,
                        f_point: furniture.f_point,
                    },
                    options: selectedOptionList.map(option => ({
                        co_select: option.o_select,
                        co_text: option.o_text,
                        co_count: optionSet.quantity,
                        co_price: option.o_price
                    }))
                });
            }

            showAlert({
              severity: "success",
              title: "추가 성공",
              text: "상품을 장바구니에 추가했습니다.",
            }); 
        } catch (error) {
            console.error("장바구니 담기 실패", error);
            showAlert({
              severity: "error",
              title: "추가 실패",
              text: "상품 추가를 실패했습니다.",
            });
        }
      }finally{
        setAddingCart(false)
      }
    };

    const onPayment = async () => {
      if (buyingNow) return;

      setBuyingNow(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          showAlert({
            severity: "warning",
            title: "로그인 필요",
            text: "로그인이 필요합니다.",
          });

          setTimeout(() => {
            navigate("/login");
          }, 500);

          return;
        }

        if (isSoldOut) {
          showAlert({
            severity: "warning",
            title: "상품 품절",
            text: "품절된 상품입니다.",
          });
          return;
        }

        const invalidSet = selectedOptionSets.some(
          (set) => !isOptionSetComplete(set)
        );

        if (invalidSet) {
          showAlert({
            severity: "warning",
            title: "옵션 선택",
            text: "필수 옵션을 선택해주세요.",
          });
          return;
        }

        const soldOutSet = selectedOptionSets.some((optionSet) => {
          const limit = getOptionSetStockLimit(optionSet);
          return limit <= 0;
        });

        if (soldOutSet) {
          showAlert({
            severity: "warning",
            title: "상품 품절",
            text: "품절된 상품 또는 옵션은 구매할 수 없습니다.",
          });
          return;
        }

        const overStockSet = selectedOptionSets.some((optionSet) => {
          const limit = getOptionSetStockLimit(optionSet);
          return optionSet.quantity > limit;
        });

        if (overStockSet) {
          showAlert({
            severity: "warning",
            title: "수량 초과",
            text: "재고 수량을 초과한 옵션이 있습니다.",
          });
          return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const paymentItems = [];

        for (const optionSet of selectedOptionSets) {
          const selectedOptionList = getSelectedOptionListBySet(optionSet);

          const cartOptions = selectedOptionList.map((option) => ({
            co_select: option.o_select,
            co_text: option.o_text,
            co_count: optionSet.quantity,
            co_price: option.o_price,
          }));

          const res = await CartService.addCart({
            mergeCart: false,
            cart: {
              f_code: furniture.f_code,
              f_count: optionSet.quantity,
              f_addr: user.addr || "",
              f_name: user.name || "",
              f_tel: user.tel || "",
              f_price: furniture.f_dprice,
              f_point: furniture.f_point,
            },
            options: cartOptions,
          });

          const c_code = res?.data?.c_code || res?.c_code;

          if (!c_code) {
            continue;
          }

          const thumbnail = furniture.imageList?.find(
            (img) => img.img_tag === "THUMBNAIL"
          );

          paymentItems.push({
            c_code,
            id: user.id,
            f_code: furniture.f_code,
            f_status: "N",
            f_count: optionSet.quantity,
            f_addr: user.addr || "",
            f_name: user.name || "",
            f_tel: user.tel || "",
            f_price: furniture.f_dprice,
            f_point: furniture.f_point,
            options: cartOptions,
            furniture,
            thumbnail: thumbnail?.img_name || null,
          });
        }

        if (paymentItems.length === 0) {
          showAlert({
            severity: "error",
            title: "상품 정보 생성 실패",
            text: "결제 상품 정보를 생성하지 못했습니다.",
          });
          return;
        }

        const productTotal = paymentItems.reduce((sum, item) => {
          const optionTotal = (item.options || []).reduce(
            (optionSum, option) => optionSum + Number(option.co_price || 0),
            0
          );

          return (
            sum +
            (Number(item.f_price || 0) + optionTotal) *
              Number(item.f_count || 0)
          );
        }, 0);

        const deliveryTotal =
          productTotal >= 50000
            ? 0
            : Number(furniture.f_deliveryPrice ?? furniture.f_deliveryprice ?? 0);

        navigate("/payment", {
          state: {
            items: paymentItems,
            productTotal,
            deliveryTotal,
            payTotal: productTotal + deliveryTotal,
          },
        });
      } catch (error) {
        console.error("바로구매 실패", error);
        showAlert({
          severity: "error",
          title: "구매 실패",
          text: "바로구매 처리에 실패했습니다.",
        });
      } finally {
        setBuyingNow(false);
      }
    };

    const onBack = () => {
        navigate(`/furniture/list?page=${page}`);
    };

    const onUpdate = () => {
        navigate(`/furniture/update/${f_code}?page=${page}`);
    };

    const onDelete = async (f_code) => {
        try {
            await FurnitureService.deleteFurniture(f_code);
            showAlert({
              severity: "success",
              title: "삭제 완료",
              text: "상품을 성공적으로 삭제했습니다.",
            });

            setTimeout(() => {
              navigate(`/furniture/list?page=${page}`);
            }, 500);

        } catch (error) {
            console.error(error);
            showAlert({
              severity: "error",
              title: "삭제 실패",
              text: "상품 삭제에 실패했습니다.",
            });
        }
    };

    if (!furniture) {
        return <Loading message="상품 정보를 불러오는 중입니다."/>;
    }

    const productDeliveryPrice = Number(
      furniture.f_deliveryPrice ?? furniture.f_deliveryprice ?? 0
    );

    const deliveryPrice = 
    Number(furniture.f_dprice || 0) >= 50000 ? 0 : productDeliveryPrice

    const imageList = furniture.imageList || [];

    const orderedThumbInfo = [
        ...imageList.filter(img => img.img_tag === "THUMBNAIL"),
        ...imageList.filter(img => img.img_tag === "INFO")
    ];

    const othersImages = imageList.filter(img => img.img_tag === "OTHERS");

    return (
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
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="상품 삭제"
        text="이 상품을 삭제하시겠습니까?"
        buttons={[
          {
            title: "취소",
            color: "inherit",
            variant: "outlined",
            onClick: () => setDeleteDialogOpen(false),
          },
          {
            title: "삭제",
            color: "error",
            variant: "contained",
            onClick: () => {
              setDeleteDialogOpen(false);
              onDelete(f_code);
            },
          },
        ]}
      />

      <div style={{ padding: "20px" }}>
        {canManageFurniture(furniture) && (
          <>
            <button onClick={() => onUpdate(f_code)}>수정</button>
            <button onClick={() => setDeleteDialogOpen(true)}>삭제</button>
          </>
        )}

        <button onClick={() => setCouponDialog(!couponDialog)}>
          쿠폰 모두 받기
        </button>

        <DialogInside
          open={couponDialog}
          onClose={() => setCouponDialog(false)}
        >
          <CouponArticleDownload
            c_id={furniture.c_id}
            catagory={getFurnitureCategoryCode(furniture.f_catagory1)}
          />
        </DialogInside>

        <button onClick={onBack}>list로 돌아가기</button>

        <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
          <div>
            <div style={{ display: "flex", gap: "15px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {orderedThumbInfo.map((image, index) => (
                  <img
                    key={index}
                    src={`/api/images/FURNITURE/${image.img_name}`}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border:
                        mainImage?.img_name === image.img_name
                          ? "2px solid black"
                          : "1px solid #ddd",
                    }}
                    onClick={() => setMainImage(image)}
                    alt=""
                  />
                ))}
              </div>

              <img
                src={
                  mainImage?.img_name
                    ? `/api/images/FURNITURE/${mainImage.img_name}`
                    : "/no-image.png"
                }
                style={{
                  width: "450px",
                  height: "450px",
                  objectFit: "cover",
                }}
                alt=""
              />
            </div>

            <hr />

            <button
              type="button"
              disabled={liking}
              onClick={onToggleLike}
              style={{
                width: "100%",
                padding: "15px",
                background: liked ? "#ffdddd" : "white",
                color: liked ? "red" : "black",
                border: "1px solid #ddd",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              {liked ? "♥ 찜 해제" : "♡ 찜하기"}
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <h2>{furniture.f_name}</h2>

            <p>업체명: {furniture.c_name}</p>
            <p>조회수: {furniture.f_viewCount}</p>

            <hr />

            <h3>가격 정보</h3>
            <p>정가: {furniture.f_price.toLocaleString()}원</p>
            <p>할인가: {furniture.f_dprice.toLocaleString()}원</p>
            <p>할인율: {furniture.f_discount}%</p>
            <p>포인트: {furniture.f_point}</p>

            <hr />

            <h3>배송 정보</h3>
            <p>
              배송비:{" "}
              {furniture.f_dprice >= 50000
                ? "무료배송"
                : `${deliveryPrice.toLocaleString()}원`}
            </p>
            <p>배송기간: 2~3일</p>

            {isSoldOut && (
              <div
                style={{
                  margin: "16px 0",
                  padding: "14px 16px",
                  border: "1px solid #f1c0c0",
                  borderRadius: "6px",
                  background: "#fff5f5",
                  color: "#c62828",
                  fontWeight: 700,
                }}
              >
                현재 품절된 상품입니다.
              </div>
            )}

            <h3>옵션 선택</h3>

            {selectedOptionSets.map((optionSet, setIndex) => (
              <div
                key={setIndex}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  marginBottom: "10px",
                }}
              >
                {Object.entries(optionGroups).map(
                  ([groupName, groupOptions]) => (
                    <div key={groupName} style={{ marginBottom: "10px" }}>
                      <label>{groupName}</label>

                      <select
                        value={optionSet.selectedOptions[groupName] || ""}
                        onChange={(evt) =>
                          changeOptionSet(setIndex, groupName, evt.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginTop: "5px",
                        }}
                      >
                        <option value="">{groupName} 선택</option>

                        {groupOptions.map((option) => (
                          <option
                            key={option.o_code}
                            value={option.o_code}
                            disabled={Number(option.o_count) <= 0}
                          >
                            {option.o_text}
                            {Number(option.o_price) > 0
                              ? ` (+${Number(option.o_price).toLocaleString()}원)`
                              : ""}
                            {Number(option.o_count) === 1
                              ? " 마지막 한 개"
                              : ""}
                            {Number(option.o_count) <= 0 ? " 품절" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ),
                )}

                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeOptionSetQuantity(setIndex, optionSet.quantity - 1)
                    }
                  >
                    -
                  </button>

                  <span>{optionSet.quantity}</span>

                  <button
                    type="button"
                    onClick={() => {
                      const limit = getOptionSetStockLimit(optionSet);

                      if (optionSet.quantity >= limit) {
                        showAlert({
                            severity: "warning",
                            title: "재고 초과",
                            text: "재고 수량을 초과할 수 없습니다.",
                          });
                        return;
                      }

                      changeOptionSetQuantity(setIndex, optionSet.quantity + 1);
                    }}
                  >
                    +
                  </button>
                </div>

                {selectedOptionSets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOptionSet(setIndex)}
                  >
                    옵션 삭제
                  </button>
                )}
              </div>
            ))}

            {Object.keys(optionGroups).length > 0 && (
              <button type="button" onClick={addOptionSet}>
                옵션 추가
              </button>
            )}

            <button
              onClick={onAddCart}
              disabled={isSoldOut || addingCart}
              style={{
                width: "100%",
                padding: "15px",
                background: isSoldOut || addingCart ? "#f3f4f6" : "white",
                color: isSoldOut || addingCart ? "#9ca3af" : "black",
                border: "1px solid #ddd",
                fontSize: "16px",
                cursor: isSoldOut || addingCart ? "not-allowed" : "pointer",
                marginTop: "10px",
                marginBottom: "10px",
              }}
              >
                {isSoldOut ? "품절" : addingCart ? "처리 중" : "장바구니"}
              </button>

            <button
              onClick={onPayment}
              disabled={isSoldOut || buyingNow}
              style={{
                width: "100%",
                padding: "15px",
                background: isSoldOut || buyingNow ? "#9ca3af" : "black",
                color: "white",
                fontSize: "16px",
                cursor: isSoldOut || buyingNow ? "not-allowed" : "pointer",
              }}
            >
              {isSoldOut ? "품절" : buyingNow ? "처리 중" : "구매하기"}
            </button>
          </div>
        </div>

        <hr />

        <div
          style={{
            display: "flex",
            marginTop: "10px",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setTab("detail")}
            style={{
              flex: 1,
              padding: "15px",
              background: tab === "detail" ? "black" : "#eee",
              color: tab === "detail" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            상세보기
          </button>

          <button
            onClick={() => setTab("review")}
            style={{
              flex: 1,
              padding: "15px",
              background: tab === "review" ? "black" : "#eee",
              color: tab === "review" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            리뷰
          </button>

          <button
            onClick={() => setTab("qna")}
            style={{
              flex: 1,
              padding: "15px",
              background: tab === "qna" ? "black" : "#eee",
              color: tab === "qna" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            문의
          </button>
        </div>

        <div style={{ marginTop: "50px" }}>
          {tab === "detail" && (
            <div>
              <h3>상세 설명</h3>

              <div>
                {othersImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={`/api/images/FURNITURE/${img.img_name}`}
                    style={{
                      width: "100%",
                      marginBottom: "20px",
                    }}
                    alt=""
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "review" && (
            <div>
              
              <div
                style={{
                  padding: "30px",
                  border: "1px solid #ddd",
                }}
              >
                <FurnitureReview f_code={f_code} />
              </div>
            </div>
          )}

          {tab === "qna" && (
            <div>

              <div
                style={{
                  padding: "30px",
                  border: "1px solid #ddd",
                }}
              >
                {/* 0518 모하영 자회사 문의작성 금지중 */}
                <Question f_code={f_code} furniture={furniture} />
              </div>
            </div>
          )}
        </div>
      </div>

    </>
    );
};

export default FurnitureArticle;
