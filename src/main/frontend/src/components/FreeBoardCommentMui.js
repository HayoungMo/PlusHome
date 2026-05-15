import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    List,
} from "@mui/material";

import FreeBoardCommentService from "../service/freeBoardCommentService";
import FreeBoardCommentItemMui from "./FreeBoardCommentItemMui";
import ConfirmDialog from "./ConfirmDialog";
import SnackbarAlert from "./SnackbarAlert";

const FreeBoardCommentMui = ({ boardId, loginUser, onCommentCountChange }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");

    // 삭제 확인 다이얼로그
    const [deleteDialog, setDeleteDialog] = useState({ open: false, commentId: null });
    // 알림 스낵바
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const isAdmin = loginUser?.type === "admin";
    const currentBoardId = Number(boardId);

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const loadComments = useCallback(async () => {
        try {
            const userType = loginUser?.type || "guest";
            const list = await FreeBoardCommentService.getComments(boardId, userType);
            const processedList = (list || []).map((comment) => ({
                ...comment,
                userName: comment.userName?.trim() || "탈퇴한 회원",
            }));
            setComments(processedList);
        } catch {
            showSnack("댓글을 불러오지 못했습니다.", "error");
        }
    }, [boardId, loginUser]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // 댓글 등록
    const handleCommentSubmit = async () => {
        if (!loginUser) {
            showSnack("로그인 후 이용 가능합니다.", "warning");
            return;
        }
        if (!commentContent.trim()) {
            showSnack("댓글 내용을 입력해주세요.", "warning");
            return;
        }
        const newComment = {
            boardId: currentBoardId,
            content: commentContent.trim(),
            userId: loginUser.id,
            userName: loginUser.name,
            parentId: null,
        };
        try {
            await FreeBoardCommentService.writeComment(newComment);
            setCommentContent("");
            await loadComments();
            if (onCommentCountChange) onCommentCountChange(1);
        } catch {
            showSnack("댓글 등록 실패", "error");
        }
    };

    // 대댓글 등록
    const handleReply = async (parentId, content) => {
        if (!loginUser) {
            showSnack("로그인 후 이용 가능합니다.", "warning");
            return;
        }
        const newReply = {
            boardId: currentBoardId,
            content,
            userId: loginUser.id,
            userName: loginUser.name,
            parentId,
        };
        try {
            await FreeBoardCommentService.writeComment(newReply);
            await loadComments();
            if (onCommentCountChange) onCommentCountChange(1);
        } catch {
            showSnack("답글 등록 실패", "error");
        }
    };

    // 댓글 수정
    const handleUpdate = async (commentId, content) => {
        try {
            await FreeBoardCommentService.updateComment({ commentId, content });
            await loadComments();
            showSnack("댓글이 수정되었습니다.", "success");
        } catch {
            showSnack("수정 실패", "error");
        }
    };

    // 삭제 요청 → 다이얼로그 열기
    const handleDeleteRequest = (commentId) => {
        setDeleteDialog({ open: true, commentId });
    };

    // 삭제 확정
    const handleDeleteConfirm = async () => {
        const { commentId } = deleteDialog;
        setDeleteDialog({ open: false, commentId: null });
        try {
            await FreeBoardCommentService.deleteComment(boardId, commentId);
            showSnack("삭제되었습니다.", "success");
            loadComments();
        } catch (error) {
            if (error?.response?.status === 401) {
                showSnack("로그인 정보가 없거나 만료되었습니다. 다시 로그인해 주세요.", "error");
            } else if (error?.response?.status === 403) {
                showSnack("삭제 권한이 없습니다. (본인 댓글만 삭제 가능)", "error");
            } else {
                showSnack("삭제 중 서버 오류가 발생했습니다.", "error");
            }
        }
    };

    const byCreatedDesc = (a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return (b?.commentId || 0) - (a?.commentId || 0);
    };

    const rootComments = comments.filter((c) => !c.parentId).slice().sort(byCreatedDesc);
    const repliesOf = (commentId) =>
        comments.filter((c) => c.parentId === commentId).slice().sort(byCreatedDesc);

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                댓글 {comments.length}개
            </Typography>

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <TextField
                    placeholder={
                        loginUser ? "따뜻한 댓글을 남겨주세요." : "로그인 후 댓글을 남겨보세요."
                    }
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!loginUser}
                />
                {/* 댓글 등록 — primary contained */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCommentSubmit}
                    sx={{ minWidth: 80, height: "fit-content", py: 1.5 }}
                    disabled={!loginUser}
                >
                    등록
                </Button>
            </Stack>

            <List sx={{ p: 0 }}>
                {rootComments.map((c) => (
                    <React.Fragment key={c.commentId}>
                        <FreeBoardCommentItemMui
                            comment={c}
                            isReply={false}
                            loginUser={loginUser}
                            isAdmin={isAdmin}
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteRequest}
                            onReply={handleReply}
                        />
                        {repliesOf(c.commentId).map((r) => (
                            <FreeBoardCommentItemMui
                                key={r.commentId}
                                comment={r}
                                isReply={true}
                                loginUser={loginUser}
                                isAdmin={isAdmin}
                                onUpdate={handleUpdate}
                                onDelete={handleDeleteRequest}
                                onReply={handleReply}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </List>

            {/* 삭제 확인 다이얼로그 */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="댓글 삭제"
                message="정말 삭제하시겠습니까?"
                confirmLabel="삭제"
                confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteDialog({ open: false, commentId: null })}
            />

            {/* 결과 알림 */}
            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </Box>
    );
};

export default FreeBoardCommentMui;
