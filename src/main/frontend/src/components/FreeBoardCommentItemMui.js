import React, { useState } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    Avatar,
    Chip,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import PersonIcon from "@mui/icons-material/Person";

/**
 * 댓글 단일 아이템 컴포넌트
 * - 댓글/대댓글 렌더링, 수정, 삭제, 답글 입력 UI 담당
 * - 등록/수정/삭제는 props 콜백으로 부모에 위임
 *
 * props:
 *   comment            : 댓글 DTO (commentId, userId, userName, content, createdAt 등)
 *   isReply            : 대댓글 여부 (true 면 들여쓰기 + 답글 버튼 숨김)
 *   loginUser          : 로그인 유저 객체 (없으면 null)
 *   isAdmin            : 관리자(type=admin) 여부
 *   onUpdate           : (commentId, content) => Promise
 *   onDelete           : (commentId) => Promise
 *   onReply            : (parentId, content) => Promise
 */
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

    // 댓글 권한: 본인이거나 관리자(type=admin)
    const hasAuthority =
        isAdmin || (loginUser && loginUser.id === comment.userId);

    const handleEditStart = () => {
        setEditContent(comment.content || "");
        setEditing(true);
    };

    const handleEditCancel = () => {
        setEditing(false);
        setEditContent(comment.content || "");
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    const handleDeleteClick = () => {
        if (!window.confirm("댓글을 삭제할까요?")) return;
        onDelete(comment.commentId);
    };

    const handleReplyToggle = () => {
        setReplyOpen((prev) => !prev);
        setReplyContent("");
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            alert("답글 내용을 입력해주세요.");
            return;
        }
        await onReply(comment.commentId, replyContent.trim());
        setReplyOpen(false);
        setReplyContent("");
    };

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                pl: isReply ? 6 : 2,
                bgcolor: isReply ? "action.hover" : "transparent",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <ListItemAvatar>
                <Avatar
                    sx={{
                        bgcolor: isReply ? "secondary.light" : "primary.light",
                    }}
                >
                    {isReply ? (
                        <ReplyIcon fontSize="small" />
                    ) : (
                        <PersonIcon fontSize="small" />
                    )}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                disableTypography
                primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                            {comment.userName}
                            {comment.userType === "admin" && (
                                <Chip
                                    label="관리자"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        ml: 0.5,
                                    }}
                                />
                            )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {comment.createdAt}
                        </Typography>
                    </Stack>
                }
                secondary={
                    <Box sx={{ mt: 1 }}>
                        {editing ? (
                            <Stack spacing={1}>
                                <TextField
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    size="small"
                                    multiline
                                    fullWidth
                                />
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleEditSave}
                                    >
                                        저장
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={handleEditCancel}
                                    >
                                        취소
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <>
                                <Typography
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-wrap" }}
                                >
                                    {comment.content}
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ mt: 0.5 }}
                                >
                                    {!isReply && loginUser && (
                                        <Button
                                            size="small"
                                            onClick={handleReplyToggle}
                                        >
                                            답글
                                        </Button>
                                    )}
                                    {hasAuthority && (
                                        <>
                                            <Button
                                                size="small"
                                                onClick={handleEditStart}
                                            >
                                                수정
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={handleDeleteClick}
                                            >
                                                삭제
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </>
                        )}
                        {!isReply && replyOpen && !editing && (
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 1 }}
                            >
                                <TextField
                                    size="small"
                                    placeholder="답글 입력"
                                    value={replyContent}
                                    onChange={(e) =>
                                        setReplyContent(e.target.value)
                                    }
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleReplySubmit}
                                >
                                    등록
                                </Button>
                            </Stack>
                        )}
                    </Box>
                }
            />
        </ListItem>
    );
};

export default FreeBoardCommentItemMui;
