import React, { useEffect, useState, useMemo } from "react";
import "../css/freeboard.css";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import SnackbarAlert from "../components/SnackbarAlert";
import Loading from "../components/Loading";
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
const isAdminUser = (u) => !!u && u.type === "admin";
const WRITE_PERMISSIONS = {
    user:    ["자유", "질문", "정보"],
    company: ["자유", "정보", "이벤트", "광고"],
    admin:   ["자유", "질문", "정보", "이벤트", "광고", "공지"],
};
const getCategoryOptions = (userType) => WRITE_PERMISSIONS[userType] || WRITE_PERMISSIONS.user;

const FreeBoardEditPage = () => {
    const { boardId } = useParams();
    const navigate    = useNavigate();
    const currentBoardId = Number(boardId);

    const loginUser = useMemo(() => getLoginUser(), []);
    const [initialData, setInitialData] = useState(null);
    const [formData, setFormData]       = useState({ title: "", content: "", category: "" });
    const [errors, setErrors]           = useState({ title: false, content: false });
    const [snack, setSnack]             = useState({ open: false, message: "", severity: "success" });

    const showSnack  = (message, severity = "success") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    useEffect(() => {
        const fetchAndCheckAuth = async () => {
            try {
                const data = await FreeBoardService.getFreeBoard(boardId);
                if (!data) {
                    showSnack("존재하지 않는 게시글입니다.", "error");
                    setTimeout(() => navigate("/freeboard/list"), 1000);
                    return;
                }
                if (!loginUser) {
                    showSnack("로그인이 필요합니다.", "warning");
                    setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
                    return;
                }

                const isAdmin  = isAdminUser(loginUser);
                const isAuthor = String(data.userId) === String(loginUser.id);
                if (!isAdmin && !isAuthor) {
                    showSnack("수정 권한이 없습니다. 작성자 본인만 가능합니다.", "error");
                    setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
                    return;
                }

                const CATEGORYOPTIONS = getCategoryOptions(loginUser?.type || "user");
                const defaultCategory = CATEGORYOPTIONS.includes(data.category) ? data.category : CATEGORYOPTIONS[0];

                setInitialData(data);
                setFormData({ title: data.title || "", content: data.content || "", category: defaultCategory });
            } catch {
                showSnack("게시글을 불러오는 중 오류가 발생했습니다.", "error");
                setTimeout(() => navigate("/freeboard/list"), 1000);
            }
        };
        fetchAndCheckAuth();
    }, [boardId, navigate, loginUser]);

    const CATEGORYOPTIONS = getCategoryOptions(loginUser?.type || "user");

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
            await FreeBoardService.updateFreeBoard({
                boardId:  currentBoardId,
                title:    formData.title.trim(),
                content:  formData.content.trim(),
                category: formData.category,
            });
            showSnack("수정되었습니다.", "success");
            setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
        } catch {
            showSnack("수정 중 오류가 발생했습니다.", "error");
        }
    };

    if (!initialData) {
        return (
            <>
                <Loading type="skeleton" message="데이터를 불러오는 중 입니다." />
                <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
            </>
        );
    }

    return (
        <>
            <Container maxWidth="md" className="fb-write-page">
                <Paper elevation={2} className="fb-write-card">
                    <Typography variant="h5" className="fb-write-title">게시글 수정</Typography>
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
                            onClick={() => navigate(`/freeboard/article/${boardId}`)}
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
                            수정 완료
                        </Button>
                    </div>
                </Paper>
            </Container>

            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        </>
    );
};

export default FreeBoardEditPage;
