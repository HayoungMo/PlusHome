import React, { useEffect, useState } from "react";
import PaymentService from "../service/paymentService";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const UserOrderPage = ({ user }) => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await PaymentService.getMyOrders();
            const orderList = res.data || [];

            const ordersWithDetail = await Promise.all(
                orderList.map(async (item) => {
                    const optionRes = await CartService.getCartOptions(item.c_code);
                    const furniture = await FurnitureService.getFurnitureItem(item.f_code);

                    const thumbnail = furniture.imageList?.find(
                        img => img.img_tag === "THUMBNAIL"
                    );

                    return {
                        ...item,
                        options: optionRes.data || [],
                        furniture,
                        thumbnail: thumbnail?.img_name || null
                    };
                })
            );

            setOrders(ordersWithDetail);
        } catch (error) {
            console.error("주문내역 조회 실패", error);
            alert("주문내역 조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (Number(status)) {
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
            default:
                return "상태확인중";
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
        if (!window.confirm("주문을 취소하시겠습니까? 결제금액은 지갑으로 환불됩니다.")) return;

        try {
            await PaymentService.cancelOrder(c_code);

            setOrders(prev =>
                prev.map(item =>
                    item.c_code === c_code
                        ? { ...item, f_dstatus: -1 }
                        : item
                )
            );

            await loadOrders()
            alert("주문이 취소되었습니다.");
        } catch (error) {
            console.error("주문취소 실패", error);
            alert(error.response?.data?.message || "주문취소에 실패했습니다.");
        }
    };

    const onAddCanceledOrderToCart = async (item) => {
        if (!window.confirm("취소된 상품을 다시 장바구니에 담으시겠습니까?")) return;

        try {
            await CartService.addCart({
                cart: {
                    f_code: item.f_code,
                    f_count: item.f_count,
                    f_addr: item.f_addr || user?.addr || "",
                    f_name: item.f_name || user?.name || "",
                    f_tel: item.f_tel || user?.tel || "",
                    f_price: item.f_price,
                    f_point: item.f_point
                },
                options: (item.options || []).map(option => ({
                    co_select: option.co_select,
                    co_text: option.co_text,
                    co_count: option.co_count || item.f_count,
                    co_price: option.co_price
                }))
            });

            await loadOrders()
            alert("장바구니에 다시 담았습니다.");
            navigate("/cart");
        } catch (error) {
            console.error("장바구니 담기 실패", error);
            alert("장바구니 담기에 실패했습니다.");
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

    const getFilteredOrders = () => {
        if (statusFilter === "all") return orders;

        if (statusFilter === "ready") {
            return orders.filter(item =>
                [0, 1].includes(Number(item.f_dstatus))
            );
        }

        if (statusFilter === "done") {
            return orders.filter(item =>
                [4, 5].includes(Number(item.f_dstatus))
            );
        }

        return orders.filter(item => Number(item.f_dstatus) === Number(statusFilter));
    };

    const onConfirmOrder = async (c_code) => {
        console.log("구매확정 클릭", c_code);

        if (!window.confirm("구매확정 하시겠습니까?")) return;

        try {
            console.log("구매확정 요청 시작");
            await PaymentService.confirmOrder(c_code);
            console.log("구매확정 요청 성공");

            await loadOrders();

            alert("구매확정되었습니다.");
        } catch (error) {
            console.error("구매확정 실패", error);
            alert(error.response?.data?.message || "구매확정에 실패했습니다.");
        }
    };

    const statusCards = [
        {
            key: "ready",
            label: "배송준비중",
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
        return <Loading/>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h3 style={{ marginBottom: "18px" }}>
                나의 주문처리 현황{" "}
            </h3>

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
                        background: "white",
                        cursor: "pointer"
                    }}
                >
                    취소 : {countByStatus(-1)}

                </button>

                <button
                    type="button"
                    style={{
                        padding: "18px",
                        border: "none",
                        borderRight: "1px solid #ddd",
                        background: "white"
                    }}
                >
                    교환 : 0
                </button>

                <button
                    type="button"
                    style={{
                        padding: "18px",
                        border: "none",
                        background: "white"
                    }}
                >
                    반품 : 0
                </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ margin: 0 }}>주문내역 조회</h3>

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
                        주문 내역이 없습니다.
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
                                        ? `http://localhost:8080/api/images/FURNITURE/${item.thumbnail}`
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
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                            {Number(item.f_dstatus) === -1 && (
                                <button
                                    type="button"
                                    onClick={() => onAddCanceledOrderToCart(item)}
                                >
                                    다시 장바구니 담기
                                </button>
                            )}

                            {[0, 1].includes(Number(item.f_dstatus)) && (
                                <button
                                    type="button"
                                    onClick={() => onCancelOrder(item.c_code)}
                                >
                                    주문취소
                                </button>
                            )}

                            {[2, 3, 4].includes(Number(item.f_dstatus)) && (
                                <>
                                    <button type="button">
                                        교환신청
                                    </button>

                                    <button type="button">
                                        반품신청
                                    </button>
                                </>
                            )}

                            {Number(item.f_dstatus) === 3 && (
                                <button type="button">
                                    배송조회
                                </button>
                            )}

                            {Number(item.f_dstatus) === 4 && (
                                <button
                                    type="button"
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
                                <button
                                    type="button"
                                    onClick={() => navigate(`/furniture/review/${item.f_code}`)}
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
                            )}
                        </div>

                            </div>

                    ))
                )}
            </div>
        </div>
    );
};

export default UserOrderPage;
