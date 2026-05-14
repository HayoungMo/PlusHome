import React from "react";

const getClaimStatusText = (status) => {
    switch (Number(status)) {
        case -1:
            return "거절";
        case 0:
            return "신청완료";
        case 1:
            return "접수완료";
        case 2:
            return "처리중";
        case 3:
            return "처리완료";
        default:
            return "상태확인중";
    }
};

const OrderClaimInfo = ({ item, openedImages, onToggleImages }) => {
    if (!item.claimed) return null;

    return (
        <>
            <p style={{ color: "#555" }}>
                {Number(item.claim_type) === 1 ? "교환" : "반품"} 상태:{" "}
                {getClaimStatusText(item.claim_status)}
            </p>

            {item.claim_code && (
                <button
                    type="button"
                    onClick={() => onToggleImages(item)}
                    style={{
                        border: "1px solid #ddd",
                        background: "white",
                        padding: "6px 10px",
                        cursor: "pointer"
                    }}
                >
                    신청 내용 {openedImages ? "닫기" : "보기"}
                </button>
            )}

            {item.claim_code && openedImages && (
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "10px",
                        flexWrap: "wrap"
                    }}
                >
                    <p style={{ color: "#555", width: "100%" }}>
                        신청 사유: {item.claim_reason}
                    </p>

                    {openedImages.length === 0 ? (
                        <p style={{ color: "#777" }}>첨부 이미지가 없습니다.</p>
                    ) : (
                        openedImages.map((img) => (
                            <img
                                key={img.img_name}
                                src={`http://localhost:8080/api/images/CLAIM/${img.img_name}`}
                                alt=""
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    objectFit: "cover",
                                    border: "1px solid #ddd"
                                }}
                            />
                        ))
                    )}
                </div>
            )}
        </>
    );
};

export default OrderClaimInfo;
