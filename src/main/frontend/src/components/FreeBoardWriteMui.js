import React, { useState, useEffect } from "react";
import {
    Container,
    Paper,
    Typography,
    Box,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";




const FreeBoardWriteMui = ({ initialData, onSave, onCancel, isAdmin }) => {
    const CATEGORYOPTIONS = isAdmin 
        ? ["자유", "질문", "정보", "공지"] 
        : ["자유", "질문", "정보"];

        // 이게 없어요!
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "자유",
    });

    const [errors, setErrors] = useState({ title: false, content: false });

    // 수정 모드: 기존 데이터 주입
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                category: initialData.category || "자유",
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleSubmit = () => {
        const nextErrors = {
            title: !formData.title.trim(),
            content: !formData.content.trim(),
        };
        setErrors(nextErrors);
        if (nextErrors.title || nextErrors.content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }
        onSave({
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
        });
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {initialData ? "게시글 수정" : "게시글 작성"}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="category-label">카테고리</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            label="카테고리"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {CATEGORYOPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        name="title"
                        label="제목"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요 (최대 200자)"
                        inputProps={{ maxLength: 200 }}
                        error={errors.title}
                        helperText={
                            errors.title
                                ? "제목을 입력해주세요."
                                : `${formData.title.length}/200`
                        }
                        fullWidth
                        required
                    />

                    <TextField
                        name="content"
                        label="내용"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="내용을 입력하세요"
                        multiline
                        minRows={12}
                        error={errors.content}
                        helperText={errors.content ? "내용을 입력해주세요." : " "}
                        fullWidth
                        required
                    />
                </Stack>

                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<CloseIcon />}
                        onClick={onCancel}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                    >
                        {initialData ? "수정 완료" : "등록"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default FreeBoardWriteMui;
