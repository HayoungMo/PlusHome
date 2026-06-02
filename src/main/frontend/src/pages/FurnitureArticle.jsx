import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FurnitureService from "../service/furnitureService";
import LikeService from "../service/likeService";
import OptionsService from "../service/optionService";
import CartService from "../service/cartService";
import FurnitureReview from "../components/FurnitureReview";
import Question from "./Question";
import CouponArticleDownload from "../components/CouponArticleDownload";
import DialogInside from "../components/DialogInside";
import { getFurnitureCategoryCode } from "../components/FurnitureCategorySelect";

import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { FaShareAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { GoHomeFill } from "react-icons/go";

import FurnitureReviewService from "../service/furnitureReviewService";
import questionService from "../service/questionService";

import {Snackbar} from "@mui/material";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

import "../css/FurnitureArticle.css";
import SkeletonMui from "../components/SkeletonMui";

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

    const [articleReviewSummary, setArticleReviewSummary] = useState(null)
    const [articleQnaCount, setArticleQnaCount] = useState(null)

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

    const onGoHome = () => {
        navigate("/");
    };

    const onGoShopping = () => {
        navigate(`/furniture/list`);
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

    useEffect(() => {
        if (!f_code) return;

        FurnitureReviewService.selectReview({ f_code, fr_idx: 0 })
            .then((result) => {
                const list = Array.isArray(result.data) ? result.data : [];
                const reviews = list.filter((item) => Number(item.fr_idx) > 0);

                const count = reviews.length;
                const average =
                    count > 0
                        ? reviews.reduce(
                            (sum, review) => sum + Number(review.fr_star || 0),
                            0
                        ) / count
                        : 0;

                setArticleReviewSummary({ count, average });
            })
            .catch((error) => {
                console.error("리뷰 요약 조회 실패", error);
                setArticleReviewSummary({ count: 0, average: 0 });
            });
    }, [f_code]);

    useEffect(() => {
        if (!f_code) return;

        questionService.getQuestionList(f_code)
            .then((data) => {
                const questions = Array.isArray(data) ? data : [];
                setArticleQnaCount(questions.length);
            })
            .catch((error) => {
                console.error("문의 개수 조회 실패", error);
                setArticleQnaCount(0);
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
        return <SkeletonMui variant="furnitureArticle" />;
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

    const loginUser = getLoginUser();
    const isCompanyUser = loginUser?.type === "company";
    const isManager = canManageFurniture(furniture);
    const showUserActions = !isCompanyUser;

    console.log("loginUser", loginUser);
    console.log("furniture c_id", furniture?.c_id);
    console.log("company", getLoginFurnitureCompany());
    console.log("isManager", isManager);

    const articleOrderTotal = selectedOptionSets.reduce((sum, optionSet) => {
        const selectedOptionList = getSelectedOptionListBySet(optionSet);
        const optionTotal = selectedOptionList.reduce(
            (optionSum, option) => optionSum + Number(option.o_price || 0),
            0
        );

        return sum + (Number(furniture.f_dprice || 0) + optionTotal) * Number(optionSet.quantity || 1);
    }, 0);

    const reviewList = furniture.reviewList || furniture.reviews || [];

    const calculatedReviewAverage =
        reviewList.length > 0
            ? reviewList.reduce(
                (sum, review) => sum + Number(review.fr_star || review.star || 0),
                0
            ) / reviewList.length
            : 0;

    const reviewAverage = Number(
        articleReviewSummary?.average ??
        furniture.reviewAverage ??
        furniture.reviewAvg ??
        furniture.avgStar ??
        furniture.fr_star_avg ??
        calculatedReviewAverage ??
        0
    );

    const reviewCount = Number(
        articleReviewSummary?.count ??
        furniture.reviewCount ??
        furniture.review_count ??
        furniture.fr_review_count ??
        reviewList.length ??
        0
    );

    const qnaCount = Number(
        articleQnaCount ??
        furniture.questionCount ??
        furniture.qnaCount ??
        furniture.qna_count ??
        0
    );

    const roundedStar = Math.round(reviewAverage);

    const hasCoupon =
        furniture.hasCoupon === true ||
        furniture.couponAvailable === true ||
        Number(furniture.couponCount ?? furniture.coupon_count ?? 0) > 0;

    const onShare = async () => {
        const shareUrl = window.location.href;

        try {
            await navigator.clipboard.writeText(shareUrl);

            showAlert({
                severity: "success",
                title: "링크 복사 완료",
                text: "현재 상품 주소가 복사되었습니다.",
            });
        } catch (error) {
            console.error("주소 복사 실패", error);

            showAlert({
                severity: "error",
                title: "복사 실패",
                text: "주소 복사에 실패했습니다.",
            });
        }
    };

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

        <div className="furniture-article-page">
            <DialogInside
                open={couponDialog}
                onClose={() => setCouponDialog(false)}
            >
                <CouponArticleDownload
                    c_id={furniture.c_id}
                    catagory={getFurnitureCategoryCode(furniture.f_catagory1)}
                />
            </DialogInside>

            <nav className="furniture-breadcrumb" aria-label="쇼핑 경로">
                <button type="button" onClick={onGoHome}>
                    <GoHomeFill/> 홈
                </button>
                /
                <button type="button" onClick={onGoShopping}>
                    쇼핑 
                </button>
                / {furniture.f_name}
            </nav>

            <div className="furniture-article-card">
                <div className="furniture-article-gallery">
                    <div className="furniture-image-area">
                        <div className="furniture-thumb-list">
                            {orderedThumbInfo.map((image, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    className={
                                        mainImage?.img_name === image.img_name
                                            ? "furniture-thumb active"
                                            : "furniture-thumb"
                                    }
                                    onClick={() => setMainImage(image)}
                                >
                                    <img
                                        src={`/api/images/FURNITURE/${image.img_name}`}
                                        alt=""
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="furniture-main-image-wrap">
                            <img
                                src={
                                    mainImage?.img_name
                                        ? `/api/images/FURNITURE/${mainImage.img_name}`
                                        : "/no-image.png"
                                }
                                className="furniture-main-image"
                                alt={furniture.f_name}
                            />
                        </div>
                    </div>
                </div>

                <div className="furniture-article-info">
                    <div className="furniture-article-info-top">
                        <div>
                            <p className="furniture-company-name">{furniture.c_name}</p>
                            <h2>{furniture.f_name}</h2>
                        </div>

                       <div className="furniture-article-actions">
                        {isManager ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onUpdate}
                                    className="article-icon-action manager-icon-action"
                                    aria-label="상품 수정"
                                    title="상품 수정"
                                >
                                    <FaPen />
                                </button>

                                <button
                                    type="button"
                                    className="article-icon-action manager-icon-action danger"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    aria-label="상품 삭제"
                                    title="상품 삭제"
                                >
                                    <FaTrashAlt />
                                </button>
                            </>
                        ) : (
                            showUserActions && (
                                <>
                                    <button
                                        type="button"
                                        disabled={liking}
                                        onClick={onToggleLike}
                                        className={liked ? "article-icon-action active-like" : "article-icon-action"}
                                    >
                                        {liked ? (
                                            <FavoriteOutlinedIcon fontSize="small" />
                                        ) : (
                                            <FavoriteBorderOutlinedIcon fontSize="small" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="article-icon-action"
                                        onClick={onShare}
                                    >
                                        <FaShareAlt />
                                    </button>
                                </>
                            )
                        )}
                    </div>
                    </div>

                    <div className="furniture-review-line">
                        <span className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= roundedStar ? "active" : ""}
                                >
                                    ★
                                </span>
                            ))}
                        </span>

                        <button type="button" onClick={() => setTab("review")}>
                            {reviewCount.toLocaleString()}개 리뷰
                        </button>
                    </div>

                <div className="furniture-price-area">
                    <div className="furniture-price-sub">
                        <span className="original-price">
                            {Number(furniture.f_price || 0).toLocaleString()}원
                        </span>
                    </div>

                    <div className="furniture-price-main">
                        <strong>{Number(furniture.f_dprice || 0).toLocaleString()}</strong>
                        <span>원</span>
                        <em>{furniture.f_discount}%</em>
                    </div>
                </div>

                <div className={hasCoupon ? "furniture-coupon-box" : "furniture-coupon-box disabled"}>
                    <div>
                        <strong>{hasCoupon ? "쿠폰이 있어요" : "적용 가능한 쿠폰이 없습니다"}</strong>
                        <span>
                            {hasCoupon
                                ? "사용 가능한 할인 쿠폰을 확인해보세요."
                                : "현재 이 상품에 사용할 수 있는 쿠폰이 없습니다."}
                        </span>
                    </div>

                    {hasCoupon && (
                        <button type="button" onClick={() => setCouponDialog(true)}>
                            쿠폰 모두받기
                        </button>
                    )}
                </div>

                    <div className="furniture-benefit-list">
                        <div className="furniture-benefit-item">
                            <div className="benefit-icon">
                                <LocalShippingOutlinedIcon />
                            </div>

                            <div className="benefit-copy">
                                <span>배송비</span>
                                <strong>
                                    {deliveryPrice === 0
                                        ? "무료배송"
                                        : `${deliveryPrice.toLocaleString()}원`}
                                </strong>
                                <small>일반택배</small>
                            </div>
                        </div>

                        <div className="furniture-benefit-item">
                            <div className="benefit-icon">
                                <SavingsOutlinedIcon />
                            </div>

                            <div className="benefit-copy">
                                <span>구매 확정 시 적립</span>
                                <strong>
                                    최대 {Number(furniture.f_point || 0).toLocaleString()}P 적립
                                </strong>
                            </div>
                        </div>
                    </div>

                    {isSoldOut && (
                        <div className="furniture-soldout-box">
                            현재 품절된 상품입니다.
                        </div>
                    )}

                    <div className="furniture-option-area">
                        {hasOptions ? (
                            <>
                                {selectedOptionSets.map((optionSet, setIndex) => (
                                    <div key={setIndex} className="furniture-option-set">
                                        {Object.entries(optionGroups).map(([groupName, groupOptions]) => (
                                            <select
                                                key={groupName}
                                                value={optionSet.selectedOptions[groupName] || ""}
                                                onChange={(evt) =>
                                                    changeOptionSet(setIndex, groupName, evt.target.value)
                                                }
                                            >
                                                <option value="">{groupName}을 선택해주세요</option>

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
                                                        {Number(option.o_count) <= 0 ? " 품절" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        ))}

                                        <div className="furniture-quantity-row">
                                            <div className="furniture-quantity-stepper">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeOptionSetQuantity(setIndex, optionSet.quantity - 1)
                                                    }
                                                >
                                                    −
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
                                                    className="remove-option-set"
                                                    onClick={() => removeOptionSet(setIndex)}
                                                    aria-label="옵션 삭제"
                                                    title="옵션 삭제"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="add-option-set"
                                    onClick={addOptionSet}
                                >
                                    옵션 추가
                                </button>
                            </>
                        ) : (
                            <div className="furniture-option-set quantity-only">
                               <div className="furniture-quantity-row">
                                <div className="furniture-quantity-stepper">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeOptionSetQuantity(0, selectedOptionSets[0].quantity - 1)
                                        }
                                    >
                                        −
                                    </button>

                                    <span>{selectedOptionSets[0].quantity}</span>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const limit = getOptionSetStockLimit(selectedOptionSets[0]);

                                            if (selectedOptionSets[0].quantity >= limit) {
                                                showAlert({
                                                    severity: "warning",
                                                    title: "재고 초과",
                                                    text: "재고 수량을 초과할 수 없습니다.",
                                                });
                                                return;
                                            }

                                            changeOptionSetQuantity(0, selectedOptionSets[0].quantity + 1);
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>

                    <div className="furniture-order-total">
                        <span>주문금액</span>
                        <strong>{articleOrderTotal.toLocaleString()}원</strong>
                    </div>

                    <div className="furniture-buy-actions">
                        <button
                            type="button"
                            disabled={isSoldOut || addingCart}
                            onClick={onAddCart}
                        >
                            장바구니 담기
                        </button>

                        <button
                            type="button"
                            className="primary"
                            disabled={isSoldOut || buyingNow}
                            onClick={onPayment}
                        >
                            바로 구매하기
                        </button>
                    </div>
                </div>
            </div>

            <div className="furniture-article-tabs">
                <button
                    type="button"
                    onClick={() => setTab("detail")}
                    className={tab === "detail" ? "active" : ""}
                >
                    상세보기
                </button>

                <button
                    type="button"
                    onClick={() => setTab("review")}
                    className={tab === "review" ? "active" : ""}
                >
                    리뷰 {reviewCount.toLocaleString()}
                </button>

                <button
                    type="button"
                    onClick={() => setTab("qna")}
                    className={tab === "qna" ? "active" : ""}
                >
                    문의 {qnaCount.toLocaleString()}
                </button>
            </div>

            <div className="furniture-article-content">
                {tab === "detail" && (
                    <div>
                        {othersImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={`/api/images/FURNITURE/${img.img_name}`}
                                alt=""
                            />
                        ))}
                    </div>
                )}

                {tab === "review" && (
                    <div className="furniture-article-panel">
                        <FurnitureReview f_code={f_code} />
                    </div>
                )}

                {tab === "qna" && (
                    <div className="furniture-article-panel">
                        <Question f_code={f_code} furniture={furniture} />
                    </div>
                )}
            </div>
        </div>

    </>
    );
};

export default FurnitureArticle;

