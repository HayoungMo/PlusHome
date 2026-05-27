import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";

import OrderClaimService from "../service/orderClaimService";
import ImageService from "../service/imageService";

const OrderClaimModal = ({ open, item, claimType, onClose, onSuccess, onError }) => {
    const [claimReason, setClaimReason] = useState("");
    const [claimFiles, setClaimFiles] = useState([]);
    const [claimPreview, setClaimPreview] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setClaimReason("");
            setClaimFiles([]);
            setClaimPreview([]);
        }
    }, [open, item?.c_code, claimType]);

    useEffect(() => {
        return () => {
            claimPreview.forEach(src => URL.revokeObjectURL(src));
        };
    }, [claimPreview]);

    const onChangeClaimImages = (evt) => {
        const files = Array.from(evt.target.files || []);

        claimPreview.forEach(src => URL.revokeObjectURL(src));

        setClaimFiles(files);
        setClaimPreview(files.map(file => URL.createObjectURL(file)));
    };

    const showError = (message) => {
        onError?.(message);
    };

    const onCreateClaim = async () => {
        if (!item || submitting) return;

        if (!claimReason.trim()) {
            showError("교환/반품 사유를 입력해주세요.");
            return;
        }

        const validClaimFiles = claimFiles.filter(file => file instanceof File);

        if (validClaimFiles.length === 0) {
            showError("교환/반품 증빙 이미지를 1개 이상 등록해주세요.");
            return;
        }

        try {
            setSubmitting(true);

            const result = await OrderClaimService.createClaim({
                c_code: item.c_code,
                f_code: item.f_code,
                claim_type: claimType,
                claim_reason: claimReason.trim(),
            });

            const claimCode = result?.data?.claim_code ?? result?.claim_code;

            if (!claimCode) {
                throw new Error("교환/반품 신청 번호를 확인할 수 없습니다.");
            }

            await ImageService.insertImage(
                validClaimFiles.map((file, index) => ({
                    img_kind: "CLAIM",
                    img_tag: index === 0 ? "THUMBNAIL" : "OTHER",
                    img_idx: index,
                    dir_a: claimCode,
                    dir_d: localStorage.getItem("id"),
                    file,
                }))
            );

            await onSuccess?.({
                c_code: item.c_code,
                claim_type: claimType,
                claim_status: 0,
                claim_code: claimCode,
                claim_reason: claimReason.trim(),
            });

            onClose();
            
        } catch (error) {
            console.error("교환/반품 신청 실패", error);
            showError(error.response?.data?.message || "교환/반품 신청에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {claimType === 1 ? "교환 신청" : "반품 신청"}
            </DialogTitle>

            <DialogContent>
                <p style={{ color: "#555", marginTop: 0 }}>
                    {item?.furniture?.f_name || item?.f_code}
                </p>

                <TextField
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    placeholder="사유를 입력해주세요."
                    multiline
                    minRows={4}
                    fullWidth
                    disabled={submitting}
                    margin="normal"
                />

                <p style={{ fontSize: "13px", color: "#777", marginTop: "10px" }}>
                    상품 자체에 대한 자세한 문의는 상품 문의 페이지를 이용해주세요.
                </p>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={submitting}
                    onChange={onChangeClaimImages}
                />

                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    {claimPreview.map((src, index) => (
                        <img
                            key={src}
                            src={src}
                            alt=""
                            style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                border: "1px solid #ddd",
                            }}
                        />
                    ))}
                </div>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onCreateClaim}
                    variant="contained"
                    disabled={submitting}
                    sx={{ backgroundColor: "black" }}
                >
                    신청
                </Button>

                <Button onClick={onClose} disabled={submitting}>
                    취소
                </Button>
                
            </DialogActions>
        </Dialog>
    );
};

export default OrderClaimModal;