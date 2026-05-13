import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../service/paymentService';
import WalletService from '../service/walletService';

const PaymentPage = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const {
        items = [],
        productTotal = 0,
        deliveryTotal = 0,
        payTotal = 0
    }= location.state || {}
    
    const defaultReceiver = {
        f_name: user.name || "",
        f_tel: user.tel || "",
        f_addr: user.addr || ""
    };

    const [addressMode, setAddressMode] = useState("default");
    const [receiver, setReceiver] = useState(defaultReceiver);
    const [newReceiver, setNewReceiver] = useState({
        f_name: "",
        f_tel: "",
        f_addr: ""
    });

    const [couponDiscount, setCouponDiscount] = useState(0);
    const [walletMoney, setWalletMoney] = useState(0)
    const [modalOpen, setModalOpen] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payMessage, setPayMessage] = useState("");

    const selectedReceiver = addressMode === "default" ? receiver : newReceiver;

    const finalPayTotal = Math.max(
            0,
            Number(payTotal || 0) - Number(couponDiscount || 0)
    )

    const lackMoney = Math.max(0, finalPayTotal - walletMoney);
    const afterPayMoney = walletMoney - finalPayTotal;
    const canPay = walletMoney >= finalPayTotal;

    useEffect(()=> {
        if(!user.id) return

        WalletService.getMyWallet(user.id)
        .then((wallet)=> {
            setWalletMoney(Number(wallet?.money || 0))
        })
        .catch((error)=> {
            console.error("지갑 조회 실패", error)
            setWalletMoney(0)
        })
    },[user.id])

    const changeNewReceiver = (evt) => {
        const { name, value } = evt.target;

        setNewReceiver(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onPayClick = () => {
        if(items.length === 0){
            alert("결제할 상품이 없습니다.")
            return
        }

        if (!selectedReceiver.f_name || !selectedReceiver.f_tel || !selectedReceiver.f_addr) {
            alert("배송 정보를 입력해주세요.");
            return;
        }

        setPayMessage("")
        setModalOpen(true)
    }

    const onConfirmPay = async () => {
        if(!canPay){
            setPayMessage("지갑 잔액이 부족합니다.")
            return
        }
        try{
            setPaying(true)
            setPayMessage("지갑 잔액을 확인하고 있습니다.")

            await PaymentService.pay({
                c_codeList: items.map(item => item.c_code),
                f_name: selectedReceiver.f_name,
                f_tel: selectedReceiver.f_tel,
                f_addr: selectedReceiver.f_addr,
                productTotal,
                deliveryTotal,
                couponDiscount,
                payTotal: finalPayTotal
            })

            setWalletMoney((prev)=> prev - finalPayTotal)
            setPayMessage("결제가 완료되었습니다.");

            setTimeout(() => {
                navigate("/payment/success",{
                    state: {
                        payTotal: finalPayTotal,
                        items
                    }
                });
            }, 800);

        }catch(error){
            console.error("결제 실패", error);
            
            const serverMessage = error.response?.data?.message

            setPayMessage(
                serverMessage && serverMessage !== "No message available"
                ? serverMessage
                : "결제 처리 중 오류가 발생했습니다. \n서버 결제 API를 확인해주세요."
            );
        } finally{
            setPaying(false)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h3>결제</h3>

            <section>
                <h4>배송지</h4>

                <label>
                    <input
                        type="radio"
                        checked={addressMode === "default"}
                        onChange={() => setAddressMode("default")}
                    />
                    기본 배송지
                </label>

                <div style={{ border: "1px solid #ddd", padding: "10px" }}>
                    <p>받는 사람: {receiver.f_name}</p>
                    <p>연락처: {receiver.f_tel}</p>
                    <p>주소: {receiver.f_addr}</p>
                </div>

                <label>
                    <input
                        type="radio"
                        checked={addressMode === "new"}
                        onChange={() => setAddressMode("new")}
                    />
                    새 배송지 입력
                </label>

                {addressMode === "new" && (
                    <div>
                        <label>수령인: </label>
                        <input
                            name="f_name"
                            value={newReceiver.f_name}
                            onChange={changeNewReceiver}
                            placeholder="받는 사람"
                        />
                        <br />

                        <label>전화번호: </label>
                        <input
                            name="f_tel"
                            value={newReceiver.f_tel}
                            onChange={changeNewReceiver}
                            placeholder="연락처"
                        />
                        <br />

                        <label>주소: </label>
                        <input
                            name="f_addr"
                            value={newReceiver.f_addr}
                            onChange={changeNewReceiver}
                            placeholder="주소"
                        />
                    </div>
                )}
            </section>

            <hr />

            <section>
                <h4>주문 상품</h4>

                {items.map((item) => (
                    <div
                        key={item.c_code}
                        style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            marginBottom: "10px"
                        }}
                    >
                        <div style={{ display: "flex", gap: "12px" }}>
                            <img
                                src={
                                    item.thumbnail
                                        ? `http://localhost:8080/api/images/FURNITURE/${item.thumbnail}`
                                        : "/no-image.png"
                                }
                                alt={item.furniture?.f_name || item.f_code}
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    objectFit: "cover"
                                }}
                            />

                            <div>
                                <p>{item.furniture?.f_name || item.f_name}</p>
                                <p>업체명: {item.furniture?.c_name}</p>
                                <p>수량: {item.f_count}</p>

                                {(item.options || []).map((option, index) => (
                                    <p key={index}>
                                        {option.co_select}: {option.co_text}
                                        {Number(option.co_price) > 0
                                            ? ` (+${Number(option.co_price).toLocaleString()}원)`
                                            : ""}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <p>
                            상품금액:{" "}
                            {(
                                (Number(item.f_price || 0) +
                                    (item.options || []).reduce(
                                        (sum, option) => sum + Number(option.co_price || 0),
                                        0
                                    )) *
                                Number(item.f_count || 0)
                            ).toLocaleString()}
                            원
                        </p>
                    </div>
                ))}
            </section>

            <hr />

            <section>
                <h4>쿠폰</h4>

                <select
                    value={couponDiscount}
                    onChange={(evt) => setCouponDiscount(Number(evt.target.value))}
                >
                    <option value={0}>쿠폰 선택 안 함</option>
                    <option value={3000}>3,000원 할인 쿠폰</option>
                    <option value={5000}>5,000원 할인 쿠폰</option>
                </select>
            </section>

            <hr />

            <section>
                <h4>결제 금액</h4>
                <p>상품금액: {productTotal.toLocaleString()}원</p>
                <p>배송비: {deliveryTotal.toLocaleString()}원</p>
                <p>쿠폰할인: -{couponDiscount.toLocaleString()}원</p>
                <h3>최종 결제금액: {finalPayTotal.toLocaleString()}원</h3>

                <hr />

                <p>지갑 잔액: {walletMoney.toLocaleString()}원</p>

                {lackMoney > 0 && (
                    <p style={{ color: "red" }}>
                        부족 금액: {lackMoney.toLocaleString()}원
                    </p>
                )}

                <button type="button" onClick={() => navigate("/mypage")}>
                    지갑 충전하기
                </button>
            </section>

            <button type="button" onClick={onPayClick}>
                결제하기
            </button>

            {modalOpen && (
    <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
        }}
    >
        <div
            style={{
                width: "420px",
                background: "white",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)"
            }}
        >
            <h3 style={{ marginTop: 0 }}>결제 확인</h3>

            <div
                style={{
                    border: "1px solid #ddd",
                    padding: "14px",
                    marginBottom: "14px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>상품금액</span>
                    <strong>{productTotal.toLocaleString()}원</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <span>배송비</span>
                    <strong>{deliveryTotal.toLocaleString()}원</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <span>쿠폰할인</span>
                    <strong>-{couponDiscount.toLocaleString()}원</strong>
                </div>
            </div>

            <div
                style={{
                    border: "1px solid #ddd",
                    padding: "14px",
                    marginBottom: "14px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>현재 지갑 잔액</span>
                    <strong>{walletMoney.toLocaleString()}원</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <span>결제 후 잔액</span>
                    <strong
                        style={{
                            color: afterPayMoney < 0 ? "red" : "black"
                        }}
                    >
                        {afterPayMoney.toLocaleString()}원
                    </strong>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #ddd",
                    paddingTop: "14px",
                    marginBottom: "18px"
                }}
            >
                <span>최종 결제금액</span>
                <strong style={{ fontSize: "22px" }}>
                    {finalPayTotal.toLocaleString()}원
                </strong>
            </div>

            {payMessage && (
                <p
                    style={{
                    color: payMessage.includes("완료") ? "green" : "red",
                    whiteSpace: "pre-line"
                    }}
                >
                    {payMessage}
                </p>
            )}

            {lackMoney > 0 && (
                <button
                    type='button'
                    onClick={()=> navigate("/mypage")}
                    style={{marginBottom: "12px"}}
                >
                        지갑 충전하기
                </button>
            )} 

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                        type="button"
                        disabled={paying}
                        onClick={() => setModalOpen(false)}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        disabled={paying || !canPay}
                        onClick={onConfirmPay}
                        style={{
                            background: "black",
                            color: "white",
                            padding: "8px 16px",
                            border: "none",
                            cursor: paying || !canPay ? "not-allowed" : "pointer"
                        }}
                    >
                        {canPay ? "결제" : "잔액 부족"}
                    </button>
                </div>
            </div>
        </div>
)}

        </div>
    );
};

export default PaymentPage;