import React, { useState } from "react";
import {
    Box, Stack, Typography, TextField, Button, Avatar, Chip,
    ListItem, ListItemAvatar, ListItemText
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import PersonIcon from "@mui/icons-material/Person";
import FreeBoardReportButton from "./freeboard/FreeBoardReportButton";
import SnackbarAlert from "./SnackbarAlert";
import { getPermissions, ADMIN_TYPE } from "./freeboard/constants";

const FreeBoardCommentItemMui = ({
    comment,
    isReply = false,
    loginUser,
    isAdmin,
    onUpdate,
    onDelete,
    onReply,
}) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || "");
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [snack, setSnack] = useState({ open: false, message: "", severity: "warning" });

    // 권한 중앙 계산
    const { canEdit, canDelete, canReport, canComment } = getPermissions(loginUser, comment);
    const hasAuthority = canEdit || canDelete;

    const showSnack = (message, severity = "warning") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const handleDeleteClick = (e) => {
        if (e) e.stopPropagation();
        onDelete(comment.commentId);
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) {
            showSnack("내용을 입력해주세요.");
            return;
        }
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            showSnack("답글 내용을 입력해주세요.");
            return;
        }
        await onReply(comment.commentId, replyContent.trim());
        setReplyOpen(false);
        setReplyContent("");
    };

    return (
        <>
            <ListItem
                alignItems="flex-start"
                sx={{
                    pl: isReply ? 6 : 2,
                    bgcolor: isReply ? "action.hover" : "transparent",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: isReply ? "action.selected" : "action.hover" },
                }}
            >
                <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isReply ? "secondary.light" : "primary.light" }}>
                        {isReply ? <ReplyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
                                {comment.userName}
                                {(comment.userType === ADMIN_TYPE || comment.userId === "admin1") && (
                                    <Chip
                                        label="관리자"
                                        size="small"
                                        color="primary"
                                        sx={{ height: 16, fontSize: "0.6rem", ml: 0.5, fontWeight: "bold" }}
                                    />
                                )}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#aec4ed" }}>
                                {comment.createdAt}
                            </Typography>
                        </Stack>
                    }
                    secondary={
                        <Box sx={{ mt: 1 }}>
                            {editing ? (
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    <TextField
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        size="small"
                                        multiline
                                        fullWidth
                                        autoFocus
                                    />
                                    {/* 내부 버튼 — outlined */}
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" variant="outlined" color="primary" onClick={handleEditSave}>
                                            저장
                                        </Button>
                                        <Button size="small" variant="outlined" color="inherit" onClick={() => setEditing(false)}>
                                            취소
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                <>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.primary", mb: 1 }}>
                                        {comment.content}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        {!isReply && canComment && (
                                            <Button size="small" variant="text" onClick={() => setReplyOpen(!replyOpen)}>
                                                {replyOpen ? "답글취소" : "답글"}
                                            </Button>
                                        )}
                                        {hasAuthority && (
                                            <>
                                                <Button size="small" variant="text" onClick={() => setEditing(true)}>
                                                    수정
                                                </Button>
                                                <Button size="small" variant="text" color="error" onClick={handleDeleteClick}>
                                                    삭제
                                                </Button>
                                            </>
                                        )}
                                        {canReport && (
                                            <FreeBoardReportButton targetType="comment" targetId={comment.commentId} />
                                        )}
                                    </Stack>
                                </>
                            )}

                            {/* 답글 입력창 */}
                            {!isReply && replyOpen && !editing && (
                                <Stack direction="row" spacing={1} sx={{ mt: 2, pb: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="답글 내용을 입력하세요..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        fullWidth
                                    />
                                    {/* 내부 등록 — primary outlined */}
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={handleReplySubmit}
                                        sx={{ minWidth: 60 }}
                                    >
                                        등록
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    }
                />
            </ListItem>

            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </>
    );
};

export default FreeBoardCommentItemMui;
