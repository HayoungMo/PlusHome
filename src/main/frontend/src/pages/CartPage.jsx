import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartService from "../service/cartService";
import FurnitureService from "../service/furnitureService";

const CartPage = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [selectedMap, setSelectedMap] = useState({});

    const allSelected =
        cart.length > 0 && cart.every(item => selectedMap[item.c_code]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await CartService.getMyCart();
            const cartList = res.data || [];

            const cartWithDetail = await Promise.all(
                cartList.map(async item => {
                    const optionRes = await CartService.getCartOptions(item.c_code);
                    const furnitureRes = await FurnitureService.getFurnitureItem(item.f_code);

                    const furniture = furnitureRes || {};
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

            setCart(cartWithDetail);
        } catch (error) {
            console.error("장바구니 조회 실패", error);
            alert("장바구니 조회 실패");
        }
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedMap({});
            return;
        }

        const next = {};

        cart.forEach(item => {
            next[item.c_code] = true;
        });

        setSelectedMap(next);
    };

    const toggleSelect = (c_code) => {
        setSelectedMap(prev => ({
            ...prev,
            [c_code]: !prev[c_code]
        }));
    };

    const selectedItems = cart.filter(item => selectedMap[item.c_code]);

    const getOptionPrice = (item) => {
        return (item.options || []).reduce(
            (sum, option) => sum + Number(option.co_price || 0),
            0
        );
    };

    const getItemProductPrice = (item) => {
        return (Number(item.f_price || 0) + getOptionPrice(item)) * Number(item.f_count || 0);
    };

    const getItemDeliveryFee = (item) => {
        const productPrice = getItemProductPrice(item);
        const deliveryPrice = Number(
            item.furniture?.f_deliveryPrice ??
            item.furniture?.f_deliveryprice ??
            0
        );
        
        return productPrice >= 50000 ? 0 : deliveryPrice;
    };


    const selectedProductTotal = selectedItems.reduce((sum, item) => {
        return sum + getItemProductPrice(item);
    }, 0);

    const selectedDeliveryTotal = selectedItems.reduce((sum, item) => {
        return sum + getItemDeliveryFee(item);
    }, 0);


    const selectedPayTotal =
        selectedProductTotal + selectedDeliveryTotal;

    const removeItem = async (c_code) => {
        if (!window.confirm("장바구니에서 삭제하시겠습니까?")) return;

        try {
            await CartService.deleteCart(c_code);

            setCart(prev => prev.filter(item => item.c_code !== c_code));

            setSelectedMap(prev => {
                const next = { ...prev };
                delete next[c_code];
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
                selectedItems.map(item => CartService.deleteCart(item.c_code))
            );

            const selectedCodes = selectedItems.map(item => item.c_code);

            setCart(prev =>
                prev.filter(item => !selectedCodes.includes(item.c_code))
            );

            setSelectedMap({});

            alert("선택 상품이 삭제되었습니다.");
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
                payTotal: selectedPayTotal
            }
        });
    };


    if (cart.length === 0) {
        return <div>텅</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h3>장바구니</h3>

            <label>
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                />
                전체 선택
            </label>

            <button
                type="button"
                onClick={removeSelectedItems}
                style={{ marginLeft: "10px" }}
            >
                선택 삭제
            </button>

            {cart.map(item => (
                <div
                    key={item.c_code}
                    style={{
                        border: "1px solid #ddd",
                        padding: "15px",
                        marginBottom: "10px"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={!!selectedMap[item.c_code]}
                        onChange={() => toggleSelect(item.c_code)}
                        onClick={(evt) => evt.stopPropagation()}
                    />

                    <div
                        onClick={() => onArticle(item.f_code)}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            gap: "15px",
                            marginTop: "10px"
                        }}
                    >
                        <img
                            src={
                                item.thumbnail
                                    ? `http://localhost:8080/api/images/FURNITURE/${item.thumbnail}`
                                    : "/no-image.png"
                            }
                            alt={item.furniture?.f_name || item.f_code}
                            style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover"
                            }}
                        />

                        <div>
                            <h4>{item.furniture?.f_name || item.f_code}</h4>
                            <p>업체명: {item.furniture?.c_name || "-"}</p>

                            {(item.options || []).map((option, index) => (
                                <p key={index}>
                                    옵션: {option.co_select} - {option.co_text}
                                    {Number(option.co_price) > 0
                                        ? ` (+${Number(option.co_price).toLocaleString()}원)`
                                        : ""}
                                </p>
                            ))}

                            <p>수량: {item.f_count}</p>
                            <p>상품 금액: {getItemProductPrice(item).toLocaleString()}원</p>
                            <p>
                                배송비:{" "}
                                {getItemDeliveryFee(item) === 0
                                    ? "무료배송"
                                    : `${getItemDeliveryFee(item).toLocaleString()}원`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => removeItem(item.c_code)}
                        style={{ marginTop: "10px" }}
                    >
                        삭제
                    </button>
                </div>
            ))}

            <hr />

            <h3>선택 상품금액: {selectedProductTotal.toLocaleString()}원</h3>
            <h3>선택 배송비: {selectedDeliveryTotal.toLocaleString()}원</h3>
            <h2>총 결제금액: {selectedPayTotal.toLocaleString()}원</h2>

            <button onClick={onPayment}>구매하기</button>
        </div>
    );
};

export default CartPage;
