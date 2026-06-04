import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Pagination, Snackbar } from "@mui/material";

import PaymentService from "../service/paymentService";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";
import ImageService from "../service/imageService";

import SkeletonMui from "../components/SkeletonMui";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

import OrderClaimModal from "./OrderClaimModal";
import ImageViewer from "../components/ImageViewer";

import "../css/UserOrderPage.css"

const UserOrderPage = ({ user, loadPoint, loadWallet }) => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1)
    const pageSize = 5;
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
    const [orderDetailItem, setOrderDetailItem] = useState(null);

    useEffect(()=>{
        setPage(1)
    },[statusFilter])

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

    const openClaimViewer = async (item) => {
        if (!item.claimed || !item.claim_code) return;

        try {
            const imageList = await ImageService.getImageData({
                kind: "CLAIM",
                a: item.claim_code,
                d: id,
                idx: -1,
            });

            const images = (imageList || []).map((img) => ({
                src: img.img_name?.startsWith("/api/")
                    ? img.img_name
                    : `/api/images/CLAIM/${img.img_name}`,
                alt: "신청 첨부 이미지",
            }));

            setReviewViewerImages(
                images.length > 0
                    ? images
                    : [{ src: "/no-image.png", alt: "첨부 이미지 없음" }]
            );

            setReviewViewerIndex(0);
            setReviewViewerInfo({
                title: Number(item.claim_type) === 1 ? "교환 신청 내용" : "반품/환불 신청 내용",
                content: item.claim_reason || "신청 사유가 없습니다.",
                date: formatOrderDate(item.claim_createdDate || item.cart_statusdate),
                writer: id || "",
                star: 0,
                reply: null,
            });

            setReviewViewerOpen(true);
        } catch (error) {
            console.error("신청 이미지 조회 실패", error);
            showAlert({
                severity: "error",
                title: "이미지 조회 실패",
                text: "신청 내용을 불러오지 못했습니다.",
            });
        }
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

    const getStatusClass = (status) => {
        switch (Number(status)) {
            case -2:
                return "rejected";
            case -1:
                return "cancel";
            case 0:
                return "paid";
            case 1:
                return "ready";
            case 2:
                return "release";
            case 3:
                return "shipping";
            case 4:
                return "delivered";
            case 5:
                return "confirmed";
            case 6:
                return "exchange";
            default:
                return "unknown";
        }
    };

    const getClaimTypeLabel = (claimType) => {
        return Number(claimType) === 1 ? "교환" : "반품/환불";
    };

    const getClaimStatusText = (claimStatus) => {
        switch (Number(claimStatus)) {
            case -1:
                return "신청거절";
            case 0:
                return "신청완료";
            case 1:
                return "접수완료";
            case 2:
                return "처리중";
            case 3:
                return "처리완료";
            default:
                return "확인중";
        }
    };

    const getClaimStepIndex = (claimStatus) => {
        const status = Number(claimStatus);
        if (status < 0) return -1;
        if (status > 3) return 3;
        return status;
    };

    const getOptionText = (item) => {
        const text = (item.options || [])
            .map((option) => {
                const select = option.co_select || "";
                const optionText = option.co_text || "";
                return [select, optionText].filter(Boolean).join(" ");
            })
            .filter(Boolean)
            .join(" / ");

        return text || "옵션 없음";
    };

    const getPointDiscount = (item) => {
        return Number(item?.f_point || item?.point || item?.used_point || item?.pay_point || 0);
    };

    const getFinalPaymentAmount = (item) => {
        return Math.max(0, getItemTotal(item) - getPointDiscount(item));
    };

    const getReceiverName = (item) =>
        item?.f_name || item?.receiver_name || user?.name || "-";

    const getReceiverTel = (item) =>
        item?.f_tel || item?.receiver_tel || user?.tel || "-";

    const getReceiverAddress = (item) =>
        item?.f_addr || item?.receiver_addr || user?.addr || "-";

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
            label: "주문완료",
            count: countByStatus(0) + countByStatus(1),
            icon: "/order/bag_icon.png",
            iconClass: "bag",
        },
        {
            key: 2,
            label: "출고",
            count: countByStatus(2),
            icon: "/order/box_icon.png",
            iconClass: "box",
        },
        {
            key: 3,
            label: "배송중",
            count: countByStatus(3),
            icon: "/order/truck_icon.png",
            iconClass: "truck",
        },
        {
            key: 4,
            label: "배송완료",
            count: countByStatus(4),
            icon: "/order/checkBox_icon.png",
            iconClass: "delivered",
        },
        {
            key: 5,
            label: "구매확정",
            count: countByStatus(5),
            icon: "/order/confirm_icon.png",
            iconClass: "confirm",
        },
    ];

    const claimCards = [
        {
            key: -1,
            label: "취소",
            count: countByStatus(-1),
            icon: "/order/cancel_icon.png",
            iconClass: "cancel",
        },
        {
            key: "exchange",
            label: "교환",
            count: countByClaimType(1),
            icon: "/order/exchange_icon.png",
            iconClass: "exchange",
        },
        {
            key: "return",
            label: "반품/환불",
            count: countByClaimType(2),
            icon: "/order/refund_icon.png",
            iconClass: "refund",
        },
    ];

    const claimFilterKeys = [-1, "exchange", "return"];
    const isClaimView = claimFilterKeys.includes(statusFilter);

    const filteredOrders = getFilteredOrders();

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const pagedOrders = filteredOrders.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    if (loading) {
        return <SkeletonMui variant="userOrderPage" />;
    }

    return (
        <div className="user-order-page">
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
            
           <section className="order-dashboard-card">
                <div className="order-mode-tabs">
                    <button
                        type="button"
                        className={!isClaimView ? "active" : ""}
                        onClick={() => setStatusFilter("all")}
                    >
                        주문/배송
                    </button>

                    <button
                        type="button"
                        className={isClaimView ? "active" : ""}
                        onClick={() => setStatusFilter(-1)}
                    >
                        취소 · 교환 · 반품
                    </button>
                </div>

                {!isClaimView ? (
                    <div className="order-status-summary">
                        {statusCards.map((status) => (
                            <button
                                key={status.key}
                                type="button"
                                className={`order-status-item ${
                                    statusFilter === status.key ? "active" : ""
                                }`}
                                onClick={() => setStatusFilter(status.key)}
                            >
                                <span className={`order-status-icon ${status.iconClass}`}>
                                    <img src={status.icon} alt={status.label} />
                                </span>
                                <strong className="order-status-count">{status.count}</strong>
                                <span className="order-status-label">{status.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="order-status-summary claim">
                        {claimCards.map((claim) => (
                            <button
                                key={claim.key}
                                type="button"
                                className={`order-status-item ${
                                    statusFilter === claim.key ? "active" : ""
                                }`}
                                onClick={() => setStatusFilter(claim.key)}
                            >
                                <span className={`order-status-icon ${claim.iconClass}`}>
                                    <img src={claim.icon} alt={claim.label} />
                                </span>
                                <strong className="order-status-count">{claim.count}</strong>
                                <span className="order-status-label">{claim.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
           
                        <section className="order-result-panel">
                            <div className="order-list-head">
                                <h3>{getOrderListTitle()}</h3>

                                <button
                                    type="button"
                                    className={`order-all-button ${statusFilter === "all" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("all")}
                                >
                                    전체보기
                                </button>
                            </div>

                            <div className="order-list">
                                {filteredOrders.length === 0 ? (
                                    <div className="order-empty">
                                        {getEmptyOrderText()}
                                    </div>
                                ) : (
                                    pagedOrders.map((item) => {
                                        const claimStepIndex = getClaimStepIndex(item.claim_status);
                                        const claimSteps = ["신청완료", "접수완료", "처리중", "처리완료"];
                                        const isClaimItem = item.claimed && !isClaimRejected(item);

                                        return (
                                        <article key={item.c_code} className={`order-row-card ${isClaimItem ? "claim-row" : ""}`}>
                                            <div className="order-row-date">
                                                <div className="order-row-date-left">
                                                    <span>{formatOrderDate(item.cart_statusdate)}</span>

                                                    {!isClaimItem && (
                                                        <span className={`order-row-status ${getStatusClass(item.f_dstatus)}`}>
                                                            {getStatusText(item.f_dstatus)}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="order-detail-link"
                                                    onClick={() => setOrderDetailItem(item)}
                                                >
                                                    » 주문 상세 보기
                                                </button>
                                            </div>

                                            <div className="order-row-code">
                                                주문번호 {item.c_code}
                                            </div>

                                            <div className="order-row-main">
                                                <button
                                                    type="button"
                                                    className="order-row-thumb"
                                                    onClick={() => navigate(`/furniture/article/${item.f_code}`)}
                                                >
                                                    <img
                                                        src={item.thumbnail ? `/api/images/FURNITURE/${item.thumbnail}` : "/no-image.png"}
                                                        alt={item.furniture?.f_name || item.f_code}
                                                    />
                                                </button>

                                                <div className="order-row-info">
                                                    <button
                                                        type="button"
                                                        className="order-row-title"
                                                        onClick={() => navigate(`/furniture/article/${item.f_code}`)}
                                                    >
                                                        {item.furniture?.f_name || item.f_code}
                                                    </button>

                                                    <div className="order-row-price">
                                                        <strong>{getItemTotal(item).toLocaleString()}원</strong>
                                                        <span>수량 {item.f_count}개</span>
                                                    </div>

                                                    <div className="order-row-options">
                                                        {getOptionText(item)}
                                                    </div>
                                                </div>

                                                <div className="order-row-actions">
                                                    {isClaimItem ? (
                                                        <>
                                                            <button type="button" onClick={() => openClaimViewer(item)}>
                                                                신청 내용 보기
                                                            </button>
                                                            <button type="button" disabled>
                                                                {getClaimStatusText(item.claim_status)}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {Number(item.f_dstatus) === -1 && (
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading}
                                                                    onClick={() => onAddCanceledOrderToCart(item)}
                                                                >
                                                                    다시 장바구니 담기
                                                                </button>
                                                            )}

                                                            {[0, 1].includes(Number(item.f_dstatus)) && (
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading}
                                                                    onClick={() => onCancelOrder(item.c_code)}
                                                                >
                                                                    주문취소
                                                                </button>
                                                            )}

                                                            {Number(item.f_dstatus) === 3 && (
                                                                <button type="button">배송조회</button>
                                                            )}

                                                            {canConfirmOrder(item) && (
                                                                <button
                                                                    type="button"
                                                                    className="primary"
                                                                    disabled={actionLoading}
                                                                    onClick={() => onConfirmOrder(item.c_code)}
                                                                >
                                                                    구매확정
                                                                </button>
                                                            )}

                                                            {Number(item.f_dstatus) === 5 && (
                                                                item.reviewed ? (
                                                                    <button type="button" onClick={() => openReviewViewer(item)}>
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
                                                                    >
                                                                        리뷰 작성
                                                                    </button>
                                                                )
                                                            )}

                                                            {canShowClaimActions(item) && (
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
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {isClaimItem && (
                                                <div className={`order-claim-section ${Number(item.claim_type) === 1 ? "exchange" : "return"}`}>
                                                    <div className="order-claim-section-head">
                                                        <strong>
                                                            {getClaimTypeLabel(item.claim_type)} {getClaimStatusText(item.claim_status)}
                                                        </strong>
                                                    </div>

                                                    <div className="order-claim-steps">
                                                        {claimSteps.map((step, index) => (
                                                            <span
                                                                key={step}
                                                                className={index <= claimStepIndex ? "active" : ""}
                                                            >
                                                                {step}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    );
                                    })
                    )}
                </div>

                {filteredOrders.length > pageSize && (
                    <div className="order-pagination">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            color="primary"
                            shape="rounded"
                            size="small"
                        />
                    </div>
                )}
            </section>
                
            <Dialog
                open={!!orderDetailItem}
                onClose={() => setOrderDetailItem(null)}
                maxWidth="md"
                fullWidth
                className="order-detail-dialog"
            >
                {orderDetailItem && (
                    <div className="order-detail-modal">
                        <div className="order-detail-modal-head">
                            <div>
                                <h2>주문 상세 보기</h2>
                                <p>주문번호 {orderDetailItem.c_code}</p>
                            </div>

                            <span className={`order-detail-status ${getStatusClass(orderDetailItem.f_dstatus)}`}>
                                {getStatusText(orderDetailItem.f_dstatus)}
                            </span>
                        </div>

                        <div className="order-detail-modal-body">
                            <section className="order-detail-product">
                                <h3>상품 정보</h3>

                                <div className="order-detail-product-row">
                                    <div className="order-detail-thumb">
                                        <img
                                            src={
                                                orderDetailItem.thumbnail
                                                    ? `/api/images/FURNITURE/${orderDetailItem.thumbnail}`
                                                    : "/no-image.png"
                                            }
                                            alt={orderDetailItem.furniture?.f_name || orderDetailItem.f_code}
                                        />
                                    </div>

                                    <div>
                                        <strong>{orderDetailItem.furniture?.f_name || orderDetailItem.f_code}</strong>
                                        <p>{getOptionText(orderDetailItem)}</p>
                                        <span>
                                            {getItemTotal(orderDetailItem).toLocaleString()}원 | 수량 {orderDetailItem.f_count}개
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="order-detail-shipping">
                                <h3>배송 정보</h3>

                                <dl>
                                    <div>
                                        <dt>받는 사람</dt>
                                        <dd>{getReceiverName(orderDetailItem)}</dd>
                                    </div>
                                    <div>
                                        <dt>연락처</dt>
                                        <dd>{getReceiverTel(orderDetailItem)}</dd>
                                    </div>
                                    <div className="wide">
                                        <dt>배송지</dt>
                                        <dd>{getReceiverAddress(orderDetailItem)}</dd>
                                    </div>
                                </dl>
                            </section>

                            <aside className="order-detail-summary">
                                <section>
                                    <h3>결제 정보</h3>

                                    <dl>
                                        <div>
                                            <dt>상품금액</dt>
                                            <dd>{getItemTotal(orderDetailItem).toLocaleString()}원</dd>
                                        </div>
                                        <div>
                                            <dt>포인트 할인</dt>
                                            <dd className="minus">-{getPointDiscount(orderDetailItem).toLocaleString()}P</dd>
                                        </div>
                                        <div className="total">
                                            <dt>최종 결제금액</dt>
                                            <dd>{getFinalPaymentAmount(orderDetailItem).toLocaleString()}원</dd>
                                        </div>
                                    </dl>
                                </section>

                                <section>
                                    <h3>처리 정보</h3>

                                    <dl>
                                        <div>
                                            <dt>주문일시</dt>
                                            <dd>{formatOrderDate(orderDetailItem.cart_statusdate)}</dd>
                                        </div>
                                        <div>
                                            <dt>현재 상태</dt>
                                            <dd>{getStatusText(orderDetailItem.f_dstatus)}</dd>
                                        </div>
                                        {orderDetailItem.claimed && (
                                            <div>
                                                <dt>신청 상태</dt>
                                                <dd>
                                                    {getClaimTypeLabel(orderDetailItem.claim_type)} {getClaimStatusText(orderDetailItem.claim_status)}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </section>
                            </aside>
                        </div>

                        <div className="order-detail-modal-actions">
                            <button type="button" onClick={() => setOrderDetailItem(null)}>
                                닫기
                            </button>
                            <button type="button" className="primary" onClick={() => setOrderDetailItem(null)}>
                                확인
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

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
