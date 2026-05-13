import React from 'react';
import {useLocation, useNavigate} from "react-router-dom";

const PaymentSuccessPage = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const { payTotal = 0, items = [] } = location.state || {}

    return (
        <div style={{ padding: "20px"}}>
            <h3>결제가 완료되었습니다. </h3>

            <p>결제 금액: {Number(payTotal || 0).toLocaleString()}원</p>
            <p>주문 상품 수: {items.length}개</p>

            <button type="button" onClick={()=> navigate("/userpage?menu=orders")}>
                주문 내역 보기
            </button>
            
            <button
                type='button'
                onClick={()=> navigate("/furniture/list")}
                style={{ marginLeft: "10px" }}
            >
                쇼핑 계속 하기
            </button>

        </div>
    );
};

export default PaymentSuccessPage;