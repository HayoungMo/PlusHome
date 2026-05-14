import React, { useState, useEffect } from "react";
import OrderClaimService from "../service/orderClaimService";
import ImageService from "../service/imageService";

const OrderClaimModal = ({ open, item, claimType, onClose, onSuccess }) => {
    const [claimReason, setClaimReason] = useState("");
    const [claimFiles, setClaimFiles] = useState([]);
    const [claimPreview, setClaimPreview] = useState([]);

    useEffect(()=>{
        if(open){
            setClaimReason("")
            setClaimFiles([])
            setClaimPreview([])
        }
    },[open,item?.c_code,claimType])
    
    if (!open) return null;

    const onChangeClaimImages = (evt) => {
        const files = Array.from(evt.target.files || []);

        setClaimFiles(files);
        setClaimPreview(files.map(file => URL.createObjectURL(file)));
    };

    const onCreateClaim = async () => {
        if (!item) return;

        if (!claimReason.trim()) {
            alert("교환/반품 사유를 입력해주세요.");
            return;
        }

        const validClaimFiles = claimFiles.filter(file => file instanceof File);

        if (validClaimFiles.length === 0) {
            alert("교환/반품 증빙 이미지를 1개 이상 등록해주세요.");
            return;
        }

        try {
            const result = await OrderClaimService.createClaim({
                c_code: item.c_code,
                f_code: item.f_code,
                claim_type: claimType,
                claim_reason: claimReason
            });

            const claimCode = result.claim_code;

            await ImageService.insertImage(
                validClaimFiles.map((file, index) => ({
                    img_kind: "CLAIM",
                    img_tag: index === 0 ? "THUMBNAIL" : "OTHER",
                    img_idx: index,
                    dir_a: claimCode,
                    dir_d: localStorage.getItem("id"),
                    file
                }))
            );

            await onSuccess();

            alert(
                claimType === 1
                    ? "교환 신청이 접수되었습니다."
                    : "반품 신청이 접수되었습니다."
            );

            onClose();
        } catch (error) {
            console.error("교환/반품 신청 실패", error);
            alert(error.response?.data?.message || "교환/반품 신청에 실패했습니다.");
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
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
                    padding: "24px",
                    border: "1px solid #ddd"
                }}
            >
                <h3 style={{ marginTop: 0 }}>
                    {claimType === 1 ? "교환 신청" : "반품 신청"}
                </h3>

                <p style={{ color: "#555" }}>
                    {item?.furniture?.f_name || item?.f_code}
                </p>

                <textarea
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    placeholder="사유를 입력해주세요."
                    style={{
                        width: "100%",
                        minHeight: "120px",
                        resize: "vertical",
                        padding: "10px",
                        boxSizing: "border-box"
                    }}
                />

                <p style={{ fontSize: "13px", color: "#777", marginTop: "10px" }}>
                    상품 자체에 대한 자세한 문의는 상품 문의 페이지를 이용해주세요.
                </p>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onChangeClaimImages}
                />

                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    {claimPreview.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt=""
                            style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                border: "1px solid #ddd"
                            }}
                        />
                    ))}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: "16px"
                    }}
                >
                    <button type="button" onClick={onClose}>
                        취소
                    </button>

                    <button
                        type="button"
                        onClick={onCreateClaim}
                        style={{
                            background: "black",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            cursor: "pointer"
                        }}
                    >
                        신청
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderClaimModal;
