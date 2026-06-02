import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";

import PaymentService from "../service/paymentService";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";
import ImageService from "../service/imageService";

import Loading from "../components/Loading";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

import OrderClaimInfo from "./OrderClaimInfo";
import OrderClaimModal from "./OrderClaimModal";
import ImageViewer from "../components/ImageViewer";

const UserOrderPage = ({ user, loadPoint, loadWallet }) => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [openedClaimImages, setOpenedClaimImages] = useState({})
    const [actionLoading, setActionLoading] = useState(false);
    const furnitureCacheRef = useRef(new Map());
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    });

    const [reviewViewerOpen, setReviewViewerOpen] = useState(false);
    const [reviewViewerImages, setReviewViewerImages] = useState([]);
    const [reviewViewerIndex, setReviewViewerIndex] = useState(0);
    const [reviewViewerInfo, setReviewViewerInfo] = useState({
        title: "",
        content: "",
        date: "",
        writer: "",
        star: 0,
        reply: null,
    });

    const openReviewViewer = async (item) => {
        const review = item.review;

        if (!review) {
            navigate(`/furniture/article/${item.f_code}?tab=review`);
            return;
        }

        const imageList = await ImageService.getImageData({
            kind: "F_REVIEW",
            a: item.c_code,
            d: item.id,
            idx: -1,
        })

        const images = (imageList || []).map((img) => ({
            src: img.img_name?.startsWith("/api/")
                ? img.img_name
                : `/api/images/F_REVIEW/${img.img_name}`,
            alt: review.fr_subject || "리뷰 이미지",
        }));

        setReviewViewerImages(
            images.length > 0
                ? images
                : [{ src: "/no-image.png", alt: "리뷰 이미지 없음" }]
        );

        setReviewViewerIndex(0);
        setReviewViewerInfo({
            title: review.fr_subject || "제목 없음",
            content: review.fr_content || "",
            date: formatOrderDate(
                review.fr_createdDate ||
                review.fr_createddate ||
                review.fr_date ||
                review.createdAt
            ),
            writer: review.id || item.id || "",
            star: review.fr_star || 0,
            reply: review.reply || null,
        });

        setReviewViewerOpen(true);
    };

    const isClaimRejected = (item) => Number(item.claim_status) === -1;

    const canShowClaimActions = (item) =>
        [4, 6, -2].includes(Number(item.f_dstatus));

    const canRequestExchange = (item) =>
        canShowClaimActions(item) &&
        (!item.claimed || isClaimRejected(item) || [6, -2].includes(Number(item.f_dstatus)));

    const canRequestReturn = (item) =>
        Number(item.f_dstatus) === 4 &&
        (!item.claimed || isClaimRejected(item));

    const canConfirmOrder = (item) =>
        [4, 6, -2].includes(Number(item.f_dstatus)) &&
        (!item.claimed || isClaimRejected(item));

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: "",
        text: "",
        confirmText: "확인",
        onConfirm: null,
    });
    const localUserData = JSON.parse(localStorage.getItem("user") || "{}");
    const id = user?.id || localUserData.id;

    const [claimModal, setClaimModal] = useState({
        open: false, 
        item: null,
        claim_type: null,
    })

    const openClaimModal = (item, claim_type) => {
        setClaimModal({
            open: true,
            item,
            claim_type
        })
    }

    const closeClaimModal = () => {
        setClaimModal({
            open: false,
            item: null,
            claim_type: null
        });
    };

    const showAlert = ({ severity = "info", title = "", text = "" }) => {
        setAlert({
            open: true,
            severity,
            title,
            text,
        });
    };

    const closeAlert = () => {
        setAlert(prev => ({
            ...prev,
            open: false,
        }));
    };

    const openConfirmDialog = ({ title, text, confirmText = "확인", onConfirm }) => {
        setConfirmDialog({
            open: true,
            title,
            text,
            confirmText,
            onConfirm,
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({
            ...prev,
            open: false,
        }));
    };

    const handleConfirmDialog = async () => {
        const action = confirmDialog.onConfirm;
        closeConfirmDialog();

        if (action) {
            await action();
        }
    };

    const toggleClaimImages = async (item) => {
        if (!item.claimed || !item.claim_code) return;

        if (openedClaimImages[item.claim_code]) {
            setOpenedClaimImages(prev => ({
                ...prev,
                [item.claim_code]: null
            }));
            return;
        }

        try {
            const imageList = await ImageService.getImageData({
              kind: "CLAIM",
              a: item.claim_code,
              d: id,
              idx: -1,
            });

            setOpenedClaimImages(prev => ({
                ...prev,
                [item.claim_code]: imageList || []
            }));
        } catch (error) {
            console.error("교환/반품 이미지 조회 실패", error);
            showAlert({
                severity: "error",
                title: "이미지 조회 실패",
                text: "첨부 이미지를 불러오지 못했습니다.",
            });
        }
    };

    useEffect(() => {
        if (!user?.id) return

        loadOrders();
    }, [user?.id]);

    const loadOrders = async () => {
        try {
            const res = await PaymentService.getMyOrders();
            const orderList = res.data || [];

            const ordersWithDetail = await Promise.all(
                orderList.map(async (item) => {
                    try {
                        let furniture = item.furniture;

                        if (!furniture?.imageList) {
                            let furniturePromise = furnitureCacheRef.current.get(item.f_code);

                            if (!furniturePromise) {
                                furniturePromise = FurnitureService.getFurnitureItem(item.f_code)
                                    .catch((error) => {
                                        console.error("주문 상품 정보 조회 실패", item.f_code, error);
                                        return null;
                                    });
                                furnitureCacheRef.current.set(item.f_code, furniturePromise);
                            }

                            furniture = await furniturePromise;
                        }

                        const thumbnail = furniture?.imageList?.find(
                            (img) => (img.img_tag || "").trim().toUpperCase() === "THUMBNAIL"
                        );

                        return {
                            ...item,
                            options: item.options || [],
                            furniture,
                            thumbnail: thumbnail?.img_name || null,
                            reviewed: item.reviewed || false,
                            claimed: item.claimed || false,
                            claim_type: item.claim_type || null,
                            claim_status: item.claim_status ?? null,
                            claim_code: item.claim_code || null,
                            claim_reason: item.claim_reason || "",
                        };
                    } catch (error) {
                        console.error("주문 상세 구성 실패", item.c_code, error);

                        return {
                            ...item,
                            options: item.options || [],
                            furniture: item.furniture || null,
                            thumbnail: null,
                            reviewed: item.reviewed || false,
                            claimed: item.claimed || false,
                            claim_type: item.claim_type || null,
                            claim_status: item.claim_status ?? null,
                            claim_code: item.claim_code || null,
                            claim_reason: item.claim_reason || "",
                        };
                    }
                })
            );

            setOrders(ordersWithDetail);
        } catch (error) {
            console.error("주문내역 조회 실패", error);
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    showAlert({
                        severity: "warning",
                        title: "로그인 만료",
                        text: "로그인이 만료되었습니다. 다시 로그인해주세요.",
                    });
                    setTimeout(() => {
                        navigate("/login");
                    }, 800);
                    return;
                }

                showAlert({
                    severity: "error",
                    title: "조회 실패",
                    text: "주문내역 조회에 실패했습니다.",
                });
        } finally {
            setLoading(false);
        }
    };

    const updateOrderLocal = (c_code, changes) => {
        setOrders(prev =>
            prev.map(item =>
                item.c_code === c_code
                    ? { ...item, ...changes }
                    : item
            )
        );
    };

    const handleClaimSuccess = ({ c_code, claim_type, claim_status, claim_code, claim_reason }) => {
        updateOrderLocal(c_code, {
            claimed: true,
            claim_type,
            claim_status,
            claim_code,
            claim_reason,
        });

        showAlert({
            severity: "success",
            title: claim_type === 1 ? "교환 신청 완료" : "반품 신청 완료",
            text: claim_type === 1
                ? "교환 신청이 접수되었습니다."
                : "반품 신청이 접수되었습니다.",
        });

        closeClaimModal();
    };

    const handleClaimError = (message) => {
        showAlert({
            severity: "error",
            title: "신청 실패",
            text: message,
        });
    };

    const getStatusText = (status) => {
        switch (Number(status)) {
            case -2:
                return "반품 거절";
            case -1:
                return "주문취소";
            case 0:
                return "결제완료";
            case 1:
                return "배송접수";
            case 2:
                return "출고";
            case 3:
                return "배송중";
            case 4:
                return "배송완료";
            case 5:
                return "구매확정";
            case 6:
                return "교환 완료";
            default:
                return "상태확인중";
        }
    };

    const getOrderListTitle = () => {
        switch (statusFilter) {
            case "all":
                return "주문내역 조회";
            case "ready":
                return "주문 완료 내역 조회";
            case 2:
                return "출고 내역 조회";
            case 3:
                return "배송 내역 조회";
            case 4:
                return "배송완료 내역 조회";
            case 5:
                return "구매확정 내역 조회";
            case -1:
                return "취소 내역 조회";
            case "exchange":
                return "교환 내역 조회";
            case "return":
                return "반품/환불 내역 조회";
            default:
                return "주문내역 조회";
        }
    };

    const getEmptyOrderText = () => {
        switch (statusFilter) {
            case "all":
                return "주문 내역이 없습니다.";
            case "ready":
                return "배송 준비중 내역이 없습니다.";
            case 2:
                return "출고 내역이 없습니다.";
            case 3:
                return "배송 내역이 없습니다.";
            case 4:
                return "배송완료 내역이 없습니다.";
            case 5:
                return "구매확정 내역이 없습니다.";
            case -1:
                return "취소 내역이 없습니다.";
            case "exchange":
                return "교환 내역이 없습니다.";
            case "return":
                return "반품/환불 내역이 없습니다.";
            default:
                return "주문 내역이 없습니다.";
        }
    };

    const formatOrderDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "-";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");

        return `${year}.${month}.${day} ${hour}:${minute}`;
    };

    const onCancelOrder = async (c_code) => {
        if (actionLoading) return

        openConfirmDialog({
            title: "주문취소",
            text: "주문을 취소하시겠습니까? 결제금액은 지갑으로 환불됩니다.",
            confirmText: "주문취소",
            onConfirm: () => cancelOrder(c_code),
        });
    };

    const cancelOrder = async (c_code) => {
        try {
            setActionLoading(true);

            await PaymentService.cancelOrder(c_code);

            updateOrderLocal(c_code, {
                f_dstatus: -1,
                claimed: false,
                claim_type: null,
                claim_status: null,
                claim_code: null,
                claim_reason: "",
            });

            setStatusFilter(-1);
            await loadPoint?.();
            await loadWallet?.();

            showAlert({
                severity: "success",
                title: "취소 완료",
                text: "주문이 취소되었습니다.",
            });
        } catch (error) {
            console.error("주문취소 실패", error);
            showAlert({
                severity: "error",
                title: "취소 실패",
                text: error.response?.data?.message || "주문취소에 실패했습니다.",
            });
        } finally {
            setActionLoading(false);
        }
    };

    const onAddCanceledOrderToCart = async (item) => {
        if (actionLoading) return;

        openConfirmDialog({
            title: "장바구니 담기",
            text: "취소된 상품을 다시 장바구니에 담으시겠습니까?",
            confirmText: "담기",
            onConfirm: () => addCanceledOrderToCart(item),
        });
    };

    const addCanceledOrderToCart = async (item) => {
        try {
            setActionLoading(true)

            console.log("다시담기 item", item)
            console.log("다시담기 item.options", item.options)

            const payload = {
                cart: {
                    f_code: item.f_code,
                    f_count: item.f_count,
                    f_addr: item.f_addr || user?.addr || "",
                    f_name: item.f_name || user?.name || "",
                    f_tel: item.f_tel || user?.tel || "",
                    f_price: item.f_price,
                    f_point: item.f_point,
                },
                options: (item.options || []).map((option) => ({
                    co_select: option.co_select,
                    co_text: option.co_text,
                    co_count: option.co_count || item.f_count,
                    co_price: option.co_price || 0,
                })),
            };

            console.log("다시담기 payload", JSON.stringify(payload, null, 2));

            await CartService.addCart(payload);

            showAlert({
                severity: "success",
                title: "담기 완료",
                text: "장바구니에 다시 담았습니다.",
            });
            navigate("/cart");

        } catch (error) {
            console.error("장바구니 담기 실패", error);

            const errorMessage =
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message || "장바구니 담기에 실패했습니다.";

            showAlert({
                severity: "error",
                title: "담기 실패",
                text: errorMessage,
            });

            if (errorMessage.includes("옵션")) {
                setTimeout(() => {
                    navigate(`/furniture/article/${item.f_code}`);
                }, 1000);
            }
            
        } finally {
            setActionLoading(false)
        }
    };

    const getItemTotal = (item) => {
        const optionTotal = (item.options || []).reduce(
            (sum, option) => sum + Number(option.co_price || 0),
            0
        );

        return (Number(item.f_price || 0) + optionTotal) * Number(item.f_count || 0);
    };

    const countByStatus = (status) => {
        return orders.filter(item => Number(item.f_dstatus) === status).length;
    };

    const countByClaimType = (claimType) => {
        return orders.filter(item =>
            item.claimed && Number(item.claim_type) === claimType
        ).length
    }
    const getFilteredOrders = () => {
        if (statusFilter === "all") return orders;

        if (statusFilter === "ready") {
            return orders.filter(item =>
                [0, 1].includes(Number(item.f_dstatus))
            );
        }

        if (statusFilter === "exchange") {
            return orders.filter(item =>
                item.claimed && Number(item.claim_type) === 1
            );
        }

        if (statusFilter === "return") {
            return orders.filter(item =>
                item.claimed && Number(item.claim_type) === 2
            );
        }

        return orders.filter(item => Number(item.f_dstatus) === Number(statusFilter));
    };

    const onConfirmOrder = async (c_code) => {
        if (actionLoading) return

        openConfirmDialog({
            title: "구매확정",
            text: "구매확정 하시겠습니까?",
            confirmText: "구매확정",
            onConfirm: () => confirmOrder(c_code),
        });
    };

    const confirmOrder = async (c_code) => {
        try {
            setActionLoading(true);

            await PaymentService.confirmOrder(c_code);

            updateOrderLocal(c_code, {
                f_dstatus: 5,
                reviewed: false,
                claimed: false,
                claim_type: null,
                claim_status: null,
                claim_code: null,
                claim_reason: "",
            });

            setStatusFilter(5);
            await loadPoint?.();
            await loadWallet?.();

            showAlert({
                severity: "success",
                title: "구매확정 완료",
                text: "구매확정 되었습니다.",
            });
        } catch (error) {
            console.error("구매확정 실패", error);
            showAlert({
                severity: "error",
                title: "구매확정 실패",
                text: error.response?.data?.message || "구매확정에 실패했습니다.",
            });
        } finally {
            setActionLoading(false);
        }
    };

    const statusCards = [
        {
            key: "ready",
            label: "주문 완료",
            count: countByStatus(0) + countByStatus(1)
        },
        {
            key: 2,
            label: "출고",
            count: countByStatus(2)
        },
        {
            key: 3,
            label: "배송중",
            count: countByStatus(3)
        },
        {
            key: 4,
            label: "배송완료",
            count: countByStatus(4) 
        },
        {
            key: 5,
            label: "구매확정",
            count: countByStatus(5)
        }
    ];

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return <Loading message="주문 정보를 불러오는 중입니다."/>;
    }

    return (
        <div style={{ padding: "20px" }}>
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
                        onClick: closeConfirmDialog,
                    },
                    {
                        title: confirmDialog.confirmText,
                        color: "primary",
                        variant: "contained",
                        disabled: actionLoading,
                        onClick: handleConfirmDialog,
                    },
                ]}
            />
            

            <div
                style={{
                    borderTop: "2px solid #222",
                    padding: "32px 0",
                    display: "grid",
                    gridTemplateColumns: "1fr 30px 1fr 30px 1fr 30px 1fr 30px 1fr",
                    alignItems: "center",
                    textAlign: "center"
                }}
            >
                {statusCards.map((status, index) => (
                    <React.Fragment key={status.key}>
                        <button
                            type="button"
                            onClick={() => setStatusFilter(status.key)}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: statusFilter === status.key ? "black" : "#555"
                            }}
                        >
                            <strong style={{ fontSize: "24px" }}>
                                {status.count}
                            </strong>
                            <p>{status.label}</p>
                        </button>

                        {index < statusCards.length - 1 && (
                            <div style={{ color: "#ddd", fontSize: "32px" }}>›</div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    border: "1px solid #ddd",
                    textAlign: "center",
                    marginBottom: "30px"
                }}
            >

                <button
                    type="button"
                    onClick={() => setStatusFilter(-1)}
                    style={{
                        padding: "18px",
                        border: "none",
                        borderRight: "1px solid #ddd",
                        background: statusFilter === -1 ? "black" : "white",
                        color: statusFilter === -1 ? "white" : "black",
                        cursor: "pointer"
                    }}
                >
                    취소 : {countByStatus(-1)}
                </button>

                <button
                    type="button"
                    onClick={()=> setStatusFilter("exchange")}
                    style={{
                        padding: "18px",
                        border: "none",
                        borderRight: "1px solid #ddd",
                        background: statusFilter === "exchange" ? "black" : "white",
                        color: statusFilter === "exchange" ? "white" : "black",
                        cursor: "pointer"
                    }}
                >
                    교환 : {countByClaimType(1)}
                </button>

                <button
                    type="button"
                    onClick={()=> setStatusFilter("return")}
                    style={{
                        padding: "18px",
                        border: "none",
                        background: statusFilter === "return" ? "black" : "white",
                        color: statusFilter === "return" ? "white" : "black",
                        cursor: "pointer"
                    }}
                >
                    반품 / 환불 : {countByClaimType(2)}
                </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ margin: 0 }}>{getOrderListTitle()}</h3>

                <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    style={{
                        border: "1px solid #ddd",
                        background: statusFilter === "all" ? "black" : "white",
                        color: statusFilter === "all" ? "white" : "black",
                        padding: "8px 14px",
                        cursor: "pointer"
                    }}
                >
                    전체보기
                </button>
            </div>

            <div style={{ borderTop: "2px solid #222" }}>
                {filteredOrders.length === 0 ? (
                    <div
                        style={{
                            padding: "50px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd"
                        }}
                    >
                        {getEmptyOrderText()}
                    </div>
                ) : (
                    filteredOrders.map((item) => (
                        <div key={item.c_code} style={{ borderBottom: "1px solid #ddd" }}>
                            <div
                                style={{
                                    background: "#f7f7f7",
                                    padding: "16px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                            <strong>
                                {formatOrderDate(item.cart_statusdate)}
                            </strong>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "22px",
                                    padding: "26px 16px"
                                }}
                            >
                                <img
                                onClick={() => navigate(`/furniture/article/${item.f_code}`)}
                                src={
                                    item.thumbnail
                                        ? `/api/images/FURNITURE/${item.thumbnail}`
                                        : "/no-image.png"
                                }
                                alt={item.furniture?.f_name || item.f_code}
                                style={{
                                    width: "105px",
                                    height: "105px",
                                    objectFit: "cover",
                                    cursor: "pointer"
                                }}
                            />


                                <div style={{ flex: 1 }}>
                                    <p
                                        style={{ marginTop: 0, cursor: "pointer" }}
                                        onClick={() => navigate(`/furniture/article/${item.f_code}`)}
                                    >
                                        <strong>{item.furniture?.f_name || item.f_code}</strong>
                                    </p>

                                    <p>
                                        {getItemTotal(item).toLocaleString()}원 ({item.f_count}개)
                                    </p>

                                    {(item.options || []).map((option, index) => (
                                        <p key={index}>
                                            [옵션: {option.co_select} - {option.co_text}]
                                        </p>
                                    ))}

                                    <p>수령인: {item.f_name}</p>
                                    <p>연락처: {item.f_tel}</p>
                                    <p>배송지: {item.f_addr}</p>

                                    <p>주문상태: {getStatusText(item.f_dstatus)}</p>

                                    <OrderClaimInfo
                                    item={item}
                                    openedImages={openedClaimImages[item.claim_code]}
                                    onToggleImages={toggleClaimImages}
                                    />


                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                            {Number(item.f_dstatus) === -1 && (() => {
                                const hasOptions = (item.options || []).length > 0
                                const isSoldOut = 
                                    !hasOptions &&
                                    Number(item.furniture?.f_count ?? item.f_count ?? 0) <= 0
                                
                                return isSoldOut ? (
                                <button type="button" disabled>
                                    품절
                                </button>
                                ) : (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => onAddCanceledOrderToCart(item)}
                                >
                                    다시 장바구니 담기
                                </button>
                                )
                            })()}

                            {[0, 1].includes(Number(item.f_dstatus)) && (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => onCancelOrder(item.c_code)}
                                >
                                    주문취소
                                </button>
                            )}

                            {canShowClaimActions(item) && (
                            item.claimed && !isClaimRejected(item) ? (
                                <button type="button" disabled>
                                    {Number(item.claim_type) === 1 ? "교환" : "반품(환불)"}{" "}
                                    {Number(item.claim_status) === 0
                                        ? "신청완료"
                                        : Number(item.claim_status) === 1
                                        ? "접수완료"
                                        : Number(item.claim_status) === 2
                                        ? "처리중"
                                        : Number(item.claim_status) === 3
                                        ? "처리완료"
                                        : "상태확인중"}
                                </button>
                            ) : (
                                <>
                                    {canRequestExchange(item) && (
                                        <button type="button" onClick={() => openClaimModal(item, 1)}>
                                            교환신청
                                        </button>
                                    )}

                                    {canRequestReturn(item) && (
                                        <button type="button" onClick={() => openClaimModal(item, 2)}>
                                            반품/환불 신청
                                        </button>
                                    )}
                                </>
                            )
                        )}

                            {Number(item.f_dstatus) === 3 && (
                                <button type="button">
                                    배송조회
                                </button>
                            )}

                            {canConfirmOrder(item) && (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => onConfirmOrder(item.c_code)}
                                    style={{
                                        background: "black",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    구매확정
                                </button>
                            )}

                            {Number(item.f_dstatus) === 5 && (
                            item.reviewed ? (
                                <button
                                    type="button"
                                    onClick={() => openReviewViewer(item)}
                                    style={{
                                        background: "white",
                                        color: "black",
                                        border: "1px solid #ddd",
                                        padding: "8px 16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    리뷰 보기
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/furniture/review/${item.f_code}`, {
                                        state: {
                                            c_code: item.c_code,
                                            furniture: item.furniture,
                                            thumbnail: item.thumbnail,
                                        }
                                    })}
                                    style={{
                                        background: "black",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    리뷰 쓰기
                                </button>
                            )
                        )}

                        </div>

                            </div>

                    ))
                )}
            </div>

            <OrderClaimModal
                open={claimModal.open}
                item={claimModal.item}
                claimType={claimModal.claim_type}
                onClose={closeClaimModal}
                onSuccess={handleClaimSuccess}
                onError={handleClaimError}
            />

            <ImageViewer
                open={reviewViewerOpen}
                images={reviewViewerImages}
                startIndex={reviewViewerIndex}
                title={reviewViewerInfo.title}
                content={reviewViewerInfo.content}
                date={reviewViewerInfo.date}
                writer={reviewViewerInfo.writer}
                star={reviewViewerInfo.star}
                reply={reviewViewerInfo.reply}
                onClose={() => setReviewViewerOpen(false)}
            />

        </div>
    );
};

export default UserOrderPage;
