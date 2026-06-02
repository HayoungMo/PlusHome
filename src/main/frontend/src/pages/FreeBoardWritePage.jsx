import React, { useState, useEffect, useMemo } from "react";
import "../css/freeboard.css";
import { useNavigate } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import SnackbarAlert from "../components/SnackbarAlert";
import {
    Container, Paper, Typography, Divider,
    TextField, FormControl, InputLabel, Select, MenuItem, Button,
} from "@mui/material";
import SaveIcon  from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

// ── 인라인 유틸 (components/freeboard/constants 제거)
const getLoginUser = () => {
    try { const r = localStorage.getItem("user"); return r ? JSON.parse(r) : null; }
    catch { return null; }
};
const WRITE_PERMISSIONS = {
    user:    ["자유", "질문", "정보"],
    company: ["자유", "정보", "이벤트", "광고"],
    admin:   ["자유", "질문", "정보", "이벤트", "광고", "공지"],
};
const getCategoryOptions = (userType) => WRITE_PERMISSIONS[userType] || WRITE_PERMISSIONS.user;

const FreeBoardWritePage = () => {
    const navigate  = useNavigate();
    const loginUser = useMemo(() => getLoginUser(), []);
    const CATEGORYOPTIONS = getCategoryOptions(loginUser?.type || "user");

    const [formData, setFormData] = useState({
        title: "", content: "", category: CATEGORYOPTIONS[0] || "자유",
    });
    const [errors, setErrors] = useState({ title: false, content: false });
    const [snack, setSnack]   = useState({ open: false, message: "", severity: "success" });

    const showSnack  = (message, severity = "success") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    useEffect(() => {
        if (!loginUser) navigate("/login", { replace: true });
    }, [loginUser, navigate]);

    if (!loginUser) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        const nextErrors = { title: !formData.title.trim(), content: !formData.content.trim() };
        setErrors(nextErrors);
        if (nextErrors.title || nextErrors.content) { showSnack("제목과 내용을 입력해주세요.", "warning"); return; }
        try {
            await FreeBoardService.insertFreeBoard({
                title:    formData.title.trim(),
                content:  formData.content.trim(),
                category: formData.category,
                userId:   loginUser.id,
                userName: loginUser.name,
            });
            showSnack("게시글이 등록되었습니다.", "success");
            setTimeout(() => navigate("/freeboard/list"), 1000);
        } catch (error) {
            const status = error?.response?.status;
            const msg    = error?.response?.data;
            if (status === 403)      showSnack(typeof msg === "string" ? msg : "해당 카테고리에 작성 권한이 없습니다.", "error");
            else if (status === 401) { showSnack("로그인이 필요합니다.", "warning"); setTimeout(() => navigate("/login"), 1000); }
            else                     showSnack("게시글 등록에 실패했습니다.", "error");
        }
    };

    return (
        <>
            <Container maxWidth="md" className="fb-write-page">
                <Paper elevation={2} className="fb-write-card">
                    <Typography variant="h5" className="fb-write-title">게시글 작성</Typography>
                    <Divider className="fb-write-divider" />

                    <div className="fb-write-fields">
                        <FormControl fullWidth size="small">
                            <InputLabel id="category-label">카테고리</InputLabel>
                            <Select labelId="category-label" name="category" label="카테고리"
                                value={formData.category} onChange={handleChange}>
                                {CATEGORYOPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <TextField
                            className="fb-write-field-title"
                            name="title" label="제목" value={formData.title} onChange={handleChange}
                            placeholder="제목을 입력하세요 (최대 200자)" inputProps={{ maxLength: 200 }}
                            error={errors.title}
                            helperText={errors.title ? "제목을 입력해주세요." : `${formData.title.length}/200`}
                            fullWidth required
                        />

                        <TextField
                            name="content" label="내용" value={formData.content} onChange={handleChange}
                            placeholder="내용을 입력하세요" multiline minRows={12}
                            error={errors.content} helperText={errors.content ? "내용을 입력해주세요." : " "}
                            fullWidth required
                        />
                    </div>

                    <div className="fb-write-actions">
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<CloseIcon />}
                            onClick={() => navigate("/freeboard/list")}
                            className="fb-write-cancel-btn"
                        >
                            취소
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            className="fb-write-submit-btn"
                        >
                            등록
                        </Button>
                    </div>
                </Paper>
            </Container>

            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        </>
    );
};

export default FreeBoardWritePage;
